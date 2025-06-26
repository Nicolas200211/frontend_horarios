from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String(50), unique=True, index=True, nullable=False)
    correo = Column(String(100), unique=True, index=True, nullable=False)
    contrasena = Column(String(255), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), onupdate=func.now())
    access_token = Column(Text, nullable=True)
    token_type = Column(String(50), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "usuario": self.usuario,
            "correo": self.correo,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            "access_token": self.access_token,
            "token_type": self.token_type
        }

    def __repr__(self):
        return f"<Usuario(usuario='{self.usuario}', correo='{self.correo}'>"
