from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Time, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base, engine

class Horario(Base):
    __tablename__ = "horarios"
    
    id = Column(Integer, primary_key=True, index=True)
    
    aula_id = Column(Integer, ForeignKey('aulas.id'), nullable=False)
    curso_id = Column(Integer, ForeignKey('cursos.id'), nullable=False)
    profesor_id = Column(Integer, ForeignKey('profesores.id'), nullable=False)
    unidad_academica_id = Column(Integer, ForeignKey('unidades_academicas.id'), nullable=False)
    
    dia = Column(Enum('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 
                     name='dias_semana'), nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    tipo_clase = Column(Enum('Teoría', 'Práctica', 'Laboratorio', 'Otro', 
                           name='tipo_clase_enum'), default='Teoría')
    
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_actualizacion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    aula = relationship("Aula", back_populates="horarios")
    curso = relationship("Curso", back_populates="horarios")
    profesor = relationship("Profesor", back_populates="horarios")
    unidad_academica = relationship("UnidadAcademica", back_populates="horarios")

# Crear las tablas si no existen
Base.metadata.create_all(bind=engine)
