from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from . import crud, schemas, models

router = APIRouter(
    prefix="/api/horarios",
    tags=["horarios"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.HorarioResponse)
def create_horario(horario: schemas.HorarioCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo horario.
    
    - **aula_id**: ID del aula
    - **curso_id**: ID del curso
    - **profesor_id**: ID del profesor
    - **unidad_academica_id**: ID de la unidad académica
    - **dia**: Día de la semana (Lunes, Martes, etc.)
    - **hora_inicio**: Hora de inicio (formato HH:MM:SS)
    - **hora_fin**: Hora de fin (formato HH:MM:SS)
    - **tipo_clase**: Tipo de clase (Teoría, Práctica, Laboratorio, Otro)
    """
    try:
        return crud.create_horario(db=db, horario=horario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear el horario: {str(e)}")

@router.get("/", response_model=schemas.HorarioListResponse)
def read_horarios(
    skip: int = 0,
    limit: int = 100,
    aula_id: Optional[int] = None,
    curso_id: Optional[int] = None,
    profesor_id: Optional[int] = None,
    unidad_academica_id: Optional[int] = None,
    dia: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de horarios con filtros opcionales.
    
    - **skip**: Número de registros a omitir (paginación)
    - **limit**: Número máximo de registros a devolver (paginación)
    - **aula_id**: Filtrar por ID de aula
    - **curso_id**: Filtrar por ID de curso
    - **profesor_id**: Filtrar por ID de profesor
    - **unidad_academica_id**: Filtrar por ID de unidad académica
    - **dia**: Filtrar por día de la semana (Lunes, Martes, etc.)
    """
    result = crud.get_horarios(
        db=db,
        skip=skip,
        limit=limit,
        aula_id=aula_id,
        curso_id=curso_id,
        profesor_id=profesor_id,
        unidad_academica_id=unidad_academica_id,
        dia=dia
    )
    return {
        "items": result["items"],
        "total": result["total"],
        "skip": skip,
        "limit": limit
    }

@router.get("/{horario_id}", response_model=schemas.HorarioResponse)
def read_horario(horario_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un horario por su ID.
    """
    db_horario = crud.get_horario(db, horario_id=horario_id)
    if db_horario is None:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return db_horario

@router.put("/{horario_id}", response_model=schemas.HorarioResponse)
def update_horario(
    horario_id: int, 
    horario: schemas.HorarioUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza un horario existente.
    
    Solo se deben incluir los campos que se desean actualizar.
    """
    try:
        db_horario = crud.update_horario(db=db, horario_id=horario_id, horario=horario)
        if db_horario is None:
            raise HTTPException(status_code=404, detail="Horario no encontrado")
        return db_horario
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar el horario: {str(e)}")

@router.delete("/{horario_id}", response_model=schemas.HorarioResponse)
def delete_horario(horario_id: int, db: Session = Depends(get_db)):
    """
    Elimina un horario por su ID.
    """
    db_horario = crud.delete_horario(db=db, horario_id=horario_id)
    if db_horario is None:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return db_horario

# Endpoint para obtener los días de la semana
def get_dias_semana():
    return [e.value for e in schemas.DiasSemana]

# Endpoint para obtener los tipos de clase
def get_tipos_clase():
    return [e.value for e in schemas.TipoClase]

# Agregar endpoints adicionales al router
router.add_api_route("/dias-semana/", get_dias_semana, methods=["GET"], response_model=List[str])
router.add_api_route("/tipos-clase/", get_tipos_clase, methods=["GET"], response_model=List[str])
