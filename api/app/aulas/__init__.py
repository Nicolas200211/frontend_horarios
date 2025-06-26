from fastapi import APIRouter
from . import routes

router = APIRouter()
router.include_router(routes.router)

__all__ = ["router", "models", "schemas", "crud"]
