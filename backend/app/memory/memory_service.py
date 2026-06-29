import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.memory.memory_repository import memory_repository
from backend.app.memory.memory_schema import MemoryCreate, MemoryUpdate

logger = logging.getLogger("memory.service")

class MemoryService:
    """
    Orchestrates historical decision memory and compiles client context
    snapshots for recommendation prompts.
    """
    def __init__(self):
        self.repo = memory_repository

    def get_customer_memory(self, db: Session, customer_id: int) -> List[Any]:
        return self.repo.get_by_customer_id(db, customer_id)

    def create_memory(self, db: Session, obj_in: MemoryCreate) -> Any:
        return self.repo.create(db, obj_in)

    def update_memory(self, db: Session, memory_id: int, obj_in: MemoryUpdate) -> Any:
        db_obj = self.repo.get_by_id(db, memory_id)
        if not db_obj:
            raise ValueError(f"Memory log ID {memory_id} does not exist.")
        return self.repo.update(db, db_obj, obj_in)

    def delete_memory(self, db: Session, memory_id: int) -> bool:
        db_obj = self.repo.get_by_id(db, memory_id)
        if not db_obj:
            raise ValueError(f"Memory log ID {memory_id} does not exist.")
        return self.repo.delete(db, db_obj)

    def get_customer_memory_context(self, db: Session, customer_id: int) -> str:
        """
        Compiles a structured chronological text block of previous customer behavior
        to inject into Recommendation Engine prompts.
        """
        memories = self.repo.get_by_customer_id(db, customer_id)
        if not memories:
            return "No previous interaction history is recorded for this customer."
            
        context = []
        # Compile up to 5 most recent records
        for mem in memories[:5]:
            date_str = mem.created_at.strftime("%Y-%m-%d")
            context.append(
                f"- [{date_str}] Type: {mem.interaction_type.upper()} | "
                f"Health: {mem.health_score} | Risk: {mem.risk_level} | Outcome: {mem.outcome or 'N/A'}\n"
                f"  Summary: {mem.content[:200]}..."
            )
        return "\n".join(context)

memory_service = MemoryService()
