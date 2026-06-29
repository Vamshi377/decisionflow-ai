import logging
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.app.models.database_models import Customer
from backend.app.models.demo_models import ProductUsageEvent, SupportTicket, CustomerFeedback, CSATResponse, GmailEmail

logger = logging.getLogger("services.seed_demo_data")

def seed_demo_data(db: Session):
    """Generates realistic enterprise telemetry, emails, tickets, feedback, and surveys for all registered customers."""
    logger.info("Checking for demo seed data status...")
    
    customers = db.query(Customer).all()
    if not customers:
        logger.info("No customers found. Seeding default company accounts first...")
        default_companies = [
            {"name": "Tony Stark", "company_name": "Stark Industries", "email": "tony@stark.com", "health_score": 75, "risk_level": "medium", "domain": "stark.com"},
            {"name": "Gavin Belson", "company_name": "Hooli", "email": "gavin@hooli.xyz", "health_score": 85, "risk_level": "low", "domain": "hooli.xyz"},
            {"name": "Arthur Pendelton", "company_name": "Globex Corporation", "email": "arthur@globex.co", "health_score": 45, "risk_level": "high", "domain": "globex.co"}
        ]
        for dc in default_companies:
            c = Customer(
                name=dc["name"],
                company_name=dc["company_name"],
                email=dc["email"],
                health_score=dc["health_score"],
                risk_level=dc["risk_level"],
                renewal_date=datetime.utcnow() + timedelta(days=90),
                nps=8,
                domain=dc["domain"]
            )
            db.add(c)
        db.commit()
        customers = db.query(Customer).all()

    # Seed for each customer if they don't have usage events already
    for customer in customers:
        existing_events = db.query(ProductUsageEvent).filter(ProductUsageEvent.customer_id == customer.id).count()
        if existing_events > 0:
            logger.info("Customer ID %d (%s) already has seeded usage telemetry. Skip.", customer.id, customer.company_name)
            continue

        logger.info("Seeding enterprise demo data for customer: %s...", customer.company_name)
        now = datetime.utcnow()

        # 1. Seed Telemetry (ProductUsageEvents)
        modules = [
            ("Dashboard", ["VIEW_DASHBOARD"]),
            ("Mark Attendance", ["MARK_ATTENDANCE", "VIEW_HISTORY"]),
            ("Apply Leave", ["APPLY_LEAVE", "VIEW_HISTORY"]),
            ("History", ["VIEW_HISTORY", "DOWNLOAD_REPORT"]),
            ("Announcements", ["VIEW_ANNOUNCEMENTS"])
        ]
        employees = ["emp001", "emp002", "emp003", "emp004"]
        
        # Create events over the past 30 days
        for day in range(30):
            event_date = now - timedelta(days=day)
            # Pick a subset of employees active on this day
            active_emp = random.sample(employees, random.randint(2, 4))
            for emp in active_emp:
                # Number of clicks/actions by this employee on this day
                actions_count = random.randint(3, 8)
                for _ in range(actions_count):
                    mod, actions = random.choice(modules)
                    action = random.choice(actions)
                    event = ProductUsageEvent(
                        customer_id=customer.id,
                        employee_id=emp,
                        action=action,
                        module=mod,
                        timestamp=event_date - timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59)),
                        duration=random.randint(5, 120)
                    )
                    db.add(event)

        # 2. Seed Emails
        mock_emails = [
            {
                "sender": f"compliance@{customer.domain or 'company.com'}",
                "receiver": "success@infosys.com",
                "subject": "Platform loading speeds warning",
                "body": "Hi, our employees are complaining that marking attendance takes up to 10 seconds due to API latency spikes. We need immediate investigation.",
                "sentiment": "Negative",
                "summary": "Compliance officer warns about dashboard loading latencies."
            },
            {
                "sender": f"hr@{customer.domain or 'company.com'}",
                "receiver": "success@infosys.com",
                "subject": "Requesting Custom Export Capability",
                "body": "We would love to know if we can export payroll reports directly in CSV format. Please advise if this is on the roadmap.",
                "sentiment": "Neutral",
                "summary": "HR lead requests CSV export options."
            }
        ]
        for em in mock_emails:
            db.add(GmailEmail(
                customer_id=customer.id,
                sender=em["sender"],
                receiver=em["receiver"],
                subject=em["subject"],
                body=em["body"],
                sentiment=em["sentiment"],
                summary=em["summary"],
                thread_id=f"thread_seed_{random.randint(100, 999)}",
                timestamp=now - timedelta(days=random.randint(1, 5))
            ))

        # 3. Seed Support Tickets
        tickets_pool = [
            {
                "category": "Bug",
                "priority": "High",
                "subject": "Mark Attendance latency timeouts",
                "description": "Clicking the Check-in button intermittently displays API timeout screens for remote employee logins.",
                "status": "Resolved"
            },
            {
                "category": "Billing",
                "priority": "Medium",
                "subject": "Invoicing detail dispute",
                "description": "The invoice #INV-4921 contains charges for 5 duplicate seat licenses. We need this audited.",
                "status": "In Progress"
            },
            {
                "category": "Feature",
                "priority": "Low",
                "subject": "Dark mode support request",
                "description": "Some employees working night shifts are asking for a dark mode interface option in the Attendance portal.",
                "status": "Closed"
            }
        ]
        for tk in tickets_pool:
            ticket = SupportTicket(
                customer_id=customer.id,
                category=tk["category"],
                priority=tk["priority"],
                subject=tk["subject"],
                description=tk["description"],
                status=tk["status"],
                created_at=now - timedelta(days=random.randint(2, 10))
            )
            if tk["status"] in ["Resolved", "Closed"]:
                ticket.resolved_at = now - timedelta(days=random.randint(1, 2))
            db.add(ticket)
            db.flush() # Get ticket id for CSAT relations

            # 4. CSAT Responses for Resolved/Closed tickets
            if tk["status"] == "Resolved":
                db.add(CSATResponse(
                    customer_id=customer.id,
                    ticket_id=ticket.id,
                    rate_support=random.randint(4, 5),
                    rate_resolution_speed=random.randint(4, 5),
                    recommend=random.randint(4, 5),
                    comments="CSM resolved our latency ticket effectively.",
                    created_at=now - timedelta(days=1)
                ))

        # 5. Customer Feedback
        feedbacks = [
            {
                "rating": 4,
                "comments": "The attendance tracking has made payroll runs substantially easier. Some pages load a bit slowly though.",
                "category": "Productivity"
            },
            {
                "rating": 3,
                "comments": "Average platform. Support takes a day to get back to critical bugs.",
                "category": "Customer Support"
            }
        ]
        for fb in feedbacks:
            db.add(CustomerFeedback(
                customer_id=customer.id,
                rating=fb["rating"],
                comments=fb["comments"],
                category=fb["category"],
                created_at=now - timedelta(days=random.randint(4, 12))
            ))

    db.commit()
    logger.info("Enterprise demo database seeded successfully.")
