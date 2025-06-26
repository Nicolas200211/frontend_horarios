# 🎓 Sistema de Gestión de Horarios Académicos

## 📋 Descripción del Proyecto

Sistema integral para la gestión de horarios académicos desarrollado para instituciones educativas. Permite la administración completa de recursos académicos incluyendo profesores, aulas, cursos y unidades académicas, con una interfaz intuitiva y moderna.

## 🎯 Objetivos del Proyecto

- Optimizar la gestión de horarios académicos
- Facilitar la administración de recursos educativos
- Mejorar la experiencia del usuario en la gestión académica
- Reducir tiempos de planificación de horarios
- Generar reportes y estadísticas académicas

## 🚀 Características Principales

### 🔍 Módulos Principales
- **Gestión de Profesores**
  - Registro y actualización de datos
  - Asignación de materias y horarios
  - Visualización de disponibilidad

- **Administración de Aulas**
  - Control de capacidad y recursos
  - Asignación inteligente de espacios
  - Gestión de recursos por aula

- **Gestión de Cursos**
  - Creación y edición de cursos
  - Asignación de profesores
  - Control de cupos y horarios

- **Unidades Académicas**
  - Organización jerárquica
  - Gestión de departamentos
  - Asignación de recursos

- **Generación de Horarios**
  - Creación automática de horarios
  - Detección de conflictos
  - Asignación óptima de recursos

### Backend (FastAPI + MySQL)
- API RESTful con FastAPI
- Autenticación JWT
- Base de datos MySQL con SQLAlchemy ORM
- Documentación interactiva con Swagger UI
- Validación de datos con Pydantic v2

## 🛠️ Arquitectura y Tecnologías

### Frontend (Interfaz de Usuario)
- **Framework**: React 19
- **Lenguaje**: TypeScript
- **UI/UX**:
  - Ant Design v5 para componentes de interfaz
  - Tailwind CSS para estilos personalizados
  - Framer Motion para animaciones fluidas
- **Gestión de Estado**:
  - React Context API para estado global
  - Hooks personalizados para lógica reutilizable
- **Enrutamiento**: React Router v7
- **Herramientas de Desarrollo**:
  - Vite como bundler principal
  - ESLint y Prettier para calidad de código
  - React DevTools para depuración

### Backend (API y Lógica de Negocio)
- **Framework**: FastAPI
- **Lenguaje**: Python 3.8+
- **Base de Datos**:
  - MySQL 8.0+
  - SQLAlchemy 2.0 como ORM
- **Autenticación**:
  - JWT (JSON Web Tokens)
  - OAuth2 con contraseña y bearer
- **Validación de Datos**:
  - Pydantic v2 para validación de esquemas
  - Validación personalizada para reglas de negocio
- **Documentación Automática**:
  - Swagger UI (/docs)
  - ReDoc (/redoc)
- **Seguridad**:
  - CORS configurado
  - Protección contra inyección SQL
  - Hasheo seguro de contraseñas con bcrypt

### Backend
- **Framework**: FastAPI
- **Lenguaje**: Python 3.8+
- **Base de Datos**: MySQL
- **ORM**: SQLAlchemy 2.0
- **Autenticación**: JWT
- **Validación**: Pydantic v2
- **Documentación**: Swagger UI, ReDoc

## 📦 Requisitos del Sistema

- Node.js 16+
- Python 3.8+
- MySQL 8.0+
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd frontend_horarios
```

### 2. Configuración del Backend

```bash
# Navegar al directorio de la API
cd api

# Crear y activar entorno virtual (recomendado)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar el archivo .env con tus credenciales de MySQL
```

### 3. Configuración del Frontend

```bash
# Volver al directorio raíz
cd ..

# Instalar dependencias
npm install
# o
yarn install
```

## ⚙️ Configuración

### Variables de Entorno (Backend)

Crea un archivo `.env` en la carpeta `api/` con las siguientes variables:

```env
# Configuración de la Base de Datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=horarios_db

