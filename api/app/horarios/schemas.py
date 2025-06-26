from pydantic import BaseModel, Field, field_validator, ConfigDict, field_serializer
from typing import Optional, List, Any, Union
from datetime import time, datetime, date
from enum import Enum

class DiasSemana(str, Enum):
    LUNES = "Lunes"
    MARTES = "Martes"
    MIERCOLES = "Miércoles"
    JUEVES = "Jueves"
    VIERNES = "Viernes"
    SABADO = "Sábado"
    DOMINGO = "Domingo"

class TipoClase(str, Enum):
    TEORIA = "Teoría"
    PRACTICA = "Práctica"
    LABORATORIO = "Laboratorio"
    OTRO = "Otro"

class HorarioBase(BaseModel):
    aula_id: int = Field(..., gt=0, description="ID del aula")
    curso_id: int = Field(..., gt=0, description="ID del curso")
    profesor_id: int = Field(..., gt=0, description="ID del profesor")
    unidad_academica_id: int = Field(..., gt=0, description="ID de la unidad académica")
    dia: DiasSemana = Field(..., description="Día de la semana")
    hora_inicio: str = Field(..., description="Hora de inicio en formato HH:MM:SS")
    hora_fin: str = Field(..., description="Hora de fin en formato HH:MM:SS")
    tipo_clase: TipoClase = Field(default=TipoClase.TEORIA, description="Tipo de clase")

    @field_validator('hora_inicio', 'hora_fin')
    def validate_time_format(cls, v):
        try:
            time.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError("Formato de hora inválido. Use el formato HH:MM:SS")

class HorarioCreate(HorarioBase):
    pass

class HorarioUpdate(BaseModel):
    aula_id: Optional[int] = Field(None, gt=0, description="ID del aula")
    curso_id: Optional[int] = Field(None, gt=0, description="ID del curso")
    profesor_id: Optional[int] = Field(None, gt=0, description="ID del profesor")
    unidad_academica_id: Optional[int] = Field(None, gt=0, description="ID de la unidad académica")
    dia: Optional[DiasSemana] = Field(None, description="Día de la semana")
    hora_inicio: Optional[str] = Field(None, description="Hora de inicio en formato HH:MM:SS")
    hora_fin: Optional[str] = Field(None, description="Hora de fin en formato HH:MM:SS")
    tipo_clase: Optional[TipoClase] = Field(None, description="Tipo de clase")

    class Config:
        from_attributes = True

# Schemas para respuestas
class AulaResponse(BaseModel):
    id: int
    codigo: str
    nombre: str

class CursoResponse(BaseModel):
    id: int
    codigo: str
    nombre: str

class ProfesorResponse(BaseModel):
    id: int
    nombres: str
    apellidos: str

class UnidadAcademicaResponse(BaseModel):
    id: int
    codigo: str
    nombre: str

class HorarioResponse(BaseModel):
    id: int
    aula_id: int
    curso_id: int
    profesor_id: int
    unidad_academica_id: int
    dia: DiasSemana
    hora_inicio: Union[time, str]  # Acepta tanto time como string
    hora_fin: Union[time, str]     # Acepta tanto time como string
    tipo_clase: TipoClase
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    aula: Optional[AulaResponse] = None
    curso: Optional[CursoResponse] = None
    profesor: Optional[ProfesorResponse] = None
    unidad_academica: Optional[UnidadAcademicaResponse] = None

    # Serializadores para los campos de tiempo
    @field_serializer('hora_inicio', 'hora_fin')
    def serialize_time(self, v: Union[time, str], _info) -> str:
        if isinstance(v, str):
            return v
        return v.isoformat()
    
    @field_serializer('fecha_creacion', 'fecha_actualizacion')
    def serialize_datetime(self, v: datetime, _info) -> str:
        return v.isoformat()

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            time: lambda v: v.isoformat() if v else None
        }

class HorarioListResponse(BaseModel):
    items: List[HorarioResponse]
    total: int
    skip: int
    limit: int
