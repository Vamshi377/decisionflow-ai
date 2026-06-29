from pydantic import BaseModel, Field
from typing import List, Optional

class RecommendationEngineInput(BaseModel):
    customer_name: str
    sentiment: str
    renewal_risk: str
    product_usage: str
    issues: List[str] = []
    positive_signals: List[str] = []
    negative_signals: List[str] = []
    competitor: Optional[str] = "None"
    customer_memory: Optional[str] = "None"

class RecommendationEngineOutput(BaseModel):
    health_score: int = Field(ge=0, le=100, description="0-100 customer health index")
    risk: str = Field(description="Low, Medium, High, or Critical")
    priority: str = Field(description="Low, Medium, High, or Critical")
    primary_action: str = Field(description="Primary Next Best Action statement")
    alternative_actions: List[str] = Field(description="Three alternative mitigation actions")
    confidence: int = Field(ge=0, le=100, description="Percentage confidence in the recommendation (0-100)")
    business_impact: str = Field(description="Low, Medium, or High")
    reasoning: str = Field(description="Detailed business rationale for recommendations")
    follow_up: str = Field(description="Recommended follow-up timeline (e.g. Within 24 Hours)")
    executive_summary: str = Field(description="Detailed bulletproof summary for executive review")
