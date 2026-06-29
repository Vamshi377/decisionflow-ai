import logging

logger = logging.getLogger("memory.store")

class MemoryStore:
    """
    Handles conversational history memory and agentic decision memory caches
    to maintain context across agent invocations.
    """
    def __init__(self):
        # Short term session memory
        self._store = {}
        logger.info("Agent memory store initialized.")

    def save_session_state(self, session_id: str, state_data: dict):
        logger.debug("Saving session state memory for Session: %s", session_id)
        self._store[session_id] = state_data

    def get_session_state(self, session_id: str) -> dict:
        logger.debug("Retrieving session state memory for Session: %s", session_id)
        return self._store.get(session_id, {})

    def clear_session(self, session_id: str):
        if session_id in self._store:
            del self._store[session_id]
            logger.info("Cleared memory cache for Session: %s", session_id)

memory_store = MemoryStore()
