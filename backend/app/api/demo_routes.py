import logging
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database.session import get_db
from backend.app.models.database_models import Customer, AuditLog
from backend.app.models.demo_models import ProductUsageEvent, SupportTicket, CustomerFeedback, CSATResponse, GmailEmail
from backend.app.ai.utils.gemini_client import gemini_client

logger = logging.getLogger("api.demo_routes")
router = APIRouter(prefix="/demo", tags=["Demo Platform Extensions"])

# 1. POST /demo/login
@router.post("/login")
def demo_login(payload: dict, db: Session = Depends(get_db)):
    """Simple demo login authentication for emp001 - emp004."""
    username = payload.get("username", "").strip()
    password = payload.get("password", "").strip()
    company_id = payload.get("company_id") # Selected from dropdown in UI

    if not username or not password or not company_id:
        raise HTTPException(status_code=400, detail="Missing username, password, or company.")

    valid_users = ["emp001", "emp002", "emp003", "emp004"]
    if username not in valid_users or password != "password":
        raise HTTPException(status_code=401, detail="Invalid employee credentials.")

    customer = db.query(Customer).filter(Customer.id == company_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Selected company profile not found.")

    # Save LOGIN telemetry automatically
    telemetry = ProductUsageEvent(
        customer_id=company_id,
        employee_id=username,
        action="LOGIN",
        module="Authentication",
        duration=5
    )
    db.add(telemetry)
    db.commit()

    return {
        "success": True,
        "employee_id": username,
        "company_id": customer.id,
        "company_name": customer.company_name,
        "client_name": customer.name
    }

# 2. POST /demo/telemetry/event
@router.post("/telemetry/event")
def record_telemetry(payload: dict, db: Session = Depends(get_db)):
    """Save an automated product usage telemetry event."""
    customer_id = payload.get("customer_id")
    employee_id = payload.get("employee_id", "Unknown")
    action = payload.get("action")
    module = payload.get("module")
    duration = payload.get("duration", 0)

    if not customer_id or not action or not module:
        raise HTTPException(status_code=400, detail="Missing required telemetry attributes.")

    event = ProductUsageEvent(
        customer_id=customer_id,
        employee_id=employee_id,
        action=action,
        module=module,
        duration=duration
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"success": True, "event_id": event.id}

@router.get("/telemetry/events/{customer_id}")
def get_customer_telemetry_events(customer_id: int, db: Session = Depends(get_db)):
    """Fetch raw telemetry events for a customer."""
    events = db.query(ProductUsageEvent).filter(ProductUsageEvent.customer_id == customer_id).order_by(ProductUsageEvent.timestamp.desc()).all()
    return events

# 3. GET /demo/product-analytics/{company_id}
@router.get("/product-analytics/{company_id}")
def get_product_analytics(company_id: int, db: Session = Depends(get_db)):
    """Exposes real-time aggregated telemetry statistics for a company."""
    # Count unique active employees over time intervals
    today = datetime.utcnow()
    dau = db.query(func.count(func.distinct(ProductUsageEvent.employee_id)))\
        .filter(ProductUsageEvent.customer_id == company_id, ProductUsageEvent.timestamp >= today - timedelta(days=1)).scalar() or 0
    wau = db.query(func.count(func.distinct(ProductUsageEvent.employee_id)))\
        .filter(ProductUsageEvent.customer_id == company_id, ProductUsageEvent.timestamp >= today - timedelta(weeks=1)).scalar() or 0
    mau = db.query(func.count(func.distinct(ProductUsageEvent.employee_id)))\
        .filter(ProductUsageEvent.customer_id == company_id, ProductUsageEvent.timestamp >= today - timedelta(days=30)).scalar() or 0

    # Activity counters
    attendance_marks = db.query(ProductUsageEvent).filter(ProductUsageEvent.customer_id == company_id, ProductUsageEvent.action == "MARK_ATTENDANCE").count()
    leave_requests = db.query(ProductUsageEvent).filter(ProductUsageEvent.customer_id == company_id, ProductUsageEvent.action == "APPLY_LEAVE").count()
    report_downloads = db.query(ProductUsageEvent).filter(ProductUsageEvent.customer_id == company_id, ProductUsageEvent.action == "DOWNLOAD_REPORT").count()

    # Module usage breakdown
    modules_stats = db.query(ProductUsageEvent.module, func.count(ProductUsageEvent.id))\
        .filter(ProductUsageEvent.customer_id == company_id)\
        .group_by(ProductUsageEvent.module).all()

    total_events = sum(count for _, count in modules_stats) or 1
    most_used = "None"
    least_used = "None"
    adoption_rates = {}

    if modules_stats:
        sorted_modules = sorted(modules_stats, key=lambda x: x[1], reverse=True)
        most_used = sorted_modules[0][0]
        least_used = sorted_modules[-1][0]
        for mod, count in modules_stats:
            adoption_rates[mod] = round((count / total_events) * 100, 1)

    # Average session duration
    avg_duration = db.query(func.avg(ProductUsageEvent.duration))\
        .filter(ProductUsageEvent.customer_id == company_id).scalar() or 0.0

    return {
        "dau": dau,
        "wau": wau,
        "mau": mau,
        "attendance_marks": attendance_marks,
        "leave_requests": leave_requests,
        "report_downloads": report_downloads,
        "most_used_module": most_used,
        "least_used_module": least_used,
        "average_session_duration_sec": round(float(avg_duration), 1),
        "module_adoption_percentage": adoption_rates
    }

# 4. POST /demo/tickets
@router.post("/tickets")
def create_ticket(payload: dict, db: Session = Depends(get_db)):
    """Raise a new support ticket from the Customer Portal."""
    customer_id = payload.get("customer_id")
    category = payload.get("category", "Bug")
    priority = payload.get("priority", "Low")
    subject = payload.get("subject", "").strip()
    description = payload.get("description", "").strip()

    if not customer_id or not subject or not description:
        raise HTTPException(status_code=400, detail="Missing ticket attributes.")

    ticket = SupportTicket(
        customer_id=customer_id,
        category=category,
        priority=priority,
        subject=subject,
        description=description,
        status="Open"
    )
    db.add(ticket)
    db.commit()

    # Log action to audit logs
    db.add(AuditLog(
        user_action="Ticket Raised",
        user_name=f"Customer Portal ({category})",
        details=f"Raised ticket: '{subject}'. Priority: {priority}."
    ))
    db.commit()

    return {"success": True, "ticket_id": ticket.id}

# 5. GET /demo/tickets/customer/{company_id}
@router.get("/tickets/customer/{company_id}")
def get_customer_tickets(company_id: int, db: Session = Depends(get_db)):
    """Fetch support tickets raised by a customer."""
    tickets = db.query(SupportTicket).filter(SupportTicket.customer_id == company_id).all()
    return tickets

# 6. PUT /demo/tickets/{ticket_id}/status
@router.put("/tickets/{ticket_id}/status")
def update_ticket_status(ticket_id: int, payload: dict, db: Session = Depends(get_db)):
    """Updates support ticket status (Resolved/Closed status triggers CSAT prompt)."""
    status = payload.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Missing status parameter.")

    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found.")

    ticket.status = status
    if status in ["Resolved", "Closed"]:
        ticket.resolved_at = datetime.utcnow()

    db.commit()
    return {"success": True, "ticket_id": ticket_id, "status": ticket.status}

# 7. POST /demo/csat
@router.post("/csat")
def submit_csat(payload: dict, db: Session = Depends(get_db)):
    """Submit Customer Satisfaction (CSAT) rating for a resolved support ticket."""
    customer_id = payload.get("customer_id")
    ticket_id = payload.get("ticket_id")
    rate_support = int(payload.get("rate_support", 5))
    rate_resolution_speed = int(payload.get("rate_resolution_speed", 5))
    recommend = int(payload.get("recommend", 5))
    comments = payload.get("comments", "")

    if not customer_id or not ticket_id:
        raise HTTPException(status_code=400, detail="Missing CSAT attributes.")

    csat = CSATResponse(
        customer_id=customer_id,
        ticket_id=ticket_id,
        rate_support=rate_support,
        rate_resolution_speed=rate_resolution_speed,
        recommend=recommend,
        comments=comments
    )
    db.add(csat)
    db.commit()
    return {"success": True, "csat_id": csat.id}

# 8. POST /demo/feedback
@router.post("/feedback")
def submit_feedback(payload: dict, db: Session = Depends(get_db)):
    """Submit product feedback and ratings from the customer portal."""
    customer_id = payload.get("customer_id")
    rating = int(payload.get("rating", 5))
    comments = payload.get("comments", "").strip()
    category = payload.get("category", "General")
    suggestions = payload.get("suggestions", "")

    if not customer_id or not comments:
        raise HTTPException(status_code=400, detail="Missing feedback attributes.")

    feedback = CustomerFeedback(
        customer_id=customer_id,
        rating=rating,
        comments=comments,
        category=category,
        suggestions=suggestions
    )
    db.add(feedback)
    db.commit()
    return {"success": True, "feedback_id": feedback.id}

# 8b. GET /demo/emails/customer/{company_id}
@router.get("/emails/customer/{company_id}")
def get_customer_emails(company_id: int, db: Session = Depends(get_db)):
    """Fetch synced emails for a customer company."""
    emails = db.query(GmailEmail).filter(GmailEmail.customer_id == company_id).all()
    return emails

# 9. POST /demo/gmail/sync (Simulated mode)
@router.post("/gmail/sync")
def sync_gmail_emails(payload: dict, db: Session = Depends(get_db)):
    """
    Simulates syncing emails from a connected Gmail inbox for a customer.
    Uses abstract EmailService which can be configured with GmailOAuth credentials.
    """
    customer_id = payload.get("customer_id")
    if not customer_id:
        raise HTTPException(status_code=400, detail="Missing customer_id.")

    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    from backend.app.services.email_service import email_service
    synced_count = email_service.sync_emails(db, customer_id)

    return {
        "success": True, 
        "emails_synced_count": synced_count,
        "details": f"Simulated email synchronization completed. Synced {synced_count} new messages for {customer.company_name}."
    }
