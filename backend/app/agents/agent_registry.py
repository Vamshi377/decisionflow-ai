import logging
from typing import Dict, Any, Callable

logger = logging.getLogger("agents.registry")

class AgentRegistry:
    """
    Registry for loading and executing agents dynamically.
    Allows easy addition of future agents (HR, Sales, IT Support, etc.).
    """
    def __init__(self):
        self._registry: Dict[str, Callable] = {}
        logger.info("Agent Registry initialized.")

    def register(self, name: str, agent_callable: Callable) -> None:
        """Register a new agent node executor."""
        logger.info("Registering agent node: '%s'", name)
        self._registry[name] = agent_callable

    def get_agent(self, name: str) -> Callable:
        """Retrieve an agent executor by name. Raises exception if not registered."""
        if name not in self._registry:
            raise KeyError(f"Agent '{name}' is not registered in the registry.")
        return self._registry[name]

    def has_agent(self, name: str) -> bool:
        return name in self._registry

# Global registry instance
agent_registry = AgentRegistry()
