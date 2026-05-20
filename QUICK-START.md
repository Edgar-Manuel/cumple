# 🚀 Quick Start - CUMPLE API

## En 5 Minutos

### Opción A: Docker Compose (Recomendado)

```bash
# 1. Asegúrate de tener Docker instalado
docker --version

# 2. Levanta todo
docker-compose up -d

# 3. Accede a la API
open http://localhost:8000/docs

# 4. Base de datos
# PostgreSQL corre en localhost:5432
# Usuario: cumple_user
# Contraseña: cumple_password
```

### Opción B: Python Local

```bash
# 1. Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 2. Database (debes tener PostgreSQL)
createdb cumple_db

# 3. Ejecutar
python -m uvicorn app.main:app --reload

# 4. Accede a
open http://localhost:8000/docs
```

---

## Primer Uso

### 1. Registrar Usuario (en Swagger)

```
POST /auth/register
{
  "email": "test@example.com",
  "username": "testuser",
  "full_name": "Test User",
  "password": "testpass123"
}
```

### 2. Login

```
POST /auth/login
{
  "email": "test@example.com",
  "password": "testpass123"
}
```

**Guardar el `access_token`** - lo necesitarás para los próximos requests

### 3. Crear Contacto

En Swagger, haz click en "Authorize" (parte superior derecha)  
Pega: `Bearer YOUR_TOKEN_HERE`

Luego:
```
POST /contacts/
{
  "name": "Juan García",
  "relationship": "friend",
  "interests": "Tecnología, viajes"
}
```

### 4. Crear Evento

```
POST /events/
{
  "contact_id": 1,
  "title": "Cumpleaños de Juan",
  "event_type": "birthday",
  "date": "2026-12-25T00:00:00",
  "reminder_days": 7
}
```

### 5. Obtener Regalos Recomendados

```
GET /gifts/event/1
```

---

## Comandos Útiles

```bash
# Ver documentación automática
open http://localhost:8000/docs

# Health check
curl http://localhost:8000/health

# Tests
cd backend
pytest -v

# Logs
docker-compose logs -f api

# Detener todo
docker-compose down

# Ver estado de contenedores
docker-compose ps
```

---

## Problemas Comunes

### "Connection refused" en BD
```bash
# Verificar PostgreSQL
psql -U cumple_user -d cumple_db -c "SELECT 1;"

# O con Docker
docker ps | grep postgres
```

### "ModuleNotFoundError"
```bash
pip install -r requirements.txt --force-reinstall
```

### Puerto 8000 en uso
```bash
# Cambiar puerto en docker-compose.yml
# O ejecutar en puerto diferente
python -m uvicorn app.main:app --port 8001
```

---

## Siguiente: Frontend

Para conectar frontend:

1. Ve a `INTEGRACION-FRONTEND-API.md`
2. Crea `src/lib/apiClient.ts`
3. Actualiza `src/lib/AuthContext.tsx`
4. Conecta componentes

---

## Documentación Completa

- `backend/README.md` - Detalles técnicos
- `backend/SETUP.md` - Instalación paso a paso
- `INTEGRACION-FRONTEND-API.md` - Frontend
- `ESTADO-PROYECTO-V2.md` - Visión general
- `RESUMEN-TRABAJO-REALIZADO.md` - Qué se hizo

---

¡Listo! 🎉

Cualquier problema, revisa los README de cada carpeta.
