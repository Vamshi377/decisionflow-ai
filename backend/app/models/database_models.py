from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base

class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    company_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    health_score: Mapped[int] = mapped_column(Integer, default=100) # 0-100
    risk_level: Mapped[str] = mapped_column(String(20), default="low") # low, medium, high
    renewal_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    nps: Mapped[int] = mapped_column(Integer, default=10)
    domain: Mapped[str] = mapped_column(String(50), default="customer_success")
    contract_start_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    industry: Mapped[str] = mapped_column(String(100), default="Tech")
    plan: Mapped[str] = mapped_column(String(50), default="Basic")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    uploads: Mapped[List["UploadedFile"]] = relationship(back_populates="customer", cascade="all, delete-orphan")
    recommendations: Mapped[List["Recommendation"]] = relationship(back_populates="customer", cascade="all, delete-orphan")
    agent_runs: Mapped[List["AgentRun"]] = relationship(back_populates="customer", cascade="all, delete-orphan")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"))
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False) # transcript, email, csv
    file_size: Mapped[int] = mapped_column(Integer)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="uploaded") # uploaded, processing, completed, failed
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    customer: Mapped["Customer"] = relationship(back_populates="uploads")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"))
    primary_action: Mapped[str] = mapped_column(String(255), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False) # 0.0 to 1.0
    business_impact: Mapped[str] = mapped_column(String(100), nullable=False) # High, Medium, Low
    status: Mapped[str] = mapped_column(String(20), default="pending") # pending, approved, rejected, modified
    reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[str] = mapped_column(Text, nullable=False)
    alternative_actions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True) # List of alternative actions
    agent_run_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("agent_runs.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    customer: Mapped["Customer"] = relationship(back_populates="recommendations")
    agent_run: Mapped[Optional["AgentRun"]] = relationship(back_populates="recommendations")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    task_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"))
    status: Mapped[str] = mapped_column(String(20), default="running") # running, completed, failed
    current_agent: Mapped[str] = mapped_column(String(50), default="Planner")
    
    # Progress JSON or individual columns for each agent output/latency
    planner_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    signal_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    context_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    risk_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    knowledge_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommendation_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    explainability_output: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    planner_time: Mapped[float] = mapped_column(Float, default=0.0)
    signal_time: Mapped[float] = mapped_column(Float, default=0.0)
    context_time: Mapped[float] = mapped_column(Float, default=0.0)
    risk_time: Mapped[float] = mapped_column(Float, default=0.0)
    knowledge_time: Mapped[float] = mapped_column(Float, default=0.0)
    recommendation_time: Mapped[float] = mapped_column(Float, default=0.0)
    explainability_time: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    customer: Mapped["Customer"] = relationship(back_populates="agent_runs")
    recommendations: Mapped[List["Recommendation"]] = relationship(back_populates="agent_run")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_action: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. "Recommendation Approved", "File Uploaded"
    user_name: Mapped[str] = mapped_column(String(100), default="System")
    details: Mapped[str] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
