from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from . import models, schemas

def get_aula(db: Session, aula_id: int) -> Optional[models.Aula]:
    """Obtiene un aula por su ID"""
    return db.query(models.Aula).filter(models.Aula.id == aula_id).first()

def get_aula_by_codigo(db: Session, codigo: str) -> Optional[models.Aula]:
    """Obtiene un aula por su código"""
    return db.query(models.Aula).filter(models.Aula.codigo == codigo).first()

def get_aulas(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    activo: Optional[bool] = None,
    unidad_academica_id: Optional[int] = None,
    curso_id: Optional[int] = None,
    profesor_id: Optional[int] = None,
    tipo: Optional[str] = None
) -> List[models.Aula]:
    """Obtiene una lista de aulas con filtros opcionales"""
    query = db.query(models.Aula)
    
    if activo is not None:
        query = query.filter(models.Aula.activo == activo)
    if unidad_academica_id is not None:
        query = query.filter(models.Aula.unidad_academica_id == unidad_academica_id)
    if curso_id is not None:
        query = query.filter(models.Aula.curso_id == curso_id)
    if profesor_id is not None:
        query = query.filter(models.Aula.profesor_id == profesor_id)
    if tipo is not None:
        query = query.filter(models.Aula.tipo == tipo)
        
    return query.offset(skip).limit(limit).all()

def create_aula(db: Session, aula: schemas.AulaCreate) -> models.Aula:
    """Crea un nuevo aula"""
    db_aula = models.Aula(**aula.dict())
    db.add(db_aula)
    db.commit()
    db.refresh(db_aula)
    return db_aula

def update_aula(
    db: Session, 
    db_aula: models.Aula, 
    aula_update: schemas.AulaUpdate
) -> models.Aula:
    """Actualiza un aula existente"""
    update_data = aula_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_aula, field, value)
    
    db.add(db_aula)
    db.commit()
    db.refresh(db_aula)
    return db_aula

def delete_aula(db: Session, aula_id: int) -> bool:
    """Elimina un aula (eliminación lógica)"""
    db_aula = get_aula(db, aula_id)
    if not db_aula:
        return False
    
    db_aula.activo = False
    db.add(db_aula)
    db.commit()
    return True

def count_aulas(
    db: Session,
    activo: Optional[bool] = None,
    unidad_academica_id: Optional[int] = None,
    curso_id: Optional[int] = None,
    profesor_id: Optional[int] = None,
    tipo: Optional[str] = None
) -> int:
    """Cuenta el número total de aulas que coinciden con los filtros"""
    query = db.query(models.Aula)
    
    if activo is not None:
        query = query.filter(models.Aula.activo == activo)
    if unidad_academica_id is not None:
        query = query.filter(models.Aula.unidad_academica_id == unidad_academica_id)
    if curso_id is not None:
        query = query.filter(models.Aula.curso_id == curso_id)
    if profesor_id is not None:
        query = query.filter(models.Aula.profesor_id == profesor_id)
    if tipo is not None:
        query = query.filter(models.Aula.tipo == tipo)
        
    return query.count()
