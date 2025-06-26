from fastapi import APIRouter
from . import models, schemas, crud, routes

# Crear el router
router = routes.router

def get_horarios_router():
    return router

# Hacer disponibles los modelos para Alembic
__all__ = ["models", "schemas", "crud", "routes", "router"]
