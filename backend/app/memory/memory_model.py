from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.models.base import Base

class CustomerMemory(Base):
    __tablename__ = "customer_memories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    interaction_type: Mapped[str] = mapped_column(String(50), nullable=False)  # transcript, recommendation, decision, email
    content: Mapped[str] = mapped_column(Text, nullable=False)
    health_score: Mapped[int] = mapped_column(Integer, default=100)
    risk_level: Mapped[str] = mapped_column(String(20), default="low")
    outcome: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # approved, rejected, churned, resolved
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
