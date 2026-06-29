from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.database_models import AuditLog, Recommendation
from backend.app.schemas.recommendation import DecisionRequest, RecommendationResponse

router = APIRouter(tags=["Recommendations"])


@router.get("/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(db: Session = Depends(get_db)):
    """Fetch all compiled recommendations from database."""
    return db.query(Recommendation).order_by(Recommendation.created_at.desc()).all()


@router.get("/recommendation/{id}", response_model=RecommendationResponse)
def get_recommendation(id: int, db: Session = Depends(get_db)):
    """Fetch structured recommendation by primary ID."""
    rec = db.query(Recommendation).filter(Recommendation.id == id).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation with ID {id} not found",
        )
    return rec


@router.post("/recommendation/{id}/action")
def decide_recommendation(
    id: int,
    request: DecisionRequest,
    db: Session = Depends(get_db),
):
    """Approve, reject, or modify a pending AI next-best-action."""
    rec = db.query(Recommendation).filter(Recommendation.id == id).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation with ID {id} not found",
        )

    rec.status = request.status
    audit_detail = f"Customer: {rec.customer.name} (ID: {rec.customer_id})."

    if request.status == "modified":
        if request.modified_action:
            rec.primary_action = request.modified_action
            audit_detail += f" Override Action: '{request.modified_action}'."
        if request.modified_priority:
            mapped_risk = request.modified_priority.lower()
            if mapped_risk == "critical":
                mapped_risk = "high"
            rec.customer.risk_level = mapped_risk
            audit_detail += f" Override Risk: '{request.modified_priority}'."
        if request.modified_follow_up:
            audit_detail += f" Override Timeline: '{request.modified_follow_up}'."

    if request.reason:
        audit_detail += f" Justification Notes: {request.reason}"

    db.add(
        AuditLog(
            user_action=f"Recommendation {request.status.capitalize()}",
            user_name=request.user_name or "Customer Success Manager",
            details=audit_detail,
        )
    )
    db.commit()

    return {
        "success": True,
        "message": f"Recommendation has been successfully {request.status}.",
        "recommendation_id": id,
        "status": request.status,
    }
