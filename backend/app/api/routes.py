import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.services.upload_service import UploadService
from backend.app.services.agent_service import AgentService
from backend.app.schemas.customer import CustomerResponse, CustomerDetailResponse, CustomerCreate
from backend.app.schemas.upload import UploadedFileResponse
from backend.app.schemas.recommendation import (
    RecommendationResponse, 
    AnalyzeRequest, 
    DecisionRequest,
    AgentExecutionResponse,
    AgentStatusSchema
)
from backend.app.models.database_models import Customer, Recommendation, UploadedFile, AgentRun, AuditLog

logger = logging.getLogger("api.routes")
router = APIRouter()

# 1. GET /health
@router.get("/health", tags=["System"])
def get_health(db: Session = Depends(get_db)):
    """Check application health and database session connectivity."""
    db_status = "healthy"
    try:
        # Simple test query
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error("Health check database failure: %s", str(e))
        db_status = "unhealthy"
        
    return {
        "status": "online",
        "database": db_status,
        "platform": "DecisionFlow AI",
        "version": "1.0.0-MVP"
    }

# 2. GET /customers
@router.get("/customers", response_model=List[CustomerResponse], tags=["Customers"])
def get_customers(db: Session = Depends(get_db)):
    """Fetch all customer accounts with health scores and risk profiles."""
    return db.query(Customer).all()

# 2b. POST /customer
@router.post("/customer", response_model=CustomerResponse, tags=["Customers"])
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
        domain=customer.domain
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

# 3. GET /customer/{id}
@router.get("/customer/{id}", response_model=CustomerDetailResponse, tags=["Customers"])
def get_customer(id: int, db: Session = Depends(get_db)):
    """Retrieve detailed customer profile, file logs, recommendations, and execution runs."""
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Customer with ID {id} not found"
        )
        
    # Build complete detail schema
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
        uploads=[{
            "id": u.id, "filename": u.filename, "file_type": u.file_type, 
            "file_size": u.file_size, "status": u.status, "uploaded_at": u.uploaded_at
        } for u in uploads],
        recommendations=[{
            "id": r.id, "primary_action": r.primary_action, "confidence_score": r.confidence_score,
            "business_impact": r.business_impact, "status": r.status, "reasoning": r.reasoning,
            "created_at": r.created_at
        } for r in recommendations],
        agent_runs=[{
            "id": run.id, "task_id": run.task_id, "status": run.status, 
            "current_agent": run.current_agent, "created_at": run.created_at
        } for run in agent_runs]
    )

