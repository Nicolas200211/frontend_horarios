from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from . import crud, schemas, models

router = APIRouter(
    prefix="/api/cursos",
    tags=["cursos"],
    responses={404: {"description": "Not found"}},
)

@router.post(
    "/", 
    response_model=schemas.CursoResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo curso"
)
async def create_curso(
    curso: schemas.CursoCreate, 
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo curso con la información proporcionada.
    """
    db_curso = crud.get_curso_by_codigo(db, codigo=curso.codigo)
    if db_curso:
        raise HTTPException(
            status_code=400, 
            detail="Ya existe un curso con este código"
        )
    return crud.create_curso(db=db, curso=curso)

@router.get(
    "/", 
    response_model=List[schemas.CursoResponse],
    summary="Obtener lista de cursos"
)
async def read_cursos(
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(100, le=100, description="Número máximo de registros a devolver"),
    activo: Optional[bool] = Query(None, description="Filtrar por estado activo/inactivo"),
    unidad_academica_id: Optional[int] = Query(None, gt=0, description="Filtrar por ID de unidad académica"),
    profesor_id: Optional[int] = Query(None, gt=0, description="Filtrar por ID de profesor"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de cursos con filtros opcionales.
    """
    cursos = crud.get_cursos(
        db, 
        skip=skip, 
        limit=limit,
        activo=activo,
        unidad_academica_id=unidad_academica_id,
        profesor_id=profesor_id
    )
    return cursos

@router.get(
    "/{curso_id}", 
    response_model=schemas.CursoResponse,
    summary="Obtener un curso por ID"
)
async def read_curso(curso_id: int, db: Session = Depends(get_db)):
    """
    Obtiene la información detallada de un curso específico por su ID.
    """
    db_curso = crud.get_curso(db, curso_id=curso_id)
    if db_curso is None:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return db_curso

@router.put(
    "/{curso_id}", 
    response_model=schemas.CursoResponse,
    summary="Actualizar un curso"
)
async def update_curso(
    curso_id: int, 
    curso_update: schemas.CursoUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un curso existente.
    """
    db_curso = crud.get_curso(db, curso_id=curso_id)
    if not db_curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    # Verificar si el código ya existe (si se está actualizando)
    if curso_update.codigo and curso_update.codigo != db_curso.codigo:
        existing_curso = crud.get_curso_by_codigo(db, codigo=curso_update.codigo)
        if existing_curso:
            raise HTTPException(
                status_code=400, 
                detail="Ya existe otro curso con este código"
            )
    
    return crud.update_curso(db, db_curso=db_curso, curso_update=curso_update)

@router.delete(
    "/{curso_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un curso (eliminación lógica)"
)
async def delete_curso(curso_id: int, db: Session = Depends(get_db)):
    """
    Realiza una eliminación lógica de un curso (marca como inactivo).
    """
    if not crud.delete_curso(db, curso_id=curso_id):
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return None
