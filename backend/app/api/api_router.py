from fastapi import APIRouter

from backend.app.api.agent_routes import router as agent_router
from backend.app.api.customer_routes import router as customer_router
from backend.app.api.memory_routes import router as memory_router
from backend.app.api.recommendation_routes import router as recommendation_router
from backend.app.api.system_routes import router as system_router
from backend.app.api.upload_routes import router as upload_router
from backend.app.api.demo_routes import router as demo_router

router = APIRouter()

router.include_router(system_router)
router.include_router(customer_router)
router.include_router(upload_router)
router.include_router(agent_router)
router.include_router(recommendation_router)
router.include_router(memory_router)
router.include_router(demo_router)
