from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base, engine
from typing import List, Optional  # Agregado para type hints

class UnidadAcademica(Base):
    __tablename__ = "unidades_academicas"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relación con Profesores
    profesores = relationship("Profesor", back_populates="unidad_academica", lazy="select")
    
    # Relación con Cursos (usando string para evitar importación circular)
    cursos = relationship("Curso", back_populates="unidad_academica", lazy="select")
    
    # Relación con Aulas
    aulas = relationship("Aula", back_populates="unidad_academica")
    
    # Relación con Horarios
    horarios = relationship("Horario", back_populates="unidad_academica")
    
    def to_dict(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
