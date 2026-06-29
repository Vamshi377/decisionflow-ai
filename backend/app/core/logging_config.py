import logging
import sys
from backend.app.core.config import settings

# Create logs directory if it doesn't exist
LOGS_DIR = settings.LOG_DIR
LOGS_DIR.mkdir(exist_ok=True)
LOG_FILE = LOGS_DIR / "app.log"

def setup_logging():
    logging_format = (
        "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s"
    )
    
    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    # Clean existing handlers
    if logger.hasHandlers():
        logger.handlers.clear()
        
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(logging_format))
    logger.addHandler(console_handler)
    
    # File handler for local logs
    file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    file_handler.setFormatter(logging.Formatter(logging_format))
    logger.addHandler(file_handler)
    
    # Set levels for third party libs to suppress noise
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    
    logging.info("Logging initialized successfully. Logs written to %s", LOG_FILE.absolute())