# 4. POST /upload
@router.post("/upload", response_model=UploadedFileResponse, tags=["Uploads"])
async def upload_file(
    customer_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload CRM data, emails, or transcripts to process."""
    try:
        uploaded_file = await UploadService.process_upload(customer_id, file, db)
        return uploaded_file
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception("Upload routing error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Upload failed")

# 5. POST /analyze
@router.post("/analyze", tags=["Agentic Workflow"])
def analyze_customer(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Trigger background agentic reasoning pipeline (Planner -> Signal -> Knowledge -> Rec)."""
    try:
        task_id = AgentService.create_run(request.customer_id, db, background_tasks)
        return {
            "success": True,
            "message": "Analysis pipeline dispatched in background.",
            "task_id": task_id,
            "status": "running"
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception("Analyze routing error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Execution trigger failed")

# 6. GET /task/{task_id} (Execution Polling)
@router.get("/task/{task_id}", response_model=AgentExecutionResponse, tags=["Agentic Workflow"])
def get_task_status(task_id: str, db: Session = Depends(get_db)):
    """Poll agent execution state logs and times for the UI node visualizer."""
    run = db.query(AgentRun).filter(AgentRun.task_id == task_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Agent Run task {task_id} not found"
        )
        
    # Map steps to visual schemas
    agent_names = ["Planner", "Signal", "Memory", "Knowledge", "Recommendation", "Explainability"]
    agents_status = []
    
    # Calculate statuses based on current run progress
    current_agent_idx = agent_names.index(run.current_agent) if run.current_agent in agent_names else -1
    if run.status == "completed":
        current_agent_idx = len(agent_names)
        
    for idx, name in enumerate(agent_names):
        if idx < current_agent_idx:
            agent_status = "completed"
            progress = 100
        elif idx == current_agent_idx and run.status == "running":
            agent_status = "running"
            progress = 50
        elif run.status == "failed" and idx == current_agent_idx:
            agent_status = "failed"
            progress = 100
        else:
            agent_status = "queued"
            progress = 0
            
        # Select latencies
        latency_map = {
            "Planner": run.planner_time,
            "Signal": run.signal_time,
            "Memory": run.context_time,
            "Knowledge": run.knowledge_time,
            "Recommendation": run.recommendation_time,
            "Explainability": run.explainability_time
        }
        
        # Select summary outputs
        output_map = {
            "Planner": run.planner_output,
            "Signal": run.signal_output,
            "Memory": run.context_output,
            "Knowledge": run.knowledge_output,
            "Recommendation": run.recommendation_output,
            "Explainability": run.explainability_output
        }
        
        agents_status.append(AgentStatusSchema(
            agent_name=name,
            status=agent_status,
            progress=progress,
            execution_time=latency_map.get(name, 0.0),
            output_summary=output_map.get(name)
        ))
        
    return AgentExecutionResponse(
        task_id=run.task_id,
        customer_id=run.customer_id,
        status=run.status,
        current_agent=run.current_agent,
        agents=agents_status,
        created_at=run.created_at
    )

# 7. GET /recommendation/{id}
@router.get("/recommendation/{id}", response_model=RecommendationResponse, tags=["Recommendations"])
def get_recommendation(id: int, db: Session = Depends(get_db)):
    """Fetch structured recommendation by primary ID."""
    rec = db.query(Recommendation).filter(Recommendation.id == id).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Recommendation with ID {id} not found"
        )
    return rec

# 8. POST /recommendation/{id}/action
@router.post("/recommendation/{id}/action", tags=["Recommendations"])
def decide_recommendation(
    id: int, 
    request: DecisionRequest,
    db: Session = Depends(get_db)
):
    """Approve, Reject, or Modify a pending AI next-best-action with audit trails."""
    rec = db.query(Recommendation).filter(Recommendation.id == id).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Recommendation with ID {id} not found"
        )
        
    # Update status
    rec.status = request.status
    
    # Audit log details builder
    audit_detail = f"Customer: {rec.customer.name} (ID: {rec.customer_id})."
    
    if request.status == "modified":
        if request.modified_action:
            rec.primary_action = request.modified_action
            audit_detail += f" Override Action: '{request.modified_action}'."
        if request.modified_priority:
            # Map modified priority to customer risk profile
            mapped_risk = request.modified_priority.lower()
            if mapped_risk == 'critical':
                mapped_risk = 'high'
            rec.customer.risk_level = mapped_risk
            audit_detail += f" Override Risk: '{request.modified_priority}'."
        if request.modified_follow_up:
            audit_detail += f" Override Timeline: '{request.modified_follow_up}'."
            
    if request.reason:
        audit_detail += f" Justification Notes: {request.reason}"
        
    audit = AuditLog(
        user_action=f"Recommendation {request.status.capitalize()}",
        user_name=request.user_name or "Customer Success Manager",
        details=audit_detail
    )
    db.add(audit)
    db.commit()
    
    return {
        "success": True,
        "message": f"Recommendation has been successfully {request.status}.",
        "recommendation_id": id,
        "status": request.status
    }

# 9. GET /audit-logs
@router.get("/audit-logs", tags=["System"])
def get_audit_logs(db: Session = Depends(get_db)):
    """Fetch full audit trails for decision logs."""
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()

# 10. GET /analytics
@router.get("/analytics", tags=["System"])
def get_analytics(db: Session = Depends(get_db)):
    """Fetch high-level KPI aggregations for graphs."""
    recs = db.query(Recommendation).all()
    customers = db.query(Customer).all()
    
    total_recs = len(recs)
    approved_recs = len([r for r in recs if r.status == "approved"])
    rejected_recs = len([r for r in recs if r.status == "rejected"])
    modified_recs = len([r for r in recs if r.status == "modified"])
    
    acceptance_rate = 0.0
    if total_recs > 0:
        acceptance_rate = round(((approved_recs + modified_recs) / total_recs) * 100, 1)
        
    # Customer distributions
    healths = [c.health_score for c in customers]
    avg_health = round(sum(healths) / len(healths), 1) if healths else 100.0
    
    risk_dist = {"high": 0, "medium": 0, "low": 0}
    for c in customers:
        risk_dist[c.risk_level.lower()] = risk_dist.get(c.risk_level.lower(), 0) + 1
        
    return {
        "acceptance_rate": acceptance_rate,
        "total_recommendations": total_recs,
        "decisions_breakdown": {
            "approved": approved_recs,
            "rejected": rejected_recs,
            "modified": modified_recs,
            "pending": total_recs - (approved_recs + rejected_recs + modified_recs)
        },
        "average_health_score": avg_health,
        "risk_distribution": risk_dist,
        "weekly_activity": [
            {"day": "Mon", "generated": 4, "accepted": 3},
            {"day": "Tue", "generated": 5, "accepted": 4},
            {"day": "Wed", "generated": 3, "accepted": 3},
            {"day": "Thu", "generated": 7, "accepted": 5},
            {"day": "Fri", "generated": 6, "accepted": 5},
        ]
    }

