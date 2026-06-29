import time
import logging
from functools import wraps
from typing import Callable, Any

logger = logging.getLogger("ai.utils.retry")

def retry_on_exception(
    max_retries: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
    exceptions_to_catch: tuple = (Exception,)
) -> Callable:
    """
    Decorator that retries a function call using exponential backoff.
    Particularly useful for handling transient Gemini API rate limits (429) or timeouts.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            retries = 0
            delay = initial_delay
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except exceptions_to_catch as e:
                    retries += 1
                    if retries >= max_retries:
                        logger.error(
                            "Function %s failed after %d retries. Error: %s",
                            func.__name__, retries, str(e)
                        )
                        raise e
                    logger.warning(
                        "Attempt %d failed for %s. Retrying in %.2fs... Error: %s",
                        retries, func.__name__, delay, str(e)
                    )
                    time.sleep(delay)
                    delay *= backoff_factor
            return None
        return wrapper
    return decorator
