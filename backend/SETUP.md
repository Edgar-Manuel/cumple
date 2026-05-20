# Guía de Configuración - CUMPLE Backend

## Paso 1: Instalar Dependencias

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Paso 2: Configurar Base de Datos

### Opción A: PostgreSQL Local

```bash
# Crear base de datos (macOS/Linux)
createdb cumple_db

# O usando psql
psql -U postgres
CREATE DATABASE cumple_db;
\q
```

### Opción B: Con Docker

```bash
docker run --name cumple_db \
  -e POSTGRES_USER=cumple_user \
  -e POSTGRES_PASSWORD=cumple_password \
  -e POSTGRES_DB=cumple_db \
  -p 5432:5432 \
  -d postgres:15
```

## Paso 3: Configurar Variables de Entorno

```bash
cp .env.example .env
```

Editar `.env`:
```env
DATABASE_URL=postgresql://cumple_user:cumple_password@localhost:5432/cumple_db
SECRET_KEY=your-super-secret-key-change-in-production
OPENAI_API_KEY=sk-your-key-here
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

## Paso 4: Crear Tablas

```bash
# Ejecutar migraciones (automáticamente se crean las tablas en primera ejecución)
python -m uvicorn app.main:app --reload
```

La aplicación creará automáticamente las tablas en la primera ejecución.

## Paso 5: Verificar Instalación

Acceder a:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Prueba Rápida

### 1. Registrar Usuario

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "full_name": "Test User",
    "password": "testpass123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

Copiar el `access_token` de la respuesta.

### 3. Crear Contacto

```bash
curl -X POST http://localhost:8000/contacts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Juan García",
    "relationship": "friend",
    "interests": "Tecnología"
  }'
```

## Troubleshooting

### Error: "Could not connect to database"

```bash
# Verificar que PostgreSQL está corriendo
psql -U cumple_user -d cumple_db -c "SELECT 1;"

# Si usa Docker:
docker ps | grep cumple_db
```

### Error: "ModuleNotFoundError"

```bash
# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Error: "Secret key is not set"

Asegurarse que `.env` existe y tiene `SECRET_KEY`:
```bash
cat .env | grep SECRET_KEY
```

## Próximos Pasos

1. ✅ Backend API corriendo
2. ⬜ Conectar Frontend con API
3. ⬜ Integrar OpenAI
4. ⬜ Integrar Google Calendar
5. ⬜ Tests automatizados

Ver `README.md` para más información sobre endpoints y desarrollo.
