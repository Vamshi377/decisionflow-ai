import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.logging_config import setup_logging
from backend.app.core.exceptions import (
    DecisionFlowException,
    decisionflow_exception_handler,
    global_exception_handler
)
from backend.app.database.session import init_db
from backend.app.api.api_router import router as api_router

# Setup system logging prior to launching app
setup_logging()
logger = logging.getLogger("app.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Initializing DecisionFlow AI Backend Platform...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error("Failed to initialize database: %s", str(e))
    
    # Start background auto-sync thread for Gmail inbox
    import threading
    import time
    from backend.app.database.session import SessionLocal
    from backend.app.services.email_service import email_service
    from backend.app.models.database_models import Customer

    stop_event = threading.Event()

    def run_auto_sync():
        logger.info("Starting background auto-sync thread for Gmail support inbox...")
        # Give the system 10 seconds to warm up before first fetch
        time.sleep(10)
        while not stop_event.is_set():
            try:
                db = SessionLocal()
                customers = db.query(Customer).all()
                for customer in customers:
                    logger.info("Auto-syncing emails for customer ID: %d (%s)...", customer.id, customer.company_name)
                    email_service.sync_emails(db, customer.id)
                db.close()
            except Exception as e:
                logger.error("Error in background auto-sync thread: %s", str(e))
            
            # Check stop_event every second to exit quickly on shutdown
            for _ in range(180): # 3 minutes interval
                if stop_event.is_set():
                    break
                time.sleep(1)
        logger.info("Background auto-sync thread stopped.")

    sync_thread = threading.Thread(target=run_auto_sync, daemon=True)
    sync_thread.start()

    yield
    # Shutdown tasks
    logger.info("Shutting down DecisionFlow AI Backend Platform...")
    stop_event.set()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Reusable Agentic Decision Intelligence Platform backend serving next-best-action workflows.",
    version="1.0.0-MVP",
    lifespan=lifespan
)

# CORS setup
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info("CORS configured for origins: %s", settings.BACKEND_CORS_ORIGINS)

# Global Exception Handlers
app.add_exception_handler(DecisionFlowException, decisionflow_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} Platform API",
        "documentation": "/docs",
        "status": "active",
        "active_domain": settings.CURRENT_DOMAIN
    }
