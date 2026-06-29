from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.database_models import AgentRun, Customer, Recommendation, UploadedFile
from backend.app.schemas.customer import CustomerDetailResponse, CustomerResponse, CustomerCreate

router = APIRouter(tags=["Customers"])


@router.get("/customers", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    """Fetch all customer accounts with health scores and risk profiles."""
    return db.query(Customer).all()


@router.post("/customer", response_model=CustomerResponse)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer profile and initialize memory."""
    existing = db.query(Customer).filter(Customer.company_name == customer.company_name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A customer with this company name already exists."
        )
    
    db_customer = Customer(
        name=customer.name,
        company_name=customer.company_name,
        email=customer.email,
        health_score=customer.health_score,
        risk_level=customer.risk_level,
        renewal_date=customer.renewal_date,
        nps=customer.nps,
        domain=customer.domain,
        contract_start_date=customer.contract_start_date,
        industry=customer.industry,
        plan=customer.plan
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    
    # Initialize customer memories with a 'joined' event
    from backend.app.memory.memory_model import CustomerMemory
    db_memory = CustomerMemory(
        customer_id=db_customer.id,
        interaction_type="joined",
        content=f"Registered account profile for {db_customer.name} ({db_customer.company_name}). Onboarding sequence initiated.",
        health_score=db_customer.health_score,
        risk_level=db_customer.risk_level,
        outcome="completed"
    )
    db.add(db_memory)
    db.commit()
    
    return db_customer


@router.get("/customer/{id}", response_model=CustomerDetailResponse)
def get_customer(id: int, db: Session = Depends(get_db)):
    """Retrieve detailed customer profile, file logs, recommendations, and execution runs."""
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {id} not found",
        )

    uploads = db.query(UploadedFile).filter(UploadedFile.customer_id == id).all()
    recommendations = db.query(Recommendation).filter(Recommendation.customer_id == id).all()
    agent_runs = db.query(AgentRun).filter(AgentRun.customer_id == id).all()

    return CustomerDetailResponse(
        id=customer.id,
        name=customer.name,
        company_name=customer.company_name,
        email=customer.email,
        health_score=customer.health_score,
        risk_level=customer.risk_level,
        renewal_date=customer.renewal_date,
        nps=customer.nps,
        domain=customer.domain,
        created_at=customer.created_at,
        uploads=[
            {
                "id": upload.id,
                "filename": upload.filename,
                "file_type": upload.file_type,
                "file_size": upload.file_size,
                "status": upload.status,
                "uploaded_at": upload.uploaded_at,
            }
            for upload in uploads
        ],
        recommendations=[
            {
                "id": rec.id,
                "customer_id": rec.customer_id,
                "primary_action": rec.primary_action,
                "confidence_score": rec.confidence_score,
                "business_impact": rec.business_impact,
                "status": rec.status,
                "reasoning": rec.reasoning,
                "evidence": rec.evidence,
                "alternative_actions": rec.alternative_actions,
                "agent_run_id": rec.agent_run_id,
                "created_at": rec.created_at,
            }
            for rec in recommendations
        ],
        agent_runs=[
            {
                "id": run.id,
                "task_id": run.task_id,
                "status": run.status,
                "current_agent": run.current_agent,
                "created_at": run.created_at,
            }
            for run in agent_runs
        ],
    )
