from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class MemoryBase(BaseModel):
    customer_id: int
    interaction_type: str = Field(description="transcript, recommendation, decision, or email")
    content: str
    health_score: int = Field(default=100, ge=0, le=100)
    risk_level: str = Field(default="low")
    outcome: Optional[str] = None

class MemoryCreate(MemoryBase):
    pass

class MemoryUpdate(BaseModel):
    content: Optional[str] = None
    health_score: Optional[int] = Field(default=None, ge=0, le=100)
    risk_level: Optional[str] = None
    outcome: Optional[str] = None

class MemoryResponse(MemoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
