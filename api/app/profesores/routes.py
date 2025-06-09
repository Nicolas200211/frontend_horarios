from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from . import crud, schemas, models

router = APIRouter(
    prefix="/api/profesores",
    tags=["profesores"],
    responses={404: {"description": "No encontrado"}},
)

@router.post("/", response_model=schemas.Profesor, status_code=status.HTTP_201_CREATED)
def crear_profesor(profesor: schemas.ProfesorCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo profesor.
    """
    return crud.create_profesor(db=db, profesor=profesor)

@router.get("/", response_model=List[schemas.Profesor])
def listar_profesores(
    skip: int = 0, 
    limit: int = 100, 
    activo: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de profesores.
    """
    profesores = crud.get_profesores(db, skip=skip, limit=limit, activo=activo)
    return profesores

@router.get("/{profesor_id}", response_model=schemas.Profesor)
def obtener_profesor(profesor_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un profesor por su ID.
    """
    db_profesor = crud.get_profesor(db, profesor_id=profesor_id)
    if db_profesor is None:
        raise HTTPException(status_code=404, detail="Profesor no encontrado")
    return db_profesor

@router.put("/{profesor_id}", response_model=schemas.Profesor)
def actualizar_profesor(
    profesor_id: int, 
    profesor: schemas.ProfesorUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualiza un profesor existente.
    """
    db_profesor = crud.get_profesor(db, profesor_id=profesor_id)
    if db_profesor is None:
        raise HTTPException(status_code=404, detail="Profesor no encontrado")
    return crud.update_profesor(db=db, db_profesor=db_profesor, profesor=profesor)

@router.delete("/{profesor_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_profesor(profesor_id: int, db: Session = Depends(get_db)):
    """
    Elimina un profesor por su ID.
    """
    db_profesor = crud.get_profesor(db, profesor_id=profesor_id)
    if db_profesor is None:
        raise HTTPException(status_code=404, detail="Profesor no encontrado")
    crud.delete_profesor(db=db, profesor_id=profesor_id)
    return {"ok": True}
