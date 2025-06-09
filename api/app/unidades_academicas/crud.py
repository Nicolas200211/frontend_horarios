from sqlalchemy.orm import Session
from . import models, schemas

def get_unidad_academica(db: Session, unidad_id: int):
    return db.query(models.UnidadAcademica).filter(models.UnidadAcademica.id == unidad_id).first()

def get_unidad_academica_by_codigo(db: Session, codigo: str):
    return db.query(models.UnidadAcademica).filter(models.UnidadAcademica.codigo == codigo).first()

def get_unidades_academicas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.UnidadAcademica).offset(skip).limit(limit).all()

def create_unidad_academica(db: Session, unidad: schemas.UnidadAcademicaCreate):
    db_unidad = models.UnidadAcademica(
        codigo=unidad.codigo,
        nombre=unidad.nombre,
        descripcion=unidad.descripcion
    )
    db.add(db_unidad)
    db.commit()
    db.refresh(db_unidad)
    return db_unidad

def update_unidad_academica(
    db: Session, 
    db_unidad: models.UnidadAcademica, 
    unidad: schemas.UnidadAcademicaUpdate
):
    update_data = unidad.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_unidad, field, value)
    db.add(db_unidad)
    db.commit()
    db.refresh(db_unidad)
    return db_unidad

def delete_unidad_academica(db: Session, unidad_id: int):
    db_unidad = get_unidad_academica(db, unidad_id)
    if db_unidad:
        db.delete(db_unidad)
        db.commit()
    return db_unidad
