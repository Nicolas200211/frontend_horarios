from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, auth
from .database import engine, get_db, Base
from .profesores import routes as profesores_routes
from .unidades_academicas import routes as unidades_academicas_routes
from .unidades_academicas import models as unidades_models
from .cursos import routes as cursos_routes
from .aulas import routes as aulas_routes
from .horarios import router as horarios_router
from datetime import timedelta
import os

# Import all models to ensure they are registered with SQLAlchemy
# Importar los modelos después de que se hayan definido las tablas
# para evitar problemas de importación circular
from .profesores import models as profesores_models
from .unidades_academicas import models as unidades_models
from .cursos import models as cursos_models
from .aulas import models as aulas_models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(profesores_routes.router)
app.include_router(unidades_academicas_routes.router)
app.include_router(cursos_routes.router)
app.include_router(aulas_routes.router)
app.include_router(horarios_router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de autenticación"}

@app.post("/registro", response_model=schemas.User)
def crear_usuario(usuario: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # Verificar si el usuario ya existe
        db_user = db.query(models.Usuario).filter(
            (models.Usuario.usuario == usuario.usuario) | 
            (models.Usuario.correo == usuario.correo)
        ).first()
        
        if db_user:
            if db_user.usuario == usuario.usuario:
                raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")
            elif db_user.correo == usuario.correo:
                raise HTTPException(status_code=400, detail="El correo electrónico ya está en uso")
        
        # Crear token de acceso
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": usuario.usuario}, 
            expires_delta=access_token_expires
        )
        
        # Crear el nuevo usuario con el token
        hashed_password = auth.get_password_hash(usuario.contrasena)
        db_user = models.Usuario(
            usuario=usuario.usuario,
            correo=usuario.correo,
            contrasena=hashed_password,
            access_token=access_token,
            token_type="bearer"
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Crear respuesta del usuario
        user_response = db_user.to_dict()
        return user_response
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear el usuario: {str(e)}")

@app.post("/login", response_model=schemas.User)
async def login_for_access_token(
    login_data: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    try:
        # Autenticar usuario (puede ser por usuario o correo)
        user = auth.authenticate_user(
            db=db,
            username=login_data.username,
            email=login_data.email,
            password=login_data.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario/Correo o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Generar nuevo token
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": user.usuario}, 
            expires_delta=access_token_expires
        )
        
        # Actualizar el token en la base de datos
        user.access_token = access_token
        user.token_type = "bearer"
        db.commit()
        db.refresh(user)
        
        # Devolver la respuesta del usuario
        return user.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en el inicio de sesión: {str(e)}"
        )

@app.get("/usuarios/yo/", response_model=schemas.User)
async def read_users_me(current_user: dict = Depends(auth.get_current_user)):
    # Create a proper User response
    user_response = schemas.User(
        id=current_user["id"],
        usuario=current_user["usuario"],
        correo=current_user["correo"],
        fecha_creacion=current_user["fecha_creacion"],
        fecha_actualizacion=current_user["fecha_actualizacion"]
    )
    return user_response
