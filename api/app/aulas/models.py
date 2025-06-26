from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base, engine

class Aula(Base):
    __tablename__ = "aulas"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
    capacidad = Column(Integer, nullable=False)
    tipo = Column(Enum('Teoría', 'Laboratorio', 'Taller', 'Otro', name='tipo_aula'), default='Teoría')
    unidad_academica_id = Column(Integer, ForeignKey('unidades_academicas.id'), nullable=False)
    curso_id = Column(Integer, ForeignKey('cursos.id'), nullable=True)  # Haciendo opcional para flexibilidad
    profesor_id = Column(Integer, ForeignKey('profesores.id'), nullable=True)  # Haciendo opcional para flexibilidad
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relaciones - Usamos strings para evitar importaciones circulares
    unidad_academica = relationship("UnidadAcademica", back_populates="aulas")
    curso = relationship("Curso", back_populates="aulas")
    profesor = relationship("Profesor", back_populates="aulas")
    horarios = relationship("Horario", back_populates="aula")
    
    def to_dict(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "nombre": self.nombre,
            "capacidad": self.capacidad,
            "tipo": self.tipo,
            "unidad_academica_id": self.unidad_academica_id,
            "curso_id": self.curso_id,
            "profesor_id": self.profesor_id,
            "activo": bool(self.activo) if self.activo is not None else False,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            "unidad_academica": {
                "id": self.unidad_academica.id,
                "nombre": self.unidad_academica.nombre,
                "codigo": self.unidad_academica.codigo
            } if self.unidad_academica else None,
            "curso": {
                "id": self.curso.id,
                "nombre": self.curso.nombre,
                "codigo": self.curso.codigo
            } if self.curso else None,
            "profesor": {
                "id": self.profesor.id,
                "nombres": self.profesor.nombres,
                "apellidos": self.profesor.apellidos
            } if self.profesor else None
        }
