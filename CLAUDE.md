# CLAUDE.md - Contexto del Proyecto CUMPLE

> **Lee este archivo completo antes de hacer cualquier cambio en el proyecto.**

---

## 📌 Qué es CUMPLE

CUMPLE es una plataforma SaaS para gestión de cumpleaños y eventos especiales con IA. Tiene un frontend React+TypeScript y un backend FastAPI+PostgreSQL.

**Repositorio**: https://github.com/Edgar-Manuel/cumple  
**Estado**: 🟢 Listo para producción (~75% completado)

---

## 🏗️ Arquitectura

### Frontend (React 18 + TypeScript + Vite)
- **Cliente HTTP**: `src/lib/apiClient.ts` — usa `fetch` nativo con interceptor JWT y auto-refresh
- **Auth**: `src/lib/AuthContext.tsx` — login/register/logout via API, usa `apiClient`
- **Servicios**: `src/services/` — 5 servicios HTTP (auth, contacts, events, gifts, ai)
- **Hooks**: `src/hooks/` — 21 hooks de TanStack Query (useContacts, useEvents, useGifts, useAI)
- **Tipos**: `src/types/api.ts` — sincronizados con schemas Pydantic del backend
- **Rutas**: `src/routes/index.tsx` — 7 páginas protegidas + login + landing

### Backend (FastAPI + PostgreSQL)
- **Entry point**: `backend/app/main.py`
- **Modelos**: `backend/app/models.py` — 5 modelos (User, Contact, Event, Gift, Message)
- **Schemas**: `backend/app/schemas.py` — 8 schemas Pydantic con validación
- **Auth**: `backend/app/auth.py` — JWT + Argon2 (NO uses bcrypt, no compila en todos los sistemas)
- **IA**: `backend/app/ai_service.py` — OpenAI SDK >= 1.0 con AsyncOpenAI
- **Routers**: `backend/app/routers/` — auth, contacts, events, gifts, ai (29 endpoints)
- **Migraciones**: `backend/alembic/` — configurado, usa `alembic upgrade head`

---

## 🔑 Decisiones de Arquitectura (NO cambiar sin consultar)

1. **Cliente HTTP**: `fetch` nativo, NO axios. Tiene auto-refresh de tokens en 401.
2. **State management**: React Query para server state, `useState` para UI state. NO Redux/Zustand.
3. **Auth**: JWT en localStorage con access (30 min) + refresh (7 días). Auto-refresh transparente.
4. **Password hashing**: Argon2 (`argon2-cffi`), NO bcrypt.
5. **Filtrado**: Client-side en frontend, NO en API (excepto `?upcoming=true`).
6. **Imports**: `relationship` en models.py se importa como `rel` para evitar colisión con columna.
7. **OpenAI**: Import opcional — el backend funciona sin API key (usando fallbacks).
8. **Rate limiting**: `slowapi` con Limiter en módulo separado (`app/limiter.py`) para evitar circular imports.

---

## 🚀 Cómo Levantar el Proyecto

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env: DATABASE_URL, OPENAI_API_KEY
uvicorn app.main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend
```bash
npm install
echo "VITE_API_ENDPOINT=http://localhost:8000" > .env
npm run dev
# Frontend: http://localhost:5173
```

### ⚠️ Nota importante sobre Node.js
- **Node.js v24 tiene un bug** con ESM loader en Termux/proot-distro (ERR_UNKNOWN_FILE_EXTENSION)
- Usa **Node.js 20-22** para desarrollo
- Si usas Termux, instala con `fnm` o `nvm`: `fnm install 22`

---

## 📋 Endpoints API (29 total)

### Auth (4)
- `POST /auth/register` → UserSchema
- `POST /auth/login` → Token (access_token + refresh_token)
- `POST /auth/refresh` → Token (renueva ambos tokens)
- `GET /auth/me` → UserSchema (requiere auth)

### Contacts (5)
- `GET /contacts/?skip=0&limit=100` → List[Contact]
- `POST /contacts/` → Contact
- `GET /contacts/{id}` → Contact
- `PUT /contacts/{id}` → Contact
- `DELETE /contacts/{id}` → 204

### Events (6)
- `GET /events/?upcoming=true&days=7` → List[Event]
- `GET /events/` → List[Event]
- `POST /events/` → Event
- `GET /events/{id}` → Event
- `PUT /events/{id}` → Event
- `DELETE /events/{id}` → 204

### Gifts (5)
- `GET /gifts/event/{event_id}` → List[Gift]
- `POST /gifts/` → Gift
- `GET /gifts/{id}` → Gift
- `PUT /gifts/{id}` → Gift
- `DELETE /gifts/{id}` → 204

### AI (4)
- `POST /ai/messages/generate` → Message (genera y guarda)
- `POST /ai/gifts/recommendations` → List[Gift] (genera y guarda en BD)
- `POST /ai/social/generate` → {content: string}
- `GET /ai/messages/event/{event_id}` → List[Message]

### Utilidad (1)
- `GET /health` → {status: "ok"}

---

## 🔧 Convenciones de Código

