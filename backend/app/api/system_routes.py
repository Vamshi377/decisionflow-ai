import logging
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.database_models import AuditLog, Customer, Recommendation

logger = logging.getLogger("api.system_routes")
router = APIRouter(tags=["System"])


@router.get("/health")
def get_health(db: Session = Depends(get_db)):
    """Check application health and database session connectivity."""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        logger.error("Health check database failure: %s", str(exc))
        db_status = "unhealthy"

    return {
        "status": "online",
        "database": db_status,
        "platform": "DecisionFlow AI",
        "version": "1.0.0-MVP",
    }


@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    """Fetch full audit trails for decision logs."""
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()


@router.get("/analytics")
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

    healths = [c.health_score for c in customers]
    avg_health = round(sum(healths) / len(healths), 1) if healths else 100.0

    risk_dist = {"high": 0, "medium": 0, "low": 0}
    for customer in customers:
        risk = customer.risk_level.lower()
        risk_dist[risk] = risk_dist.get(risk, 0) + 1

    return {
        "acceptance_rate": acceptance_rate,
        "total_recommendations": total_recs,
        "decisions_breakdown": {
            "approved": approved_recs,
            "rejected": rejected_recs,
            "modified": modified_recs,
            "pending": total_recs - (approved_recs + rejected_recs + modified_recs),
        },
        "average_health_score": avg_health,
        "risk_distribution": risk_dist,
        "weekly_activity": [
            {"day": "Mon", "generated": 4, "accepted": 3},
            {"day": "Tue", "generated": 5, "accepted": 4},
            {"day": "Wed", "generated": 3, "accepted": 3},
            {"day": "Thu", "generated": 7, "accepted": 5},
            {"day": "Fri", "generated": 6, "accepted": 5},
        ],
    }
