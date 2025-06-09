from sqlalchemy import Column, Integer, String, Enum, Boolean, TIMESTAMP, ForeignKey, event
from sqlalchemy.orm import relationship, Session
from sqlalchemy.sql import func
from ..database import Base, engine
from typing import List, Optional  # Agregado para type hints

class Profesor(Base):
    __tablename__ = "profesores"
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    genero = Column(Enum('M', 'F', 'Otro', name='genero_enum'), nullable=False)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    unidad_academica_id = Column(Integer, ForeignKey('unidades_academicas.id'), nullable=False)
    unidad_academica = relationship("UnidadAcademica", back_populates="profesores", lazy="joined")
    
    # Relación con Cursos
    cursos = relationship("Curso", back_populates="profesor", lazy="select")
    
    # Relación con Aulas
    aulas = relationship("Aula", back_populates="profesor")
    
    # Relación con Horarios
    horarios = relationship("Horario", back_populates="profesor")
    
    def to_dict(self):
        result = {
            "id": self.id,
            "nombres": self.nombres,
            "apellidos": self.apellidos,
            "genero": self.genero,
            "activo": bool(self.activo) if self.activo is not None else False,
            "unidad_academica_id": int(self.unidad_academica_id) if self.unidad_academica_id is not None else None,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            "unidad_academica": None
        }
        
        # Only include unidad_academica if it's loaded
        if hasattr(self, 'unidad_academica') and self.unidad_academica is not None:
            try:
                result["unidad_academica"] = {
                    "id": int(self.unidad_academica.id) if self.unidad_academica.id is not None else None,
                    "nombre": str(self.unidad_academica.nombre) if self.unidad_academica.nombre is not None else None
                }
            except AttributeError:
                # In case unidad_academica is not properly loaded
                result["unidad_academica"] = None
            
        return result
