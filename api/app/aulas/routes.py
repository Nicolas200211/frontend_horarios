from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from . import crud, schemas, models

router = APIRouter(
    prefix="/api/aulas",
    tags=["aulas"],
    responses={404: {"description": "Not found"}},
)

@router.post(
    "/", 
    response_model=schemas.AulaResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo aula"
)
async def create_aula(
    aula: schemas.AulaCreate, 
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo aula con la información proporcionada.
    """
    db_aula = crud.get_aula_by_codigo(db, codigo=aula.codigo)
    if db_aula:
        raise HTTPException(
            status_code=400, 
            detail="Ya existe un aula con este código"
        )
    return crud.create_aula(db=db, aula=aula)

@router.get(
    "/", 
    response_model=schemas.AulaListResponse,
    summary="Obtener lista de aulas"
)
async def read_aulas(
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(100, le=200, description="Número máximo de registros a devolver"),
    activo: Optional[bool] = Query(None, description="Filtrar por estado activo/inactivo"),
    unidad_academica_id: Optional[int] = Query(None, gt=0, description="Filtrar por ID de unidad académica"),
    curso_id: Optional[int] = Query(None, gt=0, description="Filtrar por ID de curso"),
    profesor_id: Optional[int] = Query(None, gt=0, description="Filtrar por ID de profesor"),
    tipo: Optional[schemas.TipoAula] = Query(None, description="Filtrar por tipo de aula"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de aulas con filtros opcionales.
    """
    aulas = crud.get_aulas(
        db, 
        skip=skip, 
        limit=limit,
        activo=activo,
        unidad_academica_id=unidad_academica_id,
        curso_id=curso_id,
        profesor_id=profesor_id,
        tipo=tipo.value if tipo else None
    )
    total = crud.count_aulas(
        db,
        activo=activo,
        unidad_academica_id=unidad_academica_id,
        curso_id=curso_id,
        profesor_id=profesor_id,
        tipo=tipo.value if tipo else None
    )
    return {
        "items": aulas,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get(
    "/{aula_id}", 
    response_model=schemas.AulaResponse,
    summary="Obtener un aula por ID"
)
async def read_aula(
    aula_id: int, 
    db: Session = Depends(get_db)
):
    """
    Obtiene la información detallada de un aula específica por su ID.
    """
    db_aula = crud.get_aula(db, aula_id=aula_id)
    if db_aula is None:
        raise HTTPException(status_code=404, detail="Aula no encontrada")
    return db_aula

@router.put(
    "/{aula_id}", 
    response_model=schemas.AulaResponse,
    summary="Actualizar un aula"
)
async def update_aula(
    aula_id: int, 
    aula_update: schemas.AulaUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un aula existente.
    """
    db_aula = crud.get_aula(db, aula_id=aula_id)
    if db_aula is None:
        raise HTTPException(status_code=404, detail="Aula no encontrada")
    
    # Verificar si el nuevo código ya existe (si se está actualizando)
    if aula_update.codigo and aula_update.codigo != db_aula.codigo:
        existing_aula = crud.get_aula_by_codigo(db, codigo=aula_update.codigo)
        if existing_aula and existing_aula.id != aula_id:
            raise HTTPException(
                status_code=400, 
                detail="Ya existe otro aula con este código"
            )
    
    return crud.update_aula(db=db, db_aula=db_aula, aula_update=aula_update)

@router.delete(
    "/{aula_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un aula (lógicamente)"
)
async def delete_aula(
    aula_id: int, 
    db: Session = Depends(get_db)
):
    """
    Realiza una eliminación lógica de un aula (marca como inactivo).
    """
    db_aula = crud.get_aula(db, aula_id=aula_id)
    if db_aula is None:
        raise HTTPException(status_code=404, detail="Aula no encontrada")
    
    if not crud.delete_aula(db=db, aula_id=aula_id):
        raise HTTPException(status_code=500, detail="Error al eliminar el aula")
    
    return None
