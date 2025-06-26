from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from . import models, schemas

def get_curso(db: Session, curso_id: int) -> Optional[models.Curso]:
    """Obtiene un curso por su ID"""
    return db.query(models.Curso).filter(models.Curso.id == curso_id).first()

def get_curso_by_codigo(db: Session, codigo: str) -> Optional[models.Curso]:
    """Obtiene un curso por su código"""
    return db.query(models.Curso).filter(models.Curso.codigo == codigo).first()

def get_cursos(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    activo: Optional[bool] = None,
    unidad_academica_id: Optional[int] = None,
    profesor_id: Optional[int] = None
) -> List[models.Curso]:
    """Obtiene una lista de cursos con filtros opcionales"""
    query = db.query(models.Curso)
    
    if activo is not None:
        query = query.filter(models.Curso.activo == activo)
    if unidad_academica_id is not None:
        query = query.filter(models.Curso.unidad_academica_id == unidad_academica_id)
    if profesor_id is not None:
        query = query.filter(models.Curso.profesor_id == profesor_id)
        
    return query.offset(skip).limit(limit).all()

def create_curso(db: Session, curso: schemas.CursoCreate) -> models.Curso:
    """Crea un nuevo curso"""
    db_curso = models.Curso(**curso.dict())
    db.add(db_curso)
    db.commit()
    db.refresh(db_curso)
    return db_curso

def update_curso(
    db: Session, 
    db_curso: models.Curso, 
    curso_update: schemas.CursoUpdate
) -> models.Curso:
    """Actualiza un curso existente"""
    update_data = curso_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_curso, field, value)
    
    db.add(db_curso)
    db.commit()
    db.refresh(db_curso)
    return db_curso

def delete_curso(db: Session, curso_id: int) -> bool:
    """Elimina un curso (eliminación lógica)"""
    db_curso = get_curso(db, curso_id)
    if not db_curso:
        return False
    
    db_curso.activo = False
    db.add(db_curso)
    db.commit()
    return True