# 11. GET /memory/{customer_id}
@router.get("/memory/{customer_id}", response_model=List[dict], tags=["Memory"])
def get_memory(customer_id: int, db: Session = Depends(get_db)):
    """Fetch a unified chronological timeline (memories, tickets, feedback, csat, emails, telemetry)."""
    from backend.app.memory.memory_service import memory_service
    from backend.app.models.demo_models import SupportTicket, CustomerFeedback, CSATResponse, GmailEmail, ProductUsageEvent
    
    # 1. Fetch default database memory logs
    memories = memory_service.get_customer_memory(db, customer_id)
    timeline = []
    for m in memories:
        timeline.append({
            "id": f"mem_{m.id}",
            "interaction_type": m.interaction_type,
            "content": m.content,
            "health_score": m.health_score,
            "risk_level": m.risk_level,
            "outcome": m.outcome,
            "created_at": m.created_at
        })
        
    # 2. Fetch Support Tickets
    tickets = db.query(SupportTicket).filter(SupportTicket.customer_id == customer_id).all()
    for t in tickets:
        timeline.append({
            "id": f"tkt_{t.id}",
            "interaction_type": "ticket",
            "content": f"Support Ticket raised: '{t.subject}' - {t.description[:120]}...",
            "health_score": 0,
            "risk_level": t.priority,
            "outcome": t.status,
            "created_at": t.created_at
        })

    # 3. Fetch Customer Feedbacks
    feedbacks = db.query(CustomerFeedback).filter(CustomerFeedback.customer_id == customer_id).all()
    for f in feedbacks:
        timeline.append({
            "id": f"fb_{f.id}",
            "interaction_type": "feedback",
            "content": f"Customer Feedback rating {f.rating}/5. Category: {f.category}. Details: {f.comments}",
            "health_score": f.rating * 20,
            "risk_level": "medium" if f.rating < 3 else "low",
            "outcome": f"Rating {f.rating}",
            "created_at": f.created_at
        })

    # 4. Fetch CSAT responses
    csats = db.query(CSATResponse).filter(CSATResponse.customer_id == customer_id).all()
    for c in csats:
        timeline.append({
            "id": f"csat_{c.id}",
            "interaction_type": "csat",
            "content": f"CSAT Survey Response: Support: {c.rate_support}/5, Speed: {c.rate_resolution_speed}/5, Recommend: {c.recommend}/5. Remarks: {c.comments or 'None'}",
            "health_score": c.rate_support * 20,
            "risk_level": "low",
            "outcome": f"CSAT: {c.recommend}/5",
            "created_at": c.created_at
        })

    # 5. Fetch Gmail Emails
    emails = db.query(GmailEmail).filter(GmailEmail.customer_id == customer_id).all()
    for e in emails:
        timeline.append({
            "id": f"eml_{e.id}",
            "interaction_type": "email",
            "content": f"Email Sync [{e.sentiment}] - '{e.subject}': {e.body[:150]}...",
            "health_score": 0,
            "risk_level": "medium" if e.sentiment == "Negative" else "low",
            "outcome": e.sentiment,
            "created_at": e.timestamp
        })

    # 6. Fetch Telemetry Milestones (LOGIN, DOWNLOAD_REPORT, etc.)
    telemetry = db.query(ProductUsageEvent).filter(ProductUsageEvent.customer_id == customer_id).order_by(ProductUsageEvent.timestamp.desc()).limit(15).all()
    for p in telemetry:
        timeline.append({
            "id": f"tel_{p.id}",
            "interaction_type": "telemetry",
            "content": f"User {p.employee_id} performed '{p.action}' action in the '{p.module}' workspace module.",
            "health_score": 0,
            "risk_level": "low",
            "outcome": "tracked",
            "created_at": p.timestamp
        })

    # Sort chronological: newest first
    timeline = sorted(timeline, key=lambda x: x["created_at"], reverse=True)
    return timeline

# 12. POST /memory
@router.post("/memory", tags=["Memory"])
def create_memory(request: dict, db: Session = Depends(get_db)):
    """Add a new custom memory log record."""
    from backend.app.memory.memory_service import memory_service
    from backend.app.memory.memory_schema import MemoryCreate
    try:
        validated = MemoryCreate(**request)
        memory = memory_service.create_memory(db, validated)
        return {"success": True, "message": "Memory log created.", "id": memory.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 13. PUT /memory/{id}
@router.put("/memory/{id}", tags=["Memory"])
def update_memory(id: int, request: dict, db: Session = Depends(get_db)):
    """Update properties of an existing customer memory slot."""
    from backend.app.memory.memory_service import memory_service
    from backend.app.memory.memory_schema import MemoryUpdate
    try:
        validated = MemoryUpdate(**request)
        memory_service.update_memory(db, id, validated)
        return {"success": True, "message": f"Memory log {id} updated."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 14. DELETE /memory/{id}
@router.delete("/memory/{id}", tags=["Memory"])
def delete_memory(id: int, db: Session = Depends(get_db)):
    """Delete a memory record."""
    from backend.app.memory.memory_service import memory_service
    try:
        memory_service.delete_memory(db, id)
        return {"success": True, "message": f"Memory log {id} deleted."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
