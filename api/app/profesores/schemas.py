from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, Any
from datetime import datetime

class ProfesorBase(BaseModel):
    nombres: str = Field(..., max_length=100)
    apellidos: str = Field(..., max_length=100)
    genero: str = Field(..., pattern="^(M|F|Otro)$")
    activo: bool = True
    unidad_academica_id: int = Field(..., gt=0, description="ID de la unidad académica a la que pertenece el profesor")

class ProfesorCreate(ProfesorBase):
    pass

class ProfesorUpdate(BaseModel):
    nombres: Optional[str] = Field(None, max_length=100)
    apellidos: Optional[str] = Field(None, max_length=100)
    genero: Optional[str] = Field(None, pattern="^(M|F|Otro)$")
    activo: Optional[bool] = None

class UnidadAcademicaResponse(BaseModel):
    id: int
    nombre: str
    
    model_config = ConfigDict(
        from_attributes=True
    )

class Profesor(ProfesorBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    unidad_academica_id: Optional[int] = None
    unidad_academica: Optional[UnidadAcademicaResponse] = None
    
    @field_validator('unidad_academica_id', mode='before')
    def validate_unidad_academica_id(cls, v):
        # Allow None or convert to int
        if v is None:
            return None
        try:
            return int(v)
        except (TypeError, ValueError):
            return None
    
    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        },
        json_schema_extra={
            "example": {
                "id": 1,
                "nombres": "Juan",
                "apellidos": "Pérez",
                "genero": "M",
                "activo": True,
                "unidad_academica_id": 1,
                "unidad_academica": {
                    "id": 1,
                    "nombre": "Facultad de Ingeniería"
                },
                "fecha_creacion": "2023-01-01T00:00:00",
                "fecha_actualizacion": "2023-01-01T00:00:00"
            }
        }
    )
