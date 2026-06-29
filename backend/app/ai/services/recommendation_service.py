import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from backend.app.ai.utils.gemini_client import gemini_client
from backend.app.ai.prompts.prompt_templates import RECOMMENDATION_PROMPT

logger = logging.getLogger("ai.services.recommendation")

class AlternativeAction(BaseModel):
    action: str
    confidence_score: float
    business_impact: str
    reasoning: str

class RecommendationResult(BaseModel):
    health_score: int = Field(ge=0, le=100)
    risk_level: str = Field(description="low, medium, or high")
    next_best_action: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    business_impact: str
    reasoning: str
    evidence: str
    alternative_actions: List[AlternativeAction]

class RecommendationService:
    """
    Formulates a final Next Best Action proposal by aggregating
    all analyzed signals and retrieved playbook recommendations.
    """
    def __init__(self, client=None):
        self.client = client or gemini_client

    def generate_recommendation(
        self,
        customer_name: str,
        current_health: int,
        signals: List[Dict[str, Any]],
        playbooks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        logger.info("Formulating decision recommendation for %s", customer_name)
        
        # Prepare template inputs
        signals_str = "\n".join(
            f"- [{s.get('type')}] {s.get('value')}: {s.get('description')} (Severity: {s.get('severity')})"
            for s in signals
        )
        playbook_str = "\n".join(
            f"- [{p.get('playbook_id')}] {p.get('title')}: {p.get('evidence_text')}"
            for p in playbooks
        )
        
        # Compile prompt
        prompt = RECOMMENDATION_PROMPT.format(
            customer_name=customer_name,
            health_score=current_health,
            signals=signals_str,
            evidence=playbook_str
        )
        
        # Call Gemini (Placeholder)
        _ = self.client.generate_content(prompt, json_mode=True)
        
        # Heuristic calculations for mock results based on signals
        has_high_severity = any(s.get("severity") == "high" for s in signals)
        has_medium_severity = any(s.get("severity") == "medium" for s in signals)
        
        # Adjust health score
        new_health = current_health
        if has_high_severity:
            new_health = max(15, current_health - 25)
        elif has_medium_severity:
            new_health = max(40, current_health - 10)
            
        # Determine risk level
        risk_level = "low"
        if new_health < 50:
            risk_level = "high"
        elif new_health < 75:
            risk_level = "medium"
            
        # Determine next best action based on matched playbooks
        next_action = "Schedule Standard License Check-in Review"
        reasoning = "The account is stable. Initiating normal scheduled renewal check-in."
        evidence = "No critical alerts triggered. Standard playbook matches apply."
        alternatives = []
        
        playbook_ids = {p.get("playbook_id") for p in playbooks}
        
        if "CS-PB-402" in playbook_ids:
            next_action = "Initiate Executive Sponsor Re-alignment & Churn Action Plan"
            reasoning = (
                f"Negative signals detected for customer {customer_name}. Health score dropped to {new_health}. "
                "Immediate executive contact is necessary to address unhappiness and contract renewal friction."
            )
            evidence = "1. Customer expressed direct unhappiness.\n2. Churn mitigation playbook mandates executive check-in for high risk."
            alternatives.append(AlternativeAction(
                action="Deploy Customer Success Manager for on-site technical workshop",
                confidence_score=0.78,
                business_impact="Medium",
                reasoning="Addresses technical bottlenecks directly, but lacks immediate executive contracting authority."
            ))
            
        if "CS-PB-109" in playbook_ids:
            if "CS-PB-402" not in playbook_ids:
                next_action = "Coordinate Solutions Architect Speed-Audit and Optimize API Logs"
                reasoning = "Product usage statistics indicate declining traffic due to speed friction. Architect audit is needed."
                evidence = "1. Usage drops detected by signal tracker.\n2. Playbook 109 advises offloading API log analysis."
            alternatives.append(AlternativeAction(
                action="Provide Product Training Webinar Sessions for End-Users",
                confidence_score=0.65,
                business_impact="Low",
                reasoning="Builds user engagement but does not fix underlying server response bottlenecks."
            ))
            
        if "CS-PB-305" in playbook_ids:
            alternatives.append(AlternativeAction(
                action="Offer Temporary Billing Extension Option",
                confidence_score=0.82,
                business_impact="Medium",
                reasoning="Mitigates invoice friction while purchasing system integration is completed."
            ))
            
        if not alternatives:
            alternatives.append(AlternativeAction(
                action="Send Self-Service Academy Training Resources",
                confidence_score=0.80,
                business_impact="Low",
                reasoning="Keeps product value fresh in mind during standard renewal phase."
            ))
            
        rec_result = RecommendationResult(
            health_score=new_health,
            risk_level=risk_level,
            next_best_action=next_action,
            confidence_score=0.88 if risk_level == "low" else 0.81,
            business_impact="High" if risk_level == "high" else "Medium",
            reasoning=reasoning,
            evidence=evidence,
            alternative_actions=alternatives
        )
        
        logger.info("Recommendation compiled successfully. Action: %s", rec_result.next_best_action)
        return rec_result.model_dump()
