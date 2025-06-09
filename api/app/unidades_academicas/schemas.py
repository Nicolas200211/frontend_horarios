from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UnidadAcademicaBase(BaseModel):
    codigo: str = Field(..., max_length=20, description="Código único de la unidad académica")
    nombre: str = Field(..., max_length=100, description="Nombre de la unidad académica")
    descripcion: Optional[str] = Field(None, description="Descripción detallada de la unidad")

class UnidadAcademicaCreate(UnidadAcademicaBase):
    pass

class UnidadAcademicaUpdate(BaseModel):
    codigo: Optional[str] = Field(None, max_length=20)
    nombre: Optional[str] = Field(None, max_length=100)
    descripcion: Optional[str] = None

class UnidadAcademicaInDBBase(UnidadAcademicaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class UnidadAcademica(UnidadAcademicaInDBBase):
    pass
