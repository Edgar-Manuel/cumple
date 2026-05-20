# 🎉 CUMPLE - Nunca Más Olvides un Cumpleaños

> **La solución inteligente para recordar cada momento especial de las personas que amas**

---

## ¿Qué es CUMPLE?

CUMPLE es una plataforma SaaS impulsada por inteligencia artificial que te ayuda a **nunca más olvidar cumpleaños, aniversarios y eventos especiales** de las personas importantes en tu vida.

Utilizamos IA avanzada para generar recomendaciones de regalos personalizadas, crear mensajes emotivos, y enviar recordatorios inteligentes en el momento perfecto.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│  Frontend (React 18 + TypeScript + Vite)    │
│  ├── apiClient.ts (fetch + JWT auto-refresh)│
│  ├── AuthContext (login/register/logout)    │
│  ├── 4 servicios HTTP                       │
│  ├── 21 hooks React Query                   │
│  └── 7 páginas protegidas                   │
└────────────────┬────────────────────────────┘
                 │ HTTP/REST + JWT
                 │ Access token (30 min)
                 │ Refresh token (7 días, auto)
┌────────────────▼────────────────────────────┐
│  Backend (FastAPI + PostgreSQL)              │
│  ├── Rate limiting (slowapi)                │
│  ├── JWT + Argon2                           │
│  ├── Alembic migrations                     │
│  ├── OpenAI SDK >= 1.0 (AsyncOpenAI)        │
│  └── 5 routers: auth, contacts, events,     │
│      gifts, ai (29 endpoints)                │
└────────────────┬────────────────────────────┘
                 │ SQLAlchemy ORM
┌────────────────▼────────────────────────────┐
│  PostgreSQL                                  │
│  ├── users (auth, profile)                  │
│  ├── contacts (relaciones, intereses)       │
│  ├── events (cumpleaños, aniversarios)      │
│  ├── gifts (recomendaciones IA)             │
│  └── messages (mensajes generados)          │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18+** - UI moderna y responsiva
- **TypeScript** - Código seguro y mantenible
- **Vite** - Build rápido y optimizado
- **Tailwind CSS** - Diseño utility-first
- **shadcn/ui** - Componentes accesibles de alta calidad
- **TanStack Query** - Gestión de datos en caché
- **React Router DOM** - Navegación con rutas protegidas

### Backend
- **Python 3.10+** - Lógica de negocio robusta
- **FastAPI** - APIs REST performantes con documentación automática
- **SQLAlchemy 2.0** - ORM con relaciones y cascade
- **Alembic** - Migraciones de base de datos
- **OpenAI SDK >= 1.0** - Generación de contenido con IA
- **Argon2** - Hashing de contraseñas
- **SlowAPI** - Rate limiting

### Base de Datos
- **PostgreSQL** - Base de datos relacional principal

---

## 🚀 Características

### ✅ Completadas
- **Autenticación JWT** con refresh tokens (sesión persistente 7 días)
- **CRUD completo** de contactos, eventos y regalos
- **Rate limiting** en login (5 intentos/minuto)
- **Generación de mensajes** personalizados con IA
- **Recomendaciones de regalos** con IA (estructuradas, se guardan en BD)
- **Generación de posts** para redes sociales
- **Dashboard interactivo** con estadísticas y calendario
- **Filtrado por categorías** en contactos y eventos
- **Documentación Swagger** automática en `/docs`

### ⏳ Pendientes
- Google Calendar sync
- Email/WhatsApp notifications
- Stripe payments
- E2E tests
- Mobile app

---

## 📋 Endpoints API

### Autenticación
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Login (devuelve access + refresh token) |
| POST | `/auth/refresh` | Renovar tokens |
| GET | `/auth/me` | Perfil del usuario actual |

### Contactos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/contacts/` | Listar contactos |
| POST | `/contacts/` | Crear contacto |
| GET | `/contacts/{id}` | Obtener contacto |
| PUT | `/contacts/{id}` | Actualizar contacto |
| DELETE | `/contacts/{id}` | Eliminar contacto |

### Eventos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/events/` | Listar eventos |
| GET | `/events/?upcoming=true` | Eventos próximos |
| POST | `/events/` | Crear evento |
| GET | `/events/{id}` | Obtener evento |
| PUT | `/events/{id}` | Actualizar evento |
| DELETE | `/events/{id}` | Eliminar evento |

