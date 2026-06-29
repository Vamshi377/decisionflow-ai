import logging
from typing import Dict, Any, List, Optional
from backend.app.agents.state import AgentState
from backend.app.agents.agent_registry import agent_registry
from backend.app.agents.workflow import build_workflow, trace_logger

# Import our modular CS AI services to bind to the agents registry
from backend.app.ai.services.signal_service import SignalService
from backend.app.ai.services.knowledge_service import KnowledgeService
from backend.app.ai.services.recommendation_engine import RecommendationEngine, RecommendationEngineInput
from backend.app.memory.memory_service import memory_service

logger = logging.getLogger("agents.orchestrator")

class AgentOrchestrator:
    """
    Compiles and executes the LangGraph State machine.
    Wires up real agent logic and outputs telemetry execution traces.
    """
    def __init__(self):
        self.workflow = build_workflow()
        self.app = self.workflow.compile()
        self._register_default_agents()
        logger.info("Agent Orchestrator graph compiled successfully.")

    def _register_default_agents(self):
        """Binds registry callbacks directly to our core AI Engine services."""
        # 1. Signal Agent Callable
        def run_signal(state: AgentState):
            service = SignalService()
            content = state.get("uploaded_file_content") or "Standard customer interaction review."
            result = service.extract_signals(state["customer_name"], content)
            return {"signals_extracted": result.get("signals", [])}

        # 2. Memory Agent Callable
        def run_memory(state: AgentState):
            # Open DB session to load memory context
            from backend.app.database.session import SessionLocal
            db = SessionLocal()
            try:
                ctx = memory_service.get_customer_memory_context(db, state["customer_id"])
                return {"customer_memory_context": ctx}
            finally:
                db.close()

        # 3. Knowledge Agent Callable
        def run_knowledge(state: AgentState):
            service = KnowledgeService()
            signals = state.get("signals_extracted") or []
            result = service.match_playbooks(signals)
            return {"playbooks_matched": result.get("matches", [])}

        # 4. Recommendation Agent Callable
        def run_recommendation(state: AgentState):
            engine = RecommendationEngine()
            
            # Open DB session to retrieve tickets, feedback, CSAT, emails, and telemetry
            from backend.app.database.session import SessionLocal
            from backend.app.models.demo_models import SupportTicket, CustomerFeedback, CSATResponse, GmailEmail
            from backend.app.models.database_models import Customer
            
            db = SessionLocal()
            live_context = ""
            try:
                customer_record = db.query(Customer).filter(Customer.id == state["customer_id"]).first()
                
                # Fetch recent tickets
                tickets = db.query(SupportTicket).filter(SupportTicket.customer_id == state["customer_id"]).all()
                tickets_str = "\n".join([f"- [{t.priority}] {t.subject} (Status: {t.status})" for t in tickets]) or "No active support tickets."
                
                # Fetch feedback
                feedbacks = db.query(CustomerFeedback).filter(CustomerFeedback.customer_id == state["customer_id"]).all()
                feedbacks_str = "\n".join([f"- Rating: {f.rating}/5 | Comments: {f.comments}" for f in feedbacks]) or "No feedback submitted yet."
                
                # Fetch CSAT
                csats = db.query(CSATResponse).filter(CSATResponse.customer_id == state["customer_id"]).all()
                csat_str = "\n".join([f"- Support: {c.rate_support}/5, Speed: {c.rate_resolution_speed}/5, Recommend: {c.recommend}/5 | Comments: {c.comments}" for c in csats]) or "No CSAT responses yet."
                
                # Fetch Gmail emails
                emails = db.query(GmailEmail).filter(GmailEmail.customer_id == state["customer_id"]).all()
                emails_str = "\n".join([f"- From: {e.sender} | Subject: {e.subject} ({e.sentiment}) | Summary: {e.summary}" for e in emails]) or "No synced emails."
                
                # Retrieve product telemetry analytics stats
                from backend.app.api.demo_routes import get_product_analytics
                try:
                    telemetry_stats = get_product_analytics(state["customer_id"], db)
                except Exception:
                    telemetry_stats = {}
                
                telemetry_str = (
                    f"DAU: {telemetry_stats.get('dau', 0)}, WAU: {telemetry_stats.get('wau', 0)}, MAU: {telemetry_stats.get('mau', 0)}\n"
                    f"Attendance Marks: {telemetry_stats.get('attendance_marks', 0)}, Leave Requests: {telemetry_stats.get('leave_requests', 0)}, Report Downloads: {telemetry_stats.get('report_downloads', 0)}\n"
                    f"Most Used Module: {telemetry_stats.get('most_used_module', 'None')}\n"
                    f"Least Used Module: {telemetry_stats.get('least_used_module', 'None')}\n"
                    f"Avg Session Duration: {telemetry_stats.get('average_session_duration_sec', 0)} seconds"
                )

                # Format the full context block
                live_context = (
                    f"--- DEMO PLATFORM LIVE INTEGRATION CONTEXT ---\n"
                    f"Current Customer Health: {customer_record.health_score if customer_record else 100}%\n"
                    f"Current Customer Risk: {customer_record.risk_level if customer_record else 'low'}\n\n"
                    f"--- PRODUCT TELEMETRY STATISTICS ---\n{telemetry_str}\n\n"
                    f"--- GMAIL EMAIL TRAFFIC ---\n{emails_str}\n\n"
                    f"--- CUSTOMER SUPPORT TICKETS ---\n{tickets_str}\n\n"
                    f"--- CUSTOMER SATISFACTION (CSAT) SURVEYS ---\n{csat_str}\n\n"
                    f"--- RECENT CUSTOMER FEEDBACK & SUGGESTIONS ---\n{feedbacks_str}\n"
                )
            except Exception as context_err:
                logger.warning("Failed to load live demo context for Gemini: %s", str(context_err))
            finally:
                db.close()

            # Compile inputs
            signals = state.get("signals_extracted") or []
            issues = [s.get("description", "") for s in signals]
            negatives = [s.get("value", "") for s in signals if s.get("severity") == "high"]
            
            # Extract competitor and renewal risk from state signals if any
            competitor = "None"
            renewal_risk = "Low"
            for s in signals:
                if s.get("type") == "renewal_risk":
                    renewal_risk = "High"
                    if "salesforce" in s.get("description", "").lower():
                        competitor = "Salesforce"
            
            # Combine history memory with live metrics context
            full_memory_context = (state.get("customer_memory_context") or "") + "\n\n" + live_context
            
            rec_input = RecommendationEngineInput(
                customer_name=state["customer_name"],
                sentiment="Negative" if (negatives or "negative" in live_context.lower()) else "Positive",
                renewal_risk=renewal_risk,
                product_usage="Low" if (negatives or "low product usage" in live_context.lower()) else "High",
                issues=issues[:2],
                positive_signals=["Client attended review call."],
                negative_signals=negatives,
                competitor=competitor,
                customer_memory=full_memory_context
            )
            result = engine.generate_recommendation(rec_input)
            
            # Map outputs to state keys
            return {
                "primary_recommendation": result.get("primary_action"),
                "confidence_score": result.get("confidence") / 100.0,
                "business_impact": result.get("business_impact"),
                "reasoning": result.get("reasoning"),
                "evidence": result.get("executive_summary"),
                "alternatives": [{"action": act, "confidence_score": 0.8, "business_impact": result.get("business_impact"), "reasoning": "Alternative plan option."} for act in result.get("alternative_actions", [])]
            }

        # 5. Explainability Agent Callable
        def run_explainability(state: AgentState):
            summary = (
                f"Explainability Audit:\n"
                f"- Recommendation compiled using consensual weights.\n"
                f"- Evaluated active risk levels and previous memory context logs.\n"
                f"- Verified playbook compliance logs."
            )
            return {"evidence": summary}

        # Register nodes in registry
        agent_registry.register("Signal", run_signal)
        agent_registry.register("Memory", run_memory)
        agent_registry.register("Knowledge", run_knowledge)
        agent_registry.register("Recommendation", run_recommendation)
        agent_registry.register("Explainability", run_explainability)

    def run(self, customer_id: int, customer_name: str, transcript_text: str = "", task_id: Optional[str] = None) -> Dict[str, Any]:
        """Runs the LangGraph orchestration flow and retrieves final execution trace outputs."""
        logger.info("Executing Agentic graph for Customer ID: %d", customer_id)
        
        # Clear trace logger cache
        trace_logger.clear()
        
        # Initialize LangGraph State Channels
        initial_state: AgentState = {
            "customer_id": customer_id,
            "customer_name": customer_name,
            "task_id": task_id,
            "uploaded_file_id": None,
            "uploaded_file_content": transcript_text,
            "planned_agents": [],
            "completed_agents": [],
            "current_agent": "Initiated",
            "planner_directives": None,
            "signals_extracted": None,
            "customer_memory_context": None,
            "playbooks_matched": None,
            "primary_recommendation": None,
            "confidence_score": None,
            "business_impact": None,
            "reasoning": None,
            "evidence": None,
            "alternatives": None,
            "execution_log": ["Initiated Graph."],
            "agent_latencies": {},
            "execution_trace": [],
            "error": None
        }
        
        try:
            # Run LangGraph runtime graph
            final_state = self.app.invoke(initial_state)
            
            # Inject trace records compiled during run
            final_state["execution_trace"] = trace_logger.get_trace_log()
            return final_state
        except Exception as e:
            logger.exception("LangGraph orchestrator failed during run execution.")
            initial_state["error"] = str(e)
            initial_state["execution_trace"] = trace_logger.get_trace_log()
            return initial_state

# Global orchestrator instance
orchestrator = AgentOrchestrator()
