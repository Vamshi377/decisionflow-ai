import logging
from typing import List, Dict, Any
from pydantic import BaseModel

logger = logging.getLogger("ai.services.knowledge")

class PlaybookMatch(BaseModel):
    playbook_id: str
    title: str
    relevance_score: float
    evidence_text: str

class KnowledgeResponse(BaseModel):
    matches: List[PlaybookMatch]

class KnowledgeService:
    """
    RAG Playbook matcher. Finds reference mitigation strategies
    from enterprise database records based on extracted signals.
    """
    def __init__(self, vector_store=None):
        self.vector_store = vector_store  # Qdrant placeholder client

    def match_playbooks(self, signals: List[Dict[str, Any]]) -> Dict[str, Any]:
        logger.info("Matching company playbooks for %d signals", len(signals))
        
        # Determine signal types to match playbooks dynamically
        signal_types = {s.get("type") for s in signals}
        matches = []
        
        if "unhappy" in signal_types or "renewal_risk" in signal_types:
            matches.append(PlaybookMatch(
                playbook_id="CS-PB-402",
                title="Sponsor Risk Escalation Flow",
                relevance_score=0.94,
                evidence_text="Playbook dictates scheduling a joint executive steering review and requesting product feedback."
            ))
            
        if "usage" in signal_types:
            matches.append(PlaybookMatch(
                playbook_id="CS-PB-109",
                title="Product Adoption Recovery",
                relevance_score=0.88,
                evidence_text="Mandates immediate coordination with Solutions Architects to run performance logs."
            ))
            
        if "payment" in signal_types:
            matches.append(PlaybookMatch(
                playbook_id="CS-PB-305",
                title="Grace-Period Payment Adjustments",
                relevance_score=0.85,
                evidence_text="Outlines protocol for temporary license extension during vendor setup transitions."
            ))
            
        # Default playbook fallback
        if not matches:
            matches.append(PlaybookMatch(
                playbook_id="CS-PB-001",
                title="Standard Renewal Sequence",
                relevance_score=0.75,
                evidence_text="Initiate review meeting 90 days before expiration. Verify licensing requirements."
            ))
            
        response = KnowledgeResponse(matches=matches)
        logger.info("Matched %d playbooks successfully", len(response.matches))
        return response.model_dump()
