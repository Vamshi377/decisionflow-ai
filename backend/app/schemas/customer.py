from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class CustomerBase(BaseModel):
    name: str
    company_name: str
    email: EmailStr
    health_score: int
    risk_level: str
    renewal_date: datetime
    nps: int
    domain: str
    contract_start_date: Optional[datetime] = None
    industry: Optional[str] = "Tech"
    plan: Optional[str] = "Basic"

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CustomerDetailResponse(CustomerResponse):
    uploads: List[dict] = []
    recommendations: List[dict] = []
    agent_runs: List[dict] = []

    class Config:
        from_attributes = True
