import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("exceptions")

class DecisionFlowException(Exception):
    """Base exception for DecisionFlow platform."""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class AgentExecutionException(DecisionFlowException):
    """Failed execution of an agent pipeline node."""
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_424_FAILED_DEPENDENCY)

class DatabaseException(DecisionFlowException):
    """Database query or session failure."""
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_503_SERVICE_UNAVAILABLE)

class InvalidFileFormatException(DecisionFlowException):
    """Uploaded file does not match allowed types."""
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)

async def decisionflow_exception_handler(request: Request, exc: DecisionFlowException):
    logger.error("DecisionFlow Error on %s: %s (Status %d)", request.url.path, exc.message, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.message, "detail": str(exc)}
    )

async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandle Exception on %s: %s", request.url.path, str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "error": "Internal Server Error", "detail": str(exc)}
    )