### Regalos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/gifts/event/{id}` | Regalos de un evento |
| POST | `/gifts/` | Crear recomendación |
| GET | `/gifts/{id}` | Obtener regalo |
| PUT | `/gifts/{id}` | Marcar como comprado |
| DELETE | `/gifts/{id}` | Eliminar regalo |

### IA
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/ai/messages/generate` | Generar mensaje personalizado |
| POST | `/ai/gifts/recommendations` | Generar y guardar recomendaciones |
| POST | `/ai/social/generate` | Generar post para redes sociales |
| GET | `/ai/messages/event/{id}` | Listar mensajes de un evento |

---

## 🚀 Desarrollo Local

### Requisitos
- **Node.js 20-22** (v24 tiene bug conocido con Termux/proot)
- **Python 3.10+**
- **PostgreSQL** (o SQLite para desarrollo)
- **npm** o **bun**

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor
uvicorn app.main:app --reload
```

Backend disponible en `http://localhost:8000`  
Documentación Swagger en `http://localhost:8000/docs`

### Frontend

```bash
# Instalar dependencias
npm install
# o con bun
bun install

# Crear .env
echo "VITE_API_ENDPOINT=http://localhost:8000" > .env

# Iniciar servidor de desarrollo
npm run dev
# o con bun
bun run dev
```

Frontend disponible en `http://localhost:5173`

### Docker

```bash
docker-compose up -d
```

---

## 📁 Estructura del Proyecto

```
cumple/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── main.py             # Entry point
│   │   ├── config.py           # Settings
│   │   ├── database.py         # SQLAlchemy
│   │   ├── models.py           # 5 modelos ORM
│   │   ├── schemas.py          # 8 schemas Pydantic
│   │   ├── auth.py             # JWT + Argon2
│   │   ├── ai_service.py       # OpenAI service
│   │   ├── limiter.py          # Rate limiter
│   │   └── routers/
│   │       ├── auth.py         # 4 endpoints
│   │       ├── contacts.py     # 5 endpoints
│   │       ├── events.py       # 6 endpoints
│   │       ├── gifts.py        # 5 endpoints
│   │       └── ai.py           # 4 endpoints IA
│   ├── alembic/                # Migraciones
│   ├── tests/                  # Tests
│   └── requirements.txt
├── src/                        # Frontend React
│   ├── pages/                  # 7 páginas
│   ├── components/             # UI components
│   ├── hooks/                  # 21 hooks React Query
│   ├── services/               # 5 servicios HTTP
│   ├── lib/                    # apiClient, AuthContext
│   └── types/                  # TypeScript types
├── agent-zero/                 # Framework IA (referencia)
├── cumple-prompts/             # Prompts para agentes IA
├── docker-compose.yml
└── README.md
```

---

## 🔐 Seguridad

- ✅ JWT con access tokens (30 min) + refresh tokens (7 días)
- ✅ Auto-refresh automático al recibir 401
- ✅ Rate limiting en login (5 intentos/minuto)
- ✅ Contraseñas con Argon2 (mínimo 8 caracteres)
- ✅ CORS configurado con lista blanca
- ✅ Validación de entrada en todos los endpoints
- ✅ SECRET_KEY generado con `secrets.token_urlsafe(64)`

---

## 📊 Estado del Proyecto

**Versión**: 1.0.0  
**Estado**: 🟢 **Listo para Producción**  
**Progreso**: ~75%

| Área | Progreso |
|---|---|
| Backend API | ✅ 100% |
| Frontend UI | ✅ 100% |
| Integración Frontend↔Backend | ✅ 100% |
| Autenticación | ✅ 100% |
| IA (OpenAI) | ✅ 100% |
| Google Calendar | ❌ 0% |
| Notificaciones | ❌ 0% |
| Pagos (Stripe) | ❌ 0% |
| Tests E2E | ❌ 0% |

---

## 📝 Documentación Adicional

- [Estado de Producción](./ESTADO-PRODUCCION.md) - Checklist y guía de deploy
- [Auditoría Completa](./AUDITORIA-2026-05-20.md) - Análisis detallado del proyecto
- [Sesión de Migración](./SESION-MIGRACION-2026-05-20.md) - Contexto de la migración frontend
- [Estado del Proyecto V2](./ESTADO-PROYECTO-V2.md) - Visión general
- [Progreso](./PROGRESO.md) - Hitos y métricas

---

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

<div align="center">

### 🎁 CUMPLE: Nunca más olvides un cumpleaños

⭐ Si te gusta CUMPLE, ¡no olvides darle una estrella en GitHub! ⭐

</div>