# Configuración de Autenticación
SECRET_KEY=clave_secreta_muy_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 horas
```

## 🏃 Ejecución

### Iniciar el Backend

```bash
cd api
uvicorn app.main:app --reload
```

### Iniciar el Frontend

```bash
# En una terminal separada
npm run dev
# o
yarn dev
```

### Acceso a la Aplicación

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Admin Dashboard**: http://localhost:5173/admin

## 📁 Estructura del Proyecto

```
frontend_horarios/
├── api/                         # Backend (FastAPI)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Punto de entrada de la API
│   │   ├── auth.py              # Autenticación JWT
│   │   ├── database.py          # Configuración de la base de datos
│   │   ├── models.py            # Modelos de la base de datos
│   │   ├── schemas.py           # Esquemas Pydantic
│   │   ├── profesores/          # Rutas y modelos de profesores
│   │   ├── aulas/               # Rutas y modelos de aulas
│   │   ├── cursos/              # Rutas y modelos de cursos
│   │   └── horarios/            # Rutas y modelos de horarios
│   └── requirements.txt         # Dependencias de Python
│
├── src/                        # Frontend (React + TypeScript)
│   ├── admin/                   # Módulos de administración
│   │   ├── admin_profesores/    # Gestión de profesores
│   │   ├── admin_aulas/         # Gestión de aulas
│   │   ├── admin_cursos/        # Gestión de cursos
│   │   ├── admin_horarios/      # Gestión de horarios
│   │   └── admin_unidades_academicas/  # Gestión de unidades académicas
│   ├── components/              # Componentes reutilizables
│   ├── App.tsx                  # Componente principal
│   └── main.tsx                 # Punto de entrada
│
└── README.md                   # Este archivo
```

## 📚 Documentación de la API

La documentación interactiva de la API está disponible en:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Endpoints Principales

#### Autenticación
- `POST /token` - Obtener token de acceso
- `POST /registro` - Registrar nuevo usuario
- `GET /users/me` - Obtener información del usuario actual

#### Gestión de Profesores
- `GET /profesores/` - Listar todos los profesores
- `POST /profesores/` - Crear nuevo profesor
- `GET /profesores/{id}` - Obtener profesor por ID
- `PUT /profesores/{id}` - Actualizar profesor
- `DELETE /profesores/{id}` - Eliminar profesor

#### Gestión de Aulas
- `GET /aulas/` - Listar todas las aulas
- `POST /aulas/` - Crear nueva aula
- `GET /aulas/{id}` - Obtener aula por ID
- `PUT /aulas/{id}` - Actualizar aula
- `DELETE /aulas/{id}` - Eliminar aula

## 🤝 Contribución

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📊 Beneficios Clave

### Para la Institución Educativa
- **Ahorro de Tiempo**: Reducción significativa en la planificación de horarios
- **Optimización de Recursos**: Uso eficiente de aulas y profesores
- **Reducción de Errores**: Minimización de conflictos en la asignación
- **Acceso Remoto**: Disponibilidad 24/7 desde cualquier dispositivo
- **Reportes en Tiempo Real**: Toma de decisiones basada en datos

### Para los Docentes
- Autoservicio para consulta de horarios
- Notificaciones de cambios
- Acceso a información actualizada
- Interfaz intuitiva y fácil de usar

### Para los Administradores
- Panel de control completo
- Gestión centralizada de recursos
- Generación de reportes detallados
- Herramientas de análisis y estadísticas

## 📅 Próximas Mejoras

- [ ] Aplicación móvil para consulta de horarios
- [ ] Integración con sistemas académicos existentes
- [ ] Módulo de asistencia de estudiantes
- [ ] Sistema de notificaciones push
- [ ] Análisis predictivo para optimización de recursos

## 📞 Soporte y Contacto

Para soporte técnico o más información, por favor contactar a:

- **Correo Electrónico**: soporte@institucion.edu
- **Teléfono**: +51 XXX XXX XXX
- **Horario de Atención**: Lunes a Viernes de 8:00 AM a 6:00 PM

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

<div align="center">
  <p>© 2025 Sistema de Gestión de Horarios Académicos - Todos los derechos reservados</p>
</div>

