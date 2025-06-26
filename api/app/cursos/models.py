from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base, engine

class Curso(Base):
    __tablename__ = "cursos"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    creditos = Column(Integer, nullable=False)
    horas_teoria = Column(Integer, nullable=False)
    horas_practica = Column(Integer, nullable=False)
    unidad_academica_id = Column(Integer, ForeignKey('unidades_academicas.id'), nullable=False)
    profesor_id = Column(Integer, ForeignKey('profesores.id'), nullable=False)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    unidad_academica = relationship("UnidadAcademica", back_populates="cursos", lazy="joined")
    profesor = relationship("Profesor", back_populates="cursos", lazy="joined")
    aulas = relationship("Aula", back_populates="curso")
    horarios = relationship("Horario", back_populates="curso")
    
    def to_dict(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "creditos": self.creditos,
            "horas_teoria": self.horas_teoria,
            "horas_practica": self.horas_practica,
            "unidad_academica_id": self.unidad_academica_id,
            "profesor_id": self.profesor_id,
            "activo": bool(self.activo) if self.activo is not None else False,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            "unidad_academica": {
                "id": self.unidad_academica.id,
                "nombre": self.unidad_academica.nombre,
                "codigo": self.unidad_academica.codigo
            } if self.unidad_academica else None,
            "profesor": {
                "id": self.profesor.id,
                "nombres": self.profesor.nombres,
                "apellidos": self.profesor.apellidos
            } if self.profesor else None
        }
