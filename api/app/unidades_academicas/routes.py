from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from . import crud, schemas, models

router = APIRouter(
    prefix="/api/unidades-academicas",
    tags=["unidades_academicas"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.UnidadAcademica, status_code=201)
def create_unidad_academica(
    unidad: schemas.UnidadAcademicaCreate, 
    db: Session = Depends(get_db)
):
    db_unidad = crud.get_unidad_academica_by_codigo(db, codigo=unidad.codigo)
    if db_unidad:
        raise HTTPException(status_code=400, detail="Código de unidad académica ya existe")
    return crud.create_unidad_academica(db=db, unidad=unidad)

@router.get("/", response_model=List[schemas.UnidadAcademica])
def read_unidades_academicas(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    unidades = crud.get_unidades_academicas(db, skip=skip, limit=limit)
    return unidades

@router.get("/{unidad_id}", response_model=schemas.UnidadAcademica)
def read_unidad_academica(unidad_id: int, db: Session = Depends(get_db)):
    db_unidad = crud.get_unidad_academica(db, unidad_id=unidad_id)
    if db_unidad is None:
        raise HTTPException(status_code=404, detail="Unidad académica no encontrada")
    return db_unidad

@router.put("/{unidad_id}", response_model=schemas.UnidadAcademica)
def update_unidad_academica(
    unidad_id: int, 
    unidad: schemas.UnidadAcademicaUpdate, 
    db: Session = Depends(get_db)
):
    db_unidad = crud.get_unidad_academica(db, unidad_id=unidad_id)
    if db_unidad is None:
        raise HTTPException(status_code=404, detail="Unidad académica no encontrada")
    
    if unidad.codigo:
        existing_unidad = crud.get_unidad_academica_by_codigo(db, codigo=unidad.codigo)
        if existing_unidad and existing_unidad.id != unidad_id:
            raise HTTPException(status_code=400, detail="Código de unidad académica ya existe")
    
    return crud.update_unidad_academica(db=db, db_unidad=db_unidad, unidad=unidad)

@router.delete("/{unidad_id}", response_model=schemas.UnidadAcademica)
def delete_unidad_academica(unidad_id: int, db: Session = Depends(get_db)):
    db_unidad = crud.get_unidad_academica(db, unidad_id=unidad_id)
    if db_unidad is None:
        raise HTTPException(status_code=404, detail="Unidad académica no encontrada")
    return crud.delete_unidad_academica(db=db, unidad_id=unidad_id)
