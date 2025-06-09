from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum

class TipoAula(str, Enum):
    TEORIA = "Teoría"
    LABORATORIO = "Laboratorio"
    TALLER = "Taller"
    OTRO = "Otro"

class AulaBase(BaseModel):
    codigo: str = Field(..., max_length=20, description="Código único del aula")
    nombre: str = Field(..., max_length=100, description="Nombre del aula")
    capacidad: int = Field(..., gt=0, description="Capacidad máxima de estudiantes")
    tipo: TipoAula = Field(..., description="Tipo de aula")
    unidad_academica_id: int = Field(..., gt=0, description="ID de la unidad académica a la que pertenece el aula")
    curso_id: Optional[int] = Field(None, gt=0, description="ID del curso asignado al aula (opcional)")
    profesor_id: Optional[int] = Field(None, gt=0, description="ID del profesor asignado al aula (opcional)")
    activo: bool = Field(True, description="Indica si el aula está activa o no")

class AulaCreate(AulaBase):
    pass

class AulaUpdate(BaseModel):
    codigo: Optional[str] = Field(None, max_length=20, description="Código único del aula")
    nombre: Optional[str] = Field(None, max_length=100, description="Nombre del aula")
    capacidad: Optional[int] = Field(None, gt=0, description="Capacidad máxima de estudiantes")
    tipo: Optional[TipoAula] = Field(None, description="Tipo de aula")
    unidad_academica_id: Optional[int] = Field(None, gt=0, description="ID de la unidad académica")
    curso_id: Optional[int] = Field(None, gt=0, description="ID del curso asignado al aula")
    profesor_id: Optional[int] = Field(None, gt=0, description="ID del profesor asignado al aula")
    activo: Optional[bool] = Field(None, description="Indica si el aula está activa o no")

    class Config:
        from_attributes = True

class UnidadAcademicaResponse(BaseModel):
    id: int
    nombre: str
    codigo: str

class CursoResponse(BaseModel):
    id: int
    nombre: str
    codigo: str

class ProfesorResponse(BaseModel):
    id: int
    nombres: str
    apellidos: str

class AulaResponse(AulaBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    unidad_academica: Optional[UnidadAcademicaResponse] = None
    curso: Optional[CursoResponse] = None
    profesor: Optional[ProfesorResponse] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class AulaListResponse(BaseModel):
    items: List[AulaResponse]
    total: int
    skip: int
    limit: int
