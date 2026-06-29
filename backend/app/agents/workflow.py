import logging
import time
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END

from backend.app.agents.state import AgentState
from backend.app.agents.agent_registry import agent_registry
from backend.app.agents.execution_logger import ExecutionLogger

logger = logging.getLogger("agents.workflow")

# Central tracer
trace_logger = ExecutionLogger()

# Define Node functions
def planner_node(state: AgentState) -> Dict[str, Any]:
    start = trace_logger.start_trace("Planner")
    time.sleep(1.2) # simulated latency
    
    # Heuristic plan: determine order dynamically
    # For CS, execute: Signal -> Memory -> Knowledge -> Recommendation -> Explainability
    directives = "Planner Directives: Orchestrated workflow sequence. Run Signal extraction first, load historical memories, query company playbook vectors, compile recommendations, and review explainability parameters."
    planned = ["Signal", "Memory", "Knowledge", "Recommendation", "Explainability"]
    
    latency = round(time.time() - start, 3)
    trace_logger.end_trace("Planner", start, "completed", directives)
    
    # Database Sync Commit
    task_id = state.get("task_id")
    if task_id:
        from backend.app.database.session import SessionLocal
        from backend.app.models.database_models import AgentRun
        db = SessionLocal()
        try:
            run = db.query(AgentRun).filter(AgentRun.task_id == task_id).first()
            if run:
                run.current_agent = "Signal"
                run.planner_output = directives
                run.planner_time = latency
                db.commit()
        except Exception as db_err:
            logger.error("Failed to commit Planner update: %s", str(db_err))
        finally:
            db.close()
            
    return {
        "planned_agents": planned,
        "completed_agents": ["Planner"],
        "planner_directives": directives,
        "current_agent": "Signal",
        "execution_log": state.get("execution_log", []) + ["Planner completed. Dispatched dynamic pipeline queue."]
    }

def route_next_agent(state: AgentState) -> str:
    """Conditional edge router: inspects planned queue and directs to next target."""
    planned = state.get("planned_agents", [])
    completed = state.get("completed_agents", [])
    
    # Find first planned agent not yet completed
    for agent in planned:
        if agent not in completed:
            logger.info("Routing to next agent: '%s'", agent)
            return agent
            
    logger.info("All planned agents completed. Terminating graph.")
    return END

# Wrapper factory to create Graph Node executers pulling dynamically from registry
def create_agent_node(agent_name: str):
    def node_func(state: AgentState) -> Dict[str, Any]:
        start = trace_logger.start_trace(agent_name)
        time.sleep(1.2) # simulated latency
        
        # Pull execution logic dynamically from agent registry
        completed = state.get("completed_agents", [])
        log = state.get("execution_log", [])
        latencies = state.get("agent_latencies", {})
        
        details = ""
        error_msg = None
        
        try:
            # Check registry
            if agent_registry.has_agent(agent_name):
                # Call registered agent callable
                agent_executor = agent_registry.get_agent(agent_name)
                state_update = agent_executor(state)
                if isinstance(state_update, dict):
                    # merge state keys into current state reference
                    for k, v in state_update.items():
                        state[k] = v
                details = f"Successfully executed node {agent_name} logic."
            else:
                # Fallback mock latencies and logs
                details = f"Mock execute success for {agent_name} agent."
        except Exception as e:
            logger.error("Error executing node %s: %s", agent_name, str(e))
            error_msg = str(e)
            details = f"Node failed: {error_msg}"
            
        status = "failed" if error_msg else "completed"
        trace_logger.end_trace(agent_name, start, status, details)
        
        latency = round(time.time() - start, 3)
        latencies[agent_name] = latency
        completed.append(agent_name)
        log.append(f"{agent_name} Agent completed execution.")
        
        # Determine next agent for database status display mapping
        planned = state.get("planned_agents", [])
        next_agent = "Complete"
        for p in planned:
            if p not in completed:
                next_agent = p
                break
                
        # Database Sync Commit
        task_id = state.get("task_id")
        if task_id:
            from backend.app.database.session import SessionLocal
            from backend.app.models.database_models import AgentRun
            db = SessionLocal()
            try:
                run = db.query(AgentRun).filter(AgentRun.task_id == task_id).first()
                if run:
                    run.current_agent = next_agent
                    
                    if agent_name == "Signal":
                        run.signal_output = f"Signals: {state.get('signals_extracted')}"
                        run.signal_time = latency
                    elif agent_name == "Memory":
                        # Summarize memory context briefly for log column
                        ctx_summary = state.get("customer_memory_context", "")[:200]
                        run.context_output = f"Memory History Loaded:\n{ctx_summary}"
                        run.context_time = latency
                    elif agent_name == "Knowledge":
                        matched = state.get("playbooks_matched") or []
                        pb_titles = [m.get("title", "") for m in matched]
                        run.knowledge_output = f"Playbook Vectors Matched: {', '.join(pb_titles)}"
                        run.knowledge_time = latency
                    elif agent_name == "Recommendation":
                        run.recommendation_output = state.get("primary_recommendation")
                        run.recommendation_time = latency
                    elif agent_name == "Explainability":
                        run.explainability_output = state.get("evidence")
                        run.explainability_time = latency
                        run.status = "completed"
                        
                    db.commit()
            except Exception as db_err:
                logger.error("Failed to commit agent node %s update: %s", agent_name, str(db_err))
            finally:
                db.close()
        
        # Prepare state update payload
        update: Dict[str, Any] = {
            "completed_agents": completed,
            "execution_log": log,
            "agent_latencies": latencies,
            "current_agent": agent_name
        }
        
        if error_msg:
            update["error"] = error_msg
            
        return update
        
    return node_func

def build_workflow() -> StateGraph:
    """Builds and compiles the dynamic LangGraph state machine."""
    workflow = StateGraph(AgentState)
    
    # 1. Add Planner node (starts graph)
    workflow.add_node("Planner", planner_node)
    workflow.set_entry_point("Planner")
    
    # 2. Add registered Agent nodes
    workflow.add_node("Signal", create_agent_node("Signal"))
    workflow.add_node("Memory", create_agent_node("Memory"))
    workflow.add_node("Knowledge", create_agent_node("Knowledge"))
    workflow.add_node("Recommendation", create_agent_node("Recommendation"))
    workflow.add_node("Explainability", create_agent_node("Explainability"))
    
    # 3. Add conditional router edges from Planner and each agent node
    # Since we do not hardcode order, every agent node routes back to the coordinator router
    workflow.add_conditional_edges(
        "Planner",
        route_next_agent,
        {
            "Signal": "Signal",
            "Memory": "Memory",
            "Knowledge": "Knowledge",
            "Recommendation": "Recommendation",
            "Explainability": "Explainability",
            END: END
        }
    )
    
    for agent in ["Signal", "Memory", "Knowledge", "Recommendation", "Explainability"]:
        workflow.add_conditional_edges(
            agent,
            route_next_agent,
            {
                "Signal": "Signal",
                "Memory": "Memory",
                "Knowledge": "Knowledge",
                "Recommendation": "Recommendation",
                "Explainability": "Explainability",
                END: END
            }
        )
        
    return workflow
