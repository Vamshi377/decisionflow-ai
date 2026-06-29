import os
from pathlib import Path
from typing import List, Dict, Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "DecisionFlow AI"
    API_V1_STR: str = "/api"
    BACKEND_DIR: Path = Path(__file__).resolve().parents[2]
    UPLOAD_DIR: Path = BACKEND_DIR / "uploads"
    LOG_DIR: Path = BACKEND_DIR / "logs"
    SQLITE_DB_PATH: Path = BACKEND_DIR / "decisionflow.db"
    
    # Environment config
    ENVIRONMENT: str = Field(default="development", validation_alias="ENV")
    DEBUG: bool = True

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_flag(cls, value: Any) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "development", "dev"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "production", "prod"}:
                return False
        return bool(value)
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Database Settings
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/decisionflow",
        validation_alias="DATABASE_URL"
    )
    
    # AI Keys (Placeholders)
    GEMINI_API_KEY: str = Field(default="placeholder_key", validation_alias="GEMINI_API_KEY")
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    
    # Reusable Domain Configurations (CS, HR, Sales, IT Support, Banking, Healthcare, Procurement)
    CURRENT_DOMAIN: str = "customer_success"
    
    DOMAINS: Dict[str, Dict[str, Any]] = {
        "customer_success": {
            "name": "Customer Success",
            "agents": ["Planner", "Signal", "Context", "Risk", "Knowledge", "Recommendation", "Explainability"],
            "metrics": ["Health Score", "Churn Risk", "Renewal Probability", "NPS"],
            "upload_types": ["Meeting Transcript", "Customer Email", "CRM CSV"]
        },
        "hr": {
            "name": "Human Resources & Talent",
            "agents": ["Planner", "Sentiment", "RetentionRisk", "PerformanceContext", "RecAction"],
            "metrics": ["Retention Risk", "Engagement Score", "Flight Risk"],
            "upload_types": ["Exit Interview", "Performance Review", "Employee Survey"]
        },
        "sales": {
            "name": "Sales & Pipeline",
            "agents": ["Planner", "BuyingSignal", "CompetitorIntel", "DealRisk", "NextBestAction"],
            "metrics": ["Win Probability", "Deal Value", "Engagement Index"],
            "upload_types": ["Call Recording Transcript", "Email Thread", "Competitor Deck"]
        },
        "it_support": {
            "name": "IT Support & Ops",
            "agents": ["Planner", "SymptomAnalyzer", "SystemLogs", "SLA_Risk", "ResolutionAgent"],
            "metrics": ["Time to Resolve", "SLA Breach Risk", "User Impact"],
            "upload_types": ["System Log", "Support Ticket Thread", "Network Diagnostic"]
        }
    }

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
