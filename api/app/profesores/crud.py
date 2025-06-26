from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from typing import List, Optional

def get_profesor(db: Session, profesor_id: int):
    profesor = db.query(models.Profesor).filter(models.Profesor.id == profesor_id).first()
    if profesor:
        return profesor.to_dict()
    return None

def get_profesores(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    activo: Optional[bool] = None
):
    query = db.query(models.Profesor)
    if activo is not None:
        query = query.filter(models.Profesor.activo == activo)
    profesores = query.offset(skip).limit(limit).all()
    return [profesor.to_dict() for profesor in profesores]

def create_profesor(db: Session, profesor: schemas.ProfesorCreate):
    # Verificar que la unidad académica exista
    from app.unidades_academicas.models import UnidadAcademica
    db_unidad = db.query(UnidadAcademica).filter(UnidadAcademica.id == profesor.unidad_academica_id).first()
    if not db_unidad:
        raise HTTPException(status_code=400, detail=f"La unidad académica con ID {profesor.unidad_academica_id} no existe")
        
    db_profesor = models.Profesor(
        nombres=profesor.nombres,
        apellidos=profesor.apellidos,
        genero=profesor.genero,
        activo=profesor.activo,
        unidad_academica_id=profesor.unidad_academica_id
    )
    db.add(db_profesor)
    db.commit()
    db.refresh(db_profesor)
    return db_profesor.to_dict()

def update_profesor(
    db: Session, 
    db_profesor: models.Profesor, 
    profesor: schemas.ProfesorUpdate
):
    update_data = profesor.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profesor, field, value)
    db.add(db_profesor)
    db.commit()
    db.refresh(db_profesor)
    return db_profesor.to_dict()

def delete_profesor(db: Session, profesor_id: int):
    db_profesor = db.query(models.Profesor).filter(models.Profesor.id == profesor_id).first()
    if not db_profesor:
        raise HTTPException(status_code=404, detail="Profesor no encontrado")
    db.delete(db_profesor)
    db.commit()
    return {"message": "Profesor eliminado correctamente"}
