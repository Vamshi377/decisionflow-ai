import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.memory.memory_model import CustomerMemory
from backend.app.memory.memory_schema import MemoryCreate, MemoryUpdate

logger = logging.getLogger("memory.repository")

class MemoryRepository:
    """
    Abstrates database operations for Customer memories to support
    relational queries under the Repository pattern.
    """
    
    @staticmethod
    def get_by_id(db: Session, memory_id: int) -> Optional[CustomerMemory]:
        logger.debug("Querying customer memory by ID: %d", memory_id)
        return db.query(CustomerMemory).filter(CustomerMemory.id == memory_id).first()

    @staticmethod
    def get_by_customer_id(db: Session, customer_id: int) -> List[CustomerMemory]:
        logger.debug("Querying memory history list for Customer: %d", customer_id)
        return db.query(CustomerMemory).filter(CustomerMemory.customer_id == customer_id).order_by(CustomerMemory.created_at.desc()).all()

    @staticmethod
    def create(db: Session, obj_in: MemoryCreate) -> CustomerMemory:
        logger.info("Writing new memory record for Customer: %d", obj_in.customer_id)
        db_obj = CustomerMemory(
            customer_id=obj_in.customer_id,
            interaction_type=obj_in.interaction_type,
            content=obj_in.content,
            health_score=obj_in.health_score,
            risk_level=obj_in.risk_level,
            outcome=obj_in.outcome
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(db: Session, db_obj: CustomerMemory, obj_in: MemoryUpdate) -> CustomerMemory:
        logger.info("Modifying memory record ID: %d", db_obj.id)
        update_data = obj_in.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(db_obj, key, val)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(db: Session, db_obj: CustomerMemory) -> bool:
        logger.warning("Deleting memory record ID: %d", db_obj.id)
        try:
            db.delete(db_obj)
            db.commit()
            return True
        except Exception as e:
            logger.error("Failed to delete memory record: %s", str(e))
            db.rollback()
            return False

memory_repository = MemoryRepository()
