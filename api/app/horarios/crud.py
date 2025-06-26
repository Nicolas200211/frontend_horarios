from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import time
from . import models, schemas

def get_horario(db: Session, horario_id: int):
    return db.query(models.Horario).filter(models.Horario.id == horario_id).first()

def get_horarios(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    aula_id: Optional[int] = None,
    curso_id: Optional[int] = None,
    profesor_id: Optional[int] = None,
    unidad_academica_id: Optional[int] = None,
    dia: Optional[str] = None
):
    query = db.query(models.Horario)
    
    if aula_id is not None:
        query = query.filter(models.Horario.aula_id == aula_id)
    if curso_id is not None:
        query = query.filter(models.Horario.curso_id == curso_id)
    if profesor_id is not None:
        query = query.filter(models.Horario.profesor_id == profesor_id)
    if unidad_academica_id is not None:
        query = query.filter(models.Horario.unidad_academica_id == unidad_academica_id)
    if dia is not None:
        query = query.filter(models.Horario.dia == dia)
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return {"items": items, "total": total, "skip": skip, "limit": limit}

def create_horario(db: Session, horario: schemas.HorarioCreate):
    # Convertir las cadenas de tiempo a objetos time
    try:
        hora_inicio = time.fromisoformat(horario.hora_inicio)
        hora_fin = time.fromisoformat(horario.hora_fin)
    except (ValueError, TypeError) as e:
        raise ValueError(f"Formato de hora inválido: {str(e)}")
    
    # Verificar que la hora de inicio sea menor que la hora de fin
    if hora_inicio >= hora_fin:
        raise ValueError("La hora de inicio debe ser anterior a la hora de fin")
    
    # Verificar que la fecha no sea en el pasado
    from datetime import date as date_today
    if horario.fecha_clase < date_today.today():
        raise ValueError("No se pueden crear horarios en fechas pasadas")
    
    # Verificar que no haya superposición de horarios para el mismo aula en la misma fecha
    existing = db.query(models.Horario).filter(
        models.Horario.aula_id == horario.aula_id,
        models.Horario.fecha_clase == horario.fecha_clase,
        models.Horario.aula_id == horario.aula_id,
        models.Horario.dia == horario.dia,
        (
            (models.Horario.hora_inicio <= hora_inicio) & 
            (models.Horario.hora_fin > hora_inicio) |
            (models.Horario.hora_inicio < hora_fin) & 
            (models.Horario.hora_fin >= hora_fin) |
            (models.Horario.hora_inicio >= hora_inicio) & 
            (models.Horario.hora_fin <= hora_fin)
        )
    ).first()
    
    if existing:
        raise ValueError("El aula ya está ocupada en ese horario")
    
    # Verificar que el profesor no tenga otro curso en el mismo horario
    profesor_ocupado = db.query(models.Horario).filter(
        models.Horario.profesor_id == horario.profesor_id,
        models.Horario.dia == horario.dia,
        (
            (models.Horario.hora_inicio <= hora_inicio) & 
            (models.Horario.hora_fin > hora_inicio) |
            (models.Horario.hora_inicio < hora_fin) & 
            (models.Horario.hora_fin >= hora_fin)
        )
    ).first()
    
    if profesor_ocupado:
        raise ValueError("El profesor ya tiene una clase programada en ese horario")
    
    try:
        db_horario = models.Horario(
            aula_id=horario.aula_id,
            curso_id=horario.curso_id,
            profesor_id=horario.profesor_id,
            unidad_academica_id=horario.unidad_academica_id,
            fecha_clase=horario.fecha_clase,
            dia=horario.dia,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            tipo_clase=horario.tipo_clase
        )
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error al crear el horario: {str(e)}")
    
    db.add(db_horario)
    db.commit()
    db.refresh(db_horario)
    return db_horario

def update_horario(db: Session, horario_id: int, horario: schemas.HorarioUpdate):
    db_horario = get_horario(db, horario_id)
    if not db_horario:
        return None
    
    update_data = horario.model_dump(exclude_unset=True)
    
    # Convertir cadenas de tiempo a objetos time si están presentes
    if 'hora_inicio' in update_data:
        try:
            update_data['hora_inicio'] = time.fromisoformat(update_data['hora_inicio'])
        except (ValueError, TypeError) as e:
            raise ValueError(f"Formato de hora_inicio inválido: {str(e)}")
            
    if 'hora_fin' in update_data:
        try:
            update_data['hora_fin'] = time.fromisoformat(update_data['hora_fin'])
        except (ValueError, TypeError) as e:
            raise ValueError(f"Formato de hora_fin inválido: {str(e)}")
    
    # Validar que la hora de inicio sea menor que la hora de fin
    hora_inicio = update_data.get('hora_inicio', db_horario.hora_inicio)
    hora_fin = update_data.get('hora_fin', db_horario.hora_fin)
    
    if hora_inicio >= hora_fin:
        raise ValueError("La hora de inicio debe ser anterior a la hora de fin")
    
    # Obtener valores actuales o nuevos
    aula_id = update_data.get('aula_id', db_horario.aula_id)
    profesor_id = update_data.get('profesor_id', db_horario.profesor_id)
    fecha_clase = update_data.get('fecha_clase', db_horario.fecha_clase)
    
    # Verificar que la fecha no sea en el pasado si se está actualizando
    if 'fecha_clase' in update_data:
        from datetime import date as date_today
        if fecha_clase < date_today.today():
            raise ValueError("No se pueden actualizar horarios a fechas pasadas")
    
    # Verificar superposición de horarios para el aula en la misma fecha
    existing = db.query(models.Horario).filter(
        models.Horario.id != horario_id,
        models.Horario.aula_id == aula_id,
        models.Horario.fecha_clase == fecha_clase,
        (
            (models.Horario.hora_inicio <= hora_inicio) & 
            (models.Horario.hora_fin > hora_inicio) |
            (models.Horario.hora_inicio < hora_fin) & 
            (models.Horario.hora_fin >= hora_fin) |
            (models.Horario.hora_inicio >= hora_inicio) & 
            (models.Horario.hora_fin <= hora_fin)
        )
    ).first()
    
    if existing:
        raise ValueError("El aula ya está ocupada en ese horario y fecha")
    
    # Verificar que el profesor no tenga otro curso en el mismo horario y fecha
    profesor_ocupado = db.query(models.Horario).filter(
        models.Horario.id != horario_id,
        models.Horario.profesor_id == profesor_id,
        models.Horario.fecha_clase == fecha_clase,
        (
            (models.Horario.hora_inicio <= hora_inicio) & 
            (models.Horario.hora_fin > hora_inicio) |
            (models.Horario.hora_inicio < hora_fin) & 
            (models.Horario.hora_fin >= hora_fin)
        )
    ).first()
    
    if profesor_ocupado:
        raise ValueError("El profesor ya tiene una clase programada en ese horario")
    
    for key, value in update_data.items():
        setattr(db_horario, key, value)
    
    db.commit()
    db.refresh(db_horario)
    return db_horario

def delete_horario(db: Session, horario_id: int):
    db_horario = get_horario(db, horario_id)
    if not db_horario:
        return None
    
    db.delete(db_horario)
    db.commit()
    return db_horario
