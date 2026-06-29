import logging
from typing import List, Dict, Any
from pydantic import BaseModel, Field

from backend.app.ai.utils.gemini_client import gemini_client
from backend.app.ai.prompts.prompt_templates import SIGNAL_EXTRACTION_PROMPT

logger = logging.getLogger("ai.services.signal")

class CustomerSignal(BaseModel):
    type: str = Field(description="unhappy, renewal_risk, usage, sentiment, or payment")
    value: str = Field(description="Summary of the signal")
    description: str = Field(description="Specific detail or quote from the input")
    severity: str = Field(description="low, medium, or high")

class SignalExtractionResponse(BaseModel):
    signals: List[CustomerSignal]

class SignalService:
    """
    Analyzes transcripts or emails to extract key CS customer behavior signals.
    """
    def __init__(self, client=None):
        self.client = client or gemini_client

    def extract_signals(self, customer_name: str, text_content: str) -> Dict[str, Any]:
        logger.info("Extracting customer success signals for %s", customer_name)
        
        # Compile prompt
        prompt = SIGNAL_EXTRACTION_PROMPT.format(
            customer_name=customer_name,
            content=text_content
        )
        
        # Call Gemini (Placeholder)
        _ = self.client.generate_content(prompt, json_mode=True)
        
        # Smart heuristic fallback: scan content for keywords to generate realistic mock signals
        extracted_signals = []
        text_lower = text_content.lower()
        
        if any(w in text_lower for w in ["unhappy", "frustrated", "angry", "terrible", "bad", "disappointed"]):
            extracted_signals.append(CustomerSignal(
                type="unhappy",
                value="Negative Sentiment Escalation",
                description="Client expressed direct frustration or unhappiness regarding services.",
                severity="high"
            ))
            
        if any(w in text_lower for w in ["renew", "cancel", "churn", "contract", "30 days", "expiration"]):
            extracted_signals.append(CustomerSignal(
                type="renewal_risk",
                value="Upcoming Contract renewal friction",
                description="Mentions of contract dates or renegotiation timeline.",
                severity="high" if "cancel" in text_lower or "churn" in text_lower else "medium"
            ))
            
        if any(w in text_lower for w in ["slow", "speed", "usage", "inactive", "login", "rarely", "dropped"]):
            extracted_signals.append(CustomerSignal(
                type="usage",
                value="Product Adoption Decline",
                description="Technical bottleneck or drop in customer interface traffic detected.",
                severity="medium"
            ))
            
        if any(w in text_lower for w in ["payment", "invoice", "late", "billing", "charge", "price", "overdue"]):
            extracted_signals.append(CustomerSignal(
                type="payment",
                value="Overdue invoice alert",
                description="Billing disputes or accounts receivable delayed.",
                severity="medium"
            ))

        # Default fallback signal if none matched
        if not extracted_signals:
            extracted_signals.append(CustomerSignal(
                type="sentiment",
                value="Neutral Account Health",
                description="Standard account review interaction. No critical risk triggers found.",
                severity="low"
            ))
            
        result = SignalExtractionResponse(signals=extracted_signals)
        logger.info("Signals extracted successfully. Count: %d", len(result.signals))
        return result.model_dump()