### Frontend
- **Componentes**: PascalCase (`ContactList.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useContacts.ts`)
- **Servicios**: camelCase (`contactsService.ts`)
- **Tipos**: PascalCase con prefijo `Api` (`ApiContact`, `ApiEvent`)
- **Imports**: usa alias `@/` para `src/`
- **Errores**: usa `ApiClientError` del apiClient
- **Toast**: usa `useToast()` de shadcn/ui

### Backend
- **Routers**: prefijo en paths (`/auth`, `/contacts`, etc.)
- **Schemas**: Pydantic v2 con `from_attributes = True`
- **Modelos**: SQLAlchemy 2.0 con `relationship` como `rel`
- **Errores**: `HTTPException` con `status_code` y `detail`
- **Auth**: decorator `Depends(get_current_active_user)` en endpoints protegidos
- **Rate limiting**: `@limiter.limit("5/minute")` en endpoints sensibles

---

## 🚫 Cosas que NO hacer

1. **NO reintroducir Supabase** — fue eliminado intencionalmente
2. **NO usar bcrypt** — usa argon2-cffi (bcrypt no compila en todos los sistemas)
3. **NO usar `openai.ChatCompletion.acreate()`** — API deprecated, usa `AsyncOpenAI().chat.completions.create()`
4. **NO importar Limiter desde main.py** — causa circular import, usa `app.limiter`
5. **NO usar `relationship` directamente en models.py** — colisiona con columna, usa `rel`
6. **NO agregar código muerto** — ya eliminamos ~7,500 líneas de servicios mock no usados
7. **NO hardcodear SECRET_KEY** — usa `secrets.token_urlsafe(64)` como default
8. **NO usar `Base.metadata.create_all()` en producción** — usa Alembic

---

## 📁 Archivos Clave

| Archivo | Propósito |
|---|---|
| `src/lib/apiClient.ts` | Cliente HTTP con JWT auto-refresh |
| `src/lib/AuthContext.tsx` | Contexto de autenticación |
| `src/types/api.ts` | Tipos TypeScript sincronizados con backend |
| `backend/app/main.py` | Entry point FastAPI |
| `backend/app/auth.py` | JWT + Argon2 |
| `backend/app/ai_service.py` | OpenAI service (SDK >= 1.0) |
| `backend/app/schemas.py` | Pydantic schemas con validación |
| `backend/app/models.py` | SQLAlchemy models |
| `backend/app/limiter.py` | Rate limiter (módulo separado) |

---

## 🐛 Bugs Conocidos

1. **Node.js v24 + Termux/proot**: ESM loader falla con archivos `.l2s`. Solución: usar Node 20-22.
2. **Credenciales Supabase en git history**: La clave anon key fue expuesta en commits anteriores. Debe rotarse.
3. **Sin refresh token rotation**: Los refresh tokens no rotan al usarse (funcional pero no ideal para seguridad).

---

## 📋 Tareas Pendientes (por prioridad)

### Alta
- [ ] Rotar credenciales de Supabase (expuestas en git history)
- [ ] Configurar HTTPS en producción
- [ ] Base de datos PostgreSQL en producción (Railway/Neon/Supabase)

### Media
- [ ] Google Calendar sync (OAuth + webhooks)
- [ ] Email notifications (SendGrid/Resend)
- [ ] WhatsApp notifications (Twilio)
- [ ] Tests E2E (Playwright/Cypress)
- [ ] Refresh token rotation

### Baja
- [ ] Stripe payments
- [ ] Mobile app
- [ ] Monitoreo (Sentry)
- [ ] Backups automáticos

---

## 📝 Historial de Cambios Recientes

| Commit | Descripción |
|---|---|
| `a37ee78` | Fix import circular + compatibilidad Termux (argon2, openai opcional) |
| `72c00b2` | docs: ESTADO-PRODUCCION.md con checklist y guía de deploy |
| `fc030de` | chore: eliminar 11 scripts de Windows |
| `1387910` | feat: configurar Alembic para migraciones |
| `35a8979` | feat: implementar refresh tokens |
| `789e9d7` | feat(security): rate limiting, contraseñas 8+, SECRET_KEY |
| `762c81c` | fix: actualizar OpenAI a SDK moderno + fix endpoint gifts |
| `3651210` | chore: eliminar 14 archivos de código muerto |
| `b4e18fe` | feat: migrar páginas a React Query API |

---

## 💡 Tips para Trabajar en Este Proyecto

1. **Siempre verifica imports** después de cambiar modelos o schemas
2. **El backend funciona sin OpenAI** — no bloquea el desarrollo si no tienes API key
3. **Los tests están en `backend/tests/`** — usa `pytest -v` para ejecutar
4. **Swagger docs** en `/docs` siempre están actualizadas (FastAPI las genera automáticamente)
5. **El frontend usa SQLite por defecto** en desarrollo — no necesitas PostgreSQL local
6. **Los hooks de React Query** tienen invalidación automática en `onSuccess`
7. **El apiClient** maneja 401 automáticamente con refresh token — no necesitas manejarlo en componentes
