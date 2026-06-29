import logging
from typing import Dict, Any

from backend.app.ai.services.transcript_analyzer import TranscriptAnalyzer
from backend.app.ai.services.signal_service import SignalService
from backend.app.ai.services.knowledge_service import KnowledgeService
from backend.app.ai.services.recommendation_service import RecommendationService

logger = logging.getLogger("ai.services.coordinator")

class AIService:
    """
    Coordinates the entire decision intelligence pipeline:
    Transcript Text -> Transcript Analyzer -> Signal Extractor -> Playbook Matcher -> Recommendation Compiler.
    """
    def __init__(
        self,
        analyzer: TranscriptAnalyzer = None,
        signal_service: SignalService = None,
        knowledge_service: KnowledgeService = None,
        recommendation_service: RecommendationService = None
    ):
        self.analyzer = analyzer or TranscriptAnalyzer()
        self.signal_service = signal_service or SignalService()
        self.knowledge_service = knowledge_service or KnowledgeService()
        self.recommendation_service = recommendation_service or RecommendationService()

    def process_transcript(self, transcript_text: str, current_health: int = 100) -> Dict[str, Any]:
        logger.info("Triggering integrated AI Engine pipeline...")
        
        # 1. Analyze Transcript
        analysis = self.analyzer.analyze_transcript(transcript_text)
        customer_name = analysis.get("customer_name", "Unknown Corp")
        
        # 2. Extract Signals (Combine text analysis findings to structure platform signals)
        signals = []
        if analysis.get("sentiment") == "Negative" or analysis.get("urgency") == "High":
            signals.append({
                "type": "unhappy",
                "value": "Negative Account Sentiment",
                "description": f"Overall transcript sentiment assessed as negative. Blockers: {', '.join(analysis.get('issues', []))}",
                "severity": "high" if analysis.get("urgency") == "High" else "medium"
            })
            
        if analysis.get("renewal_risk") in ["High", "Medium"]:
            signals.append({
                "type": "renewal_risk",
                "value": "Renewal Contract Risk",
                "description": f"Churn threat indicated. Competitors mentioned: {analysis.get('competitor_mention')}.",
                "severity": "high" if analysis.get("renewal_risk") == "High" else "medium"
            })
            
        if analysis.get("issues"):
            signals.append({
                "type": "usage",
                "value": "Product Friction Alerts",
                "description": f"Client reporting blockers: {analysis.get('issues')[0]}",
                "severity": "medium"
            })
            
        if "budget" in analysis.get("budget_concerns", "").lower():
            signals.append({
                "type": "payment",
                "value": "Financial Friction",
                "description": analysis.get("budget_concerns"),
                "severity": "medium"
            })
            
        # Default standard signal
        if not signals:
            signals.append({
                "type": "sentiment",
                "value": "Stable Operations",
                "description": "Standard interaction. Sentiment is positive/neutral.",
                "severity": "low"
            })
            
        # 3. Match playbooks
        playbook_matches = self.knowledge_service.match_playbooks(signals)
        matches = playbook_matches.get("matches", [])
        
        # 4. Formulate Recommendation
        recommendation = self.recommendation_service.generate_recommendation(
            customer_name=customer_name,
            current_health=current_health,
            signals=signals,
            playbooks=matches
        )
        
        # Combine everything into final response
        return {
            "success": True,
            "transcript_analysis": analysis,
            "extracted_signals": signals,
            "playbooks_matched": matches,
            "decision": recommendation
        }

ai_service = AIService()
