from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, Any
from datetime import datetime

class CursoBase(BaseModel):
    codigo: str = Field(..., max_length=20, description="Código único del curso")
    nombre: str = Field(..., max_length=100, description="Nombre del curso")
    descripcion: Optional[str] = Field(None, description="Descripción detallada del curso")
    creditos: int = Field(..., gt=0, description="Número de créditos del curso")
    horas_teoria: int = Field(..., ge=0, description="Horas de teoría por semana")
    horas_practica: int = Field(..., ge=0, description="Horas de práctica por semana")
    unidad_academica_id: int = Field(..., gt=0, description="ID de la unidad académica a la que pertenece el curso")
    profesor_id: int = Field(..., gt=0, description="ID del profesor que imparte el curso")
    activo: bool = Field(True, description="Indica si el curso está activo o no")

class CursoCreate(CursoBase):
    pass

class CursoUpdate(BaseModel):
    codigo: Optional[str] = Field(None, max_length=20, description="Código único del curso")
    nombre: Optional[str] = Field(None, max_length=100, description="Nombre del curso")
    descripcion: Optional[str] = Field(None, description="Descripción detallada del curso")
    creditos: Optional[int] = Field(None, gt=0, description="Número de créditos del curso")
    horas_teoria: Optional[int] = Field(None, ge=0, description="Horas de teoría por semana")
    horas_practica: Optional[int] = Field(None, ge=0, description="Horas de práctica por semana")
    unidad_academica_id: Optional[int] = Field(None, gt=0, description="ID de la unidad académica")
    profesor_id: Optional[int] = Field(None, gt=0, description="ID del profesor")
    activo: Optional[bool] = Field(None, description="Indica si el curso está activo o no")

    class Config:
        from_attributes = True

class UnidadAcademicaResponse(BaseModel):
    id: int
    nombre: str
    codigo: str

class ProfesorResponse(BaseModel):
    id: int
    nombres: str
    apellidos: str

class CursoResponse(CursoBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    unidad_academica: UnidadAcademicaResponse
    profesor: ProfesorResponse

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "codigo": "MAT101",
                "nombre": "Matemáticas Básicas",
                "descripcion": "Curso introductorio de matemáticas",
                "creditos": 4,
                "horas_teoria": 3,
                "horas_practica": 2,
                "unidad_academica_id": 1,
                "profesor_id": 1,
                "activo": True,
                "fecha_creacion": "2023-01-01T00:00:00",
                "fecha_actualizacion": "2023-01-01T00:00:00",
                "unidad_academica": {
                    "id": 1,
                    "nombre": "Facultad de Ciencias",
                    "codigo": "FC"
                },
                "profesor": {
                    "id": 1,
                    "nombres": "Juan",
                    "apellidos": "Pérez"
                }
            }
        }
