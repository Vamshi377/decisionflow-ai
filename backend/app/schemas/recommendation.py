from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class AlternativeRecommendation(BaseModel):
    action: str
    confidence_score: float
    business_impact: str
    reasoning: str

class AlternativeActions(BaseModel):
    items: List[AlternativeRecommendation] = Field(default_factory=list)

class RecommendationBase(BaseModel):
    customer_id: int
    primary_action: str
    confidence_score: float
    business_impact: str
    status: str = "pending"
    reasoning: str
    evidence: str
    alternative_actions: Optional[AlternativeActions] = None

class RecommendationResponse(RecommendationBase):
    id: int
    agent_run_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DecisionRequest(BaseModel):
    status: str = Field(description="Must be 'approved', 'rejected', or 'modified'")
    user_name: Optional[str] = Field(default="Customer Success Manager", description="User performing the approval action")
    reason: Optional[str] = Field(default=None, description="Approval note or rejection reason")
    modified_action: Optional[str] = Field(default=None, description="Custom action string if modified")
    modified_priority: Optional[str] = Field(default=None, description="Custom priority level if modified")
    modified_follow_up: Optional[str] = Field(default=None, description="Custom follow up timeline if modified")

class AnalyzeRequest(BaseModel):
    customer_id: int
    file_id: Optional[int] = None
    notes: Optional[str] = None

class AgentStatusSchema(BaseModel):
    agent_name: str
    status: str  # queued, running, completed, failed
    progress: int  # 0 to 100
    execution_time: float
    output_summary: Optional[str] = None

class AgentExecutionResponse(BaseModel):
    task_id: str
    customer_id: int
    status: str  # running, completed, failed
    current_agent: str
    agents: List[AgentStatusSchema]
    created_at: datetime

    class Config:
        from_attributes = True
