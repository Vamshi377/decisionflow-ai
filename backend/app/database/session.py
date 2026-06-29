import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from backend.app.core.config import settings
from backend.app.models.base import Base

logger = logging.getLogger("database")
SQLITE_FALLBACK_URL = f"sqlite:///{settings.SQLITE_DB_PATH.as_posix()}"

# Detect connection string and setup fallback to local SQLite for zero-config run
db_url = settings.DATABASE_URL
engine_args = {}

if "sqlite" in db_url or not db_url:
    logger.info("Using local SQLite database for mock persistence.")
    settings.SQLITE_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db_url = SQLITE_FALLBACK_URL
    engine_args["connect_args"] = {"check_same_thread": False}
    engine = create_engine(db_url, **engine_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    logger.info("Configuring PostgreSQL connection pool.")
    engine_args.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 3,  # Short timeout for eager test
        "pool_recycle": 1800
    })
    try:
        engine = create_engine(db_url, **engine_args)
        # Eager test connection to see if Postgres is up
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("PostgreSQL connection verified successfully.")
    except Exception as e:
        logger.warning("PostgreSQL connection failed (%s). Falling back to local SQLite.", str(e))
        settings.SQLITE_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        db_url = SQLITE_FALLBACK_URL
        engine_args = {"connect_args": {"check_same_thread": False}}
        engine = create_engine(db_url, **engine_args)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all tables and seed initial data if empty."""
    from backend.app.models.database_models import Customer, Recommendation, AuditLog, UploadedFile, AgentRun
    from backend.app.memory.memory_model import CustomerMemory
    from backend.app.models.demo_models import ProductUsageEvent, SupportTicket, CustomerFeedback, CSATResponse, GmailEmail
    
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")


def get_db():
    """Dependency injection to get database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
