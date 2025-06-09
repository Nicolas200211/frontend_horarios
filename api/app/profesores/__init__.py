from .models import Profesor
from .schemas import ProfesorBase, ProfesorCreate, ProfesorUpdate, Profesor
from .crud import (
    get_profesor,
    get_profesores,
    create_profesor,
    update_profesor,
    delete_profesor
)
from . import routes

__all__ = [
    'Profesor',
    'ProfesorBase',
    'ProfesorCreate',
    'ProfesorUpdate',
    'get_profesor',
    'get_profesores',
    'create_profesor',
    'update_profesor',
    'delete_profesor',
    'routes'
]
