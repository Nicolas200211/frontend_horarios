from pydantic import BaseModel, EmailStr, Field, model_validator, ConfigDict
from typing import Optional, ClassVar
from datetime import datetime
from typing import Any

class Token(BaseModel):
    access_token: str
    token_type: str
    
    model_config = ConfigDict(
        from_attributes=True
    )

class TokenData(BaseModel):
    username: Optional[str] = None
    
    model_config = ConfigDict(
        from_attributes=True
    )

class UserBase(BaseModel):
    usuario: str
    correo: EmailStr
    
    model_config = ConfigDict(
        from_attributes=True
    )

class UserLogin(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "username": "usuario123",
                "email": "usuario@ejemplo.com",
                "password": "contraseña123"
            }
        }
    )
    
    @model_validator(mode='after')
    def check_username_or_email(self):
        if not self.username and not self.email:
            raise ValueError('Se requiere nombre de usuario o correo electrónico')
        return self

class UserCreate(UserBase):
    contrasena: str
    
    model_config = ConfigDict(
        from_attributes=True
    )

class User(UserBase):
    id: int
    fecha_creacion: Optional[datetime] = None
    fecha_actualizacion: Optional[datetime] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        },
        json_schema_extra={
            "example": {
                "id": 1,
                "usuario": "johndoe",
                "correo": "johndoe@example.com",
                "fecha_creacion": "2023-01-01T00:00:00",
                "fecha_actualizacion": "2023-01-01T00:00:00",
                "access_token": "string",
                "token_type": "bearer"
            }
        }
    )

class UserInDB(UserBase):
    contrasena: str
    id: int
    fecha_creacion: Optional[datetime] = None
    fecha_actualizacion: Optional[datetime] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        }
    )
