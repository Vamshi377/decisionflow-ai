import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.database_models import Customer, UploadedFile
from backend.app.models.demo_models import ProductUsageEvent, SupportTicket, CustomerFeedback, CSATResponse, GmailEmail

logger = logging.getLogger("services.metrics_engine")

class MetricsEngine:
    """
    Automatically calculates and updates Customer Health Score and Risk Level
    based on product usage, tickets, emails, feedbacks, and CSAT surveys.
    """

    @staticmethod
    def recalculate_customer_scores(db: Session, customer_id: int) -> Customer:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return None

        # Base starting health score
        health = 80.0

        # 1. Product Usage Telemetry Impact
        # Check active usage events in last 30 days
        usage_count = db.query(ProductUsageEvent).filter(ProductUsageEvent.customer_id == customer_id).count()
        if usage_count == 0:
            health -= 20.0  # Heavy penalty for no product usage
        elif usage_count < 10:
            health -= 10.0  # Mild penalty for low usage
        else:
            health += min(10.0, usage_count * 0.2)  # Small bonus for active engagement

        # 2. Support Tickets Impact
        open_tickets = db.query(SupportTicket).filter(
            SupportTicket.customer_id == customer_id,
            SupportTicket.status.in_(["Open", "In Progress"])
        ).all()
        for ticket in open_tickets:
            if ticket.priority == "Urgent":
                health -= 15.0
            elif ticket.priority == "High":
                health -= 10.0
            else:
                health -= 5.0

        # 3. Customer Feedback Impact
        avg_feedback_rating = db.query(func.avg(CustomerFeedback.rating))\
            .filter(CustomerFeedback.customer_id == customer_id).scalar()
        if avg_feedback_rating is not None:
            # Shift health score based on 1-5 scale (3.0 is neutral)
            diff = (float(avg_feedback_rating) - 3.0) * 10.0
            health += diff

        # 4. CSAT Surveys Impact
        avg_csat = db.query(
            func.avg((CSATResponse.rate_support + CSATResponse.rate_resolution_speed + CSATResponse.recommend) / 3.0)
        ).filter(CSATResponse.customer_id == customer_id).scalar()
        if avg_csat is not None:
            # Shift health based on CSAT scale (3.0 is neutral)
            diff = (float(avg_csat) - 3.0) * 10.0
            health += diff

        # 5. Email Sentiment Impact
        neg_emails_count = db.query(GmailEmail).filter(
            GmailEmail.customer_id == customer_id,
            GmailEmail.sentiment == "Negative"
        ).count()
        pos_emails_count = db.query(GmailEmail).filter(
            GmailEmail.customer_id == customer_id,
            GmailEmail.sentiment == "Positive"
        ).count()
        health -= (neg_emails_count * 8.0)
        health += (pos_emails_count * 4.0)

        # Ensure health is within 0-100 bounds
        final_health = max(0, min(100, int(health)))
        customer.health_score = final_health

        # 6. Derive Risk Score (Low, Medium, High)
        # Risk factors: Low Health, Ticket escalation, Negative Email Sentiment, Renewal Proximity
        risk_weight = 0
        if final_health < 50:
            risk_weight += 30
        elif final_health < 75:
            risk_weight += 15

        # Check support ticket priority escalation
        has_urgent_ticket = db.query(SupportTicket).filter(
            SupportTicket.customer_id == customer_id,
            SupportTicket.status.in_(["Open", "In Progress"]),
            SupportTicket.priority == "Urgent"
        ).first()
        if has_urgent_ticket:
            risk_weight += 20

        # Check negative sentiment emails
        if neg_emails_count > 0:
            risk_weight += 15

        # Renewal proximity (< 30 days)
        if customer.renewal_date:
            days_to_renewal = (customer.renewal_date - datetime.utcnow()).days
            if days_to_renewal < 30:
                risk_weight += 25
            elif days_to_renewal < 60:
                risk_weight += 10

        # Set Risk level category
        if risk_weight >= 40:
            customer.risk_level = "high"
        elif risk_weight >= 15:
            customer.risk_level = "medium"
        else:
            customer.risk_level = "low"

        db.commit()
        db.refresh(customer)
        logger.info("Recalculated metrics for customer ID %d. Health: %d%%, Risk: %s", customer_id, customer.health_score, customer.risk_level)
        return customer
