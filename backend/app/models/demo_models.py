from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class ProductUsageEvent(Base):
    __tablename__ = "product_usage_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    employee_id: Mapped[str] = mapped_column(String(50), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False) # LOGIN, MARK_ATTENDANCE, etc.
    module: Mapped[str] = mapped_column(String(100), nullable=False) # Dashboard, Mark Attendance, etc.
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    duration: Mapped[int] = mapped_column(Integer, default=0) # Duration of action in seconds

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False) # Bug, Feature, Billing, Admin
    priority: Mapped[str] = mapped_column(String(20), nullable=False) # Low, Medium, High, Urgent
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="Open") # Open, In Progress, Resolved, Closed
    attachment_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    csat_responses: Mapped[list["CSATResponse"]] = relationship(back_populates="ticket", cascade="all, delete-orphan")

class CustomerFeedback(Base):
    __tablename__ = "customer_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False) # 1-5
    comments: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    suggestions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class CSATResponse(Base):
    __tablename__ = "csat_responses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("support_tickets.id"), nullable=False)
    rate_support: Mapped[int] = mapped_column(Integer, nullable=False) # 1-5
    rate_resolution_speed: Mapped[int] = mapped_column(Integer, nullable=False) # 1-5
    recommend: Mapped[int] = mapped_column(Integer, nullable=False) # 1-5
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    ticket: Mapped["SupportTicket"] = relationship(back_populates="csat_responses")

class GmailEmail(Base):
    __tablename__ = "gmail_emails"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    sender: Mapped[str] = mapped_column(String(255), nullable=False)
    receiver: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    thread_id: Mapped[str] = mapped_column(String(100), nullable=False)
    sentiment: Mapped[str] = mapped_column(String(20), default="Neutral") # Positive, Negative, Neutral
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
