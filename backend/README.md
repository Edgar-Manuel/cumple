# CUMPLE Backend API

API REST para la plataforma CUMPLE de gestión de cumpleaños con IA.

## Características

- ✅ Autenticación JWT
- ✅ CRUD completo para Contactos, Eventos, Regalos
- ✅ Integración con OpenAI para generación de contenido
- ✅ Base de datos PostgreSQL con SQLAlchemy
- ✅ Validación con Pydantic
- ✅ CORS configurado
- ✅ Testing automatizado

## Stack Tecnológico

- **Framework**: FastAPI
- **Servidor**: Uvicorn
- **Base de Datos**: PostgreSQL + SQLAlchemy ORM
- **Autenticación**: JWT
- **Validación**: Pydantic
- **IA**: OpenAI API

## Instalación

### Requisitos
- Python 3.9+
- PostgreSQL 12+
- pip o poetry

### Pasos

1. **Clonar el repositorio**
```bash
cd backend
```

2. **Crear entorno virtual**
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

5. **Crear base de datos**
```bash
# Crear base de datos PostgreSQL
createdb cumple_db

# O en Windows con pgAdmin
```

6. **Ejecutar migraciones**
```bash
alembic upgrade head
```

7. **Iniciar servidor**
```bash
python -m uvicorn app.main:app --reload
```

El servidor estará disponible en `http://localhost:8000`

## Documentación API

Una vez ejecutando, accede a:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Endpoints Principales

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Login
- `GET /auth/me` - Obtener usuario actual

### Contactos
- `GET /contacts/` - Listar contactos
- `POST /contacts/` - Crear contacto
- `GET /contacts/{id}` - Obtener contacto
- `PUT /contacts/{id}` - Actualizar contacto
- `DELETE /contacts/{id}` - Eliminar contacto

### Eventos
- `GET /events/` - Listar eventos
- `GET /events/?upcoming=true&days=7` - Eventos próximos
- `POST /events/` - Crear evento
- `GET /events/{id}` - Obtener evento
- `PUT /events/{id}` - Actualizar evento
- `DELETE /events/{id}` - Eliminar evento

### Regalos
- `GET /gifts/event/{event_id}` - Regalos de un evento
- `POST /gifts/` - Crear recomendación
- `GET /gifts/{id}` - Obtener regalo
- `PUT /gifts/{id}` - Marcar como comprado
- `DELETE /gifts/{id}` - Eliminar

## Testing

```bash
# Ejecutar todos los tests
pytest

# Con coverage
pytest --cov=app

# Tests específicos
pytest tests/test_auth.py
```

## Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Punto de entrada
│   ├── config.py            # Configuración
│   ├── database.py          # Configuración BD
│   ├── models.py            # Modelos SQLAlchemy
│   ├── schemas.py           # Esquemas Pydantic
│   ├── auth.py              # Autenticación JWT
│   ├── ai_service.py        # Servicio OpenAI
│   └── routers/
│       ├── auth.py          # Endpoints auth
│       ├── contacts.py      # Endpoints contactos
│       ├── events.py        # Endpoints eventos
│       └── gifts.py         # Endpoints regalos
├── tests/                   # Tests unitarios
├── requirements.txt         # Dependencias
├── .env.example            # Variables de entorno
└── README.md
```

## Desarrollo

### Agregar nueva ruta

1. Crear archivo en `app/routers/`
2. Registrar en `app/main.py`

### Agregar nuevo modelo

1. Definir en `app/models.py`
2. Crear schema en `app/schemas.py`
3. Crear migrations con alembic

```bash
alembic revision --autogenerate -m "Add new model"
alembic upgrade head
```

## Despliegue

Ver `docker-compose.yml` y `Dockerfile` para despliegue con contenedores.

```bash
# Build y run con Docker Compose
docker-compose up -d
```

## Variables de Entorno

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cumple_db
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

## Licencia

MIT
