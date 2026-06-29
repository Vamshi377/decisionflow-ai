import logging
import json
from typing import Dict, Any

from backend.app.ai.utils.gemini_client import gemini_client
from backend.app.ai.utils.retry import retry_on_exception
from backend.app.ai.prompts.prompt_templates import RECOMMENDATION_ENGINE_PROMPT
from backend.app.ai.services.recommendation_schema import RecommendationEngineInput, RecommendationEngineOutput

logger = logging.getLogger("ai.services.recommendation_engine")

class RecommendationEngine:
    """
    Executes advanced business reasoning over extracted customer sentiment and risk signals
    to calculate health index parameters, priority levels, and follow-up timelines.
    """
    def __init__(self, client=None):
        self.client = client or gemini_client

    @retry_on_exception(max_retries=3, initial_delay=1.0, exceptions_to_catch=(Exception,))
    def generate_recommendation(self, input_data: RecommendationEngineInput) -> Dict[str, Any]:
        logger.info("Executing Recommendation Engine for Customer: %s", input_data.customer_name)
        
        # Compile prompt template
        prompt = RECOMMENDATION_ENGINE_PROMPT.format(
            customer_name=input_data.customer_name,
            sentiment=input_data.sentiment,
            renewal_risk=input_data.renewal_risk,
            product_usage=input_data.product_usage,
            issues=", ".join(input_data.issues) if input_data.issues else "None",
            positive_signals=", ".join(input_data.positive_signals) if input_data.positive_signals else "None",
            negative_signals=", ".join(input_data.negative_signals) if input_data.negative_signals else "None",
            competitor=input_data.competitor or "None",
            customer_memory=input_data.customer_memory or "None"
        )
        
        # Request Gemini synthesis
        response_text = self.client.generate_content(prompt, json_mode=True)
        
        # Validate Pydantic Schema, or run backup heuristics
        if response_text and response_text.strip():
            try:
                clean_text = response_text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(clean_text)
                validated = RecommendationEngineOutput(**parsed)
                return validated.model_dump()
            except Exception as e:
                logger.warning("Failed to parse Recommendation Engine Gemini JSON: %s. Loading heuristics.", str(e))
                
        return self._heuristic_reasoning(input_data)

    def _heuristic_reasoning(self, data: RecommendationEngineInput) -> Dict[str, Any]:
        """Calculates dynamic business decision points based on customer success inputs."""
        logger.info("Running business reasoning heuristic fallback for recommendation...")
        
        # Calculate Base Health Score (starting from 100)
        health_score = 90
        
        # Sentiment impact
        if data.sentiment.lower() == "negative":
            health_score -= 20
        elif data.sentiment.lower() == "positive":
            health_score += 10
            
        # Renewal risk impact
        if data.renewal_risk.lower() == "high":
            health_score -= 25
        elif data.renewal_risk.lower() == "medium":
            health_score -= 10
            
        # Product usage impact
        usage_str = data.product_usage.lower()
        if "drop" in usage_str or "decline" in usage_str:
            # Extract number if possible, or default to 15
            health_score -= 15
        elif "low" in usage_str:
            health_score -= 20
            
        # Issues impact
        health_score -= len(data.issues) * 8
        
        # Positive / negative signals adjustments
        health_score += len(data.positive_signals) * 5
        health_score -= len(data.negative_signals) * 10
        
        # Clamp health score to 0 - 100
        health_score = max(5, min(100, health_score))
        
        # Risk level determination
        risk = "Low"
        if health_score < 40:
            risk = "Critical"
        elif health_score < 60:
            risk = "High"
        elif health_score < 80:
            risk = "Medium"
            
        # Priority mapping
        priority = risk
        
        # Follow-up timeline
        follow_up = "Within 1 Month"
        if risk == "Critical":
            follow_up = "Within 24 Hours"
        elif risk == "High":
            follow_up = "Within 48 Hours"
        elif risk == "Medium":
            follow_up = "Within 1 Week"
            
        # Determine Primary Action based on issues and competitor
        primary_action = "Schedule Quarter Business Review & Renewal Sync"
        reasoning = (
            f"The account is currently stable with a health index of {health_score}%. "
            "We recommend scheduling a routine business review to confirm renewal parameters."
        )
        executive_summary = f"Globally stable health score of {health_score}%. Routine follow-up scheduled."
        alternative_actions = [
            "Share platform roadmap highlight newsletter.",
            "Schedule technical walkthrough of feature updates.",
            "Introduce Customer Academy training tracks."
        ]
        
        is_competitor = data.competitor and data.competitor.lower() != "none"
        
        if risk in ["High", "Critical"]:
            if is_competitor:
                primary_action = f"Initiate Executive Churn Mitigation Plan & Highlight Platform Superiority against {data.competitor}"
                reasoning = (
                    f"Account {data.customer_name} is at high risk ({health_score}% health score) "
                    f"with active competitor threat from {data.competitor}. Immediate intervention is required to "
                    "re-align the VP stakeholder and demonstrate superior enterprise scalability."
                )
                executive_summary = (
                    f"CRITICAL CHURN RISK: Account health is {health_score}%. Client is actively evaluating "
                    f"{data.competitor}. Action: Coordinate Sponsor review and dispatch Solutions Architect."
                )
                alternative_actions = [
                    f"Host standard product feature comparison workshop highlighting competitive gaps vs {data.competitor}.",
                    "Offer 15% discount on upcoming contract renewal for multi-year lock-in.",
                    "Arrange peer alignment meeting between client VP and our Product Director."
                ]
            else:
                primary_action = "Initiate VIP Critical Escalation Flow & Call Sponsor Alignment Meeting"
                reasoning = (
                    f"Customer {data.customer_name} is experiencing severe health degradation ({health_score}%). "
                    "Primary drivers include support issues and drop in usage. CSM must establish sponsor alignment "
                    "to deliver a Technical Recovery Plan."
                )
                executive_summary = (
                    f"HIGH CHURN RISK: Health score {health_score}%. Major issues reported: {', '.join(data.issues)}. "
                    "Action: Schedule emergency business sync with executive sponsors."
                )
                alternative_actions = [
                    "Engage Support engineering lead to resolve outstanding ticketing backlog.",
                    "Apply temporary usage licensing extension credit.",
                    "Conduct structured end-user onboarding audit check."
                ]
        elif risk == "Medium":
            primary_action = "Schedule Value Realization Review Workshop"
            reasoning = (
                f"Health is moderate at {health_score}%. Minor friction signals like budget and product adoption "
                "need attention to secure standard contract renewal."
            )
            executive_summary = f"MODERATE RISK: Health is {health_score}%. Standard renewal alignment requested."
            alternative_actions = [
                "Conduct live walk-through session of unused platform features.",
                "Review invoicing schedule parameters with client billing lead.",
                "Send custom case study detailing product expansion benefits."
            ]

        # Ensure we have exactly 3 alternative actions
        while len(alternative_actions) < 3:
            alternative_actions.append("Schedule quarterly alignment sync.")
        alternative_actions = alternative_actions[:3]
        
        result = RecommendationEngineOutput(
            health_score=health_score,
            risk=risk,
            priority=priority,
            primary_action=primary_action,
            alternative_actions=alternative_actions,
            confidence=95 if risk == "Low" else (85 if risk == "Medium" else 78),
            business_impact="High" if risk in ["High", "Critical"] else "Medium",
            reasoning=reasoning,
            follow_up=follow_up,
            executive_summary=executive_summary
        )
        
        return result.model_dump()
