from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.memory.memory_schema import MemoryCreate, MemoryResponse, MemoryUpdate
from backend.app.memory.memory_service import memory_service

router = APIRouter(tags=["Memory"])


@router.get("/memory/{customer_id}", response_model=List[MemoryResponse])
def get_memory(customer_id: int, db: Session = Depends(get_db)):
    """Fetch all history timeline memory slots for a specific client."""
    return memory_service.get_customer_memory(db, customer_id)


@router.post("/memory")
def create_memory(request: MemoryCreate, db: Session = Depends(get_db)):
    """Add a new custom memory log record."""
    try:
        memory = memory_service.create_memory(db, request)
        return {"success": True, "message": "Memory log created.", "id": memory.id}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/memory/{id}")
def update_memory(id: int, request: MemoryUpdate, db: Session = Depends(get_db)):
    """Update properties of an existing customer memory slot."""
    try:
        memory_service.update_memory(db, id, request)
        return {"success": True, "message": f"Memory log {id} updated."}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/memory/{id}")
def delete_memory(id: int, db: Session = Depends(get_db)):
    """Delete a memory record."""
    try:
        memory_service.delete_memory(db, id)
        return {"success": True, "message": f"Memory log {id} deleted."}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
