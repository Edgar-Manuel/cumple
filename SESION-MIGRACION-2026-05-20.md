# 📋 SESIÓN DE MIGRACIÓN - 20 Mayo 2026

> **Contexto para Claude Code (o cualquier agente de desarrollo)**
> Este documento resume todo lo trabajado en la sesión de migración del frontend de CUMPLE desde Supabase/local storage hacia la API REST propia (FastAPI + PostgreSQL).

---

## 🎯 Objetivo de la Sesión

Migrar todas las páginas del frontend React para que usen los hooks de React Query (`useContacts`, `useEvents`, `useGifts`, `useAI`) en lugar de Supabase o localStorage, conectando con el backend API en FastAPI.

---

## ✅ Lo que se hizo (en orden)

### 1. Contacts.tsx + ContactList.tsx
**Problema**: Los 4 tabs (Todos, Favoritos, Familia, Amigos) renderizaban el mismo `ContactList` sin filtrado.

**Cambios**:
- `Contacts.tsx`: Tabs controlados con `useState("all")` + `onValueChange`. Cada tab pasa `categoryFilter` diferente.
- `ContactList.tsx`: Agregada prop `categoryFilter?: string | null`. El `filteredContacts` ahora filtra por:
  - `null` → sin filtro
  - `"favorites"` → affinity >= 4
  - `"Familiar"` / `"Amigo/a"` → filtra por `relationship`

**Estado**: ✅ Completo

### 2. Events.tsx + EventList.tsx
**Problema**: Mismo patrón que Contacts — 4 tabs sin filtrado real.

**Cambios**:
- `Events.tsx`: Tabs controlados, cada tab pasa `categoryFilter` (`"birthday"`, `"anniversary"`, `"other"`, `null`).
- `EventList.tsx`: Agregada prop `categoryFilter`. `filteredEvents` filtra por `event.type === categoryFilter`.

**Estado**: ✅ Completo

### 3. Dashboard.tsx
**Problema**: Código muerto (`useCreateContact`, `handleCreateContact`), prop inexistente en `CreateContactDialog`, loading solo en tab overview.

**Cambios**:
- Eliminado `useCreateContact` y `handleCreateContact` (el dialog maneja su propia creación).
- `CreateContactDialog`: Removido `onCreateContact`, agregado `onSuccess` para abrir dialog de evento tras crear contacto.
- `handleCreateEvent`: Ahora usa `data.contactId` directamente en vez de buscar por nombre.
- Agregado `apiError` con UI de error global (antes no mostraba errores de API).
- Loading/error se muestran antes que las cards del dashboard, no dentro del tab.

**Estado**: ✅ Completo

### 4. Gifts.tsx
**Problema**: Usaba un `useEffect` manual con `giftsService.listByEvent()` en bucle, en vez de los hooks de React Query.

**Cambios**:
- Reemplazado `useEffect` + estado manual por `useQueries` de `@tanstack/react-query`.
- Cada evento tiene su query de regalos gestionada por React Query (cache, refetch, etc.).
- Removido import de `giftsService` directo (ahora solo se usa dentro de `useQueries`).

**Estado**: ✅ Completo

### 5. EventGifts.tsx
**Estado**: ✅ Ya estaba migrado (usaba `useEvent`, `useContact`, `useGiftsByEvent`, `useGenerateGiftRecommendations`).

---

## 🏗️ Arquitectura Actual del Frontend

```
src/
├── lib/
│   ├── apiClient.ts          ← Cliente HTTP con JWT (fetch nativo)
│   ├── AuthContext.tsx       ← Auth migrado de Supabase a API
│   └── supabase.ts           ← ⚠️ MUERTO, eliminar
│
├── services/                 ← Capa de servicios HTTP
│   ├── authService.ts        ← login, register, getCurrentUser, logout
│   ├── contactsService.ts    ← CRUD contactos
│   ├── eventsService.ts      ← CRUD eventos + upcoming
│   ├── giftsService.ts       ← CRUD regalos
│   └── aiService.ts          ← Generación IA (mensajes, regalos, posts)
│
├── hooks/                    ← Hooks de React Query
│   ├── useContacts.ts        ← useContacts, useContact, useCreateContact, useUpdateContact, useDeleteContact
│   ├── useEvents.ts          ← useEvents, useUpcomingEvents, useEvent, useCreateEvent, useUpdateEvent, useMarkEventCompleted, useDeleteEvent
│   ├── useGifts.ts           ← useGiftsByEvent, useGift, useCreateGift, useMarkGiftPurchased, useDeleteGift
│   └── useAI.ts              ← useGenerateMessage, useGenerateGiftRecommendations, useGenerateSocialPost, useEventMessages
│
├── types/
│   ├── api.ts                ← Tipos sincronizados con backend (ApiUser, ApiContact, ApiEvent, ApiGift, ApiMessage)
│   └── gift.ts               ← GiftRecommendation (frontend-only)
│
└── pages/
    ├── Dashboard.tsx         ← ✅ Migrado
    ├── Contacts.tsx          ← ✅ Migrado
    ├── Events.tsx            ← ✅ Migrado
    ├── Gifts.tsx             ← ✅ Migrado
    ├── EventGifts.tsx        ← ✅ Ya estaba migrado
    ├── Login.tsx             ← ✅ Ya estaba migrado
    └── Profile.tsx           ← ⚠️ Revisar (posiblemente usa Supabase)
```

---

## 🔧 Backend API (FastAPI)

```
backend/app/
├── main.py              ← FastAPI app, CORS, routers
├── config.py            ← Settings (DATABASE_URL, SECRET_KEY, OPENAI_API_KEY, CORS_ORIGINS)
├── database.py          ← SQLAlchemy engine + session
├── models.py            ← 5 modelos: User, Contact, Event, Gift, Message
├── schemas.py           ← 8 schemas Pydantic
├── auth.py              ← JWT: create_access_token, get_current_user, hash_password
├── ai_service.py        ← OpenAI integration (generate_gift_message, generate_gift_recommendations, generate_social_post)
└── routers/
    ├── auth.py          ← POST /auth/register, POST /auth/login, GET /auth/me
    ├── contacts.py      ← CRUD contactos (5 endpoints)
    ├── events.py        ← CRUD eventos + upcoming (6 endpoints)
    ├── gifts.py         ← CRUD regalos (5 endpoints)
    └── ai.py            ← 4 endpoints IA (messages, gifts, social)
```

**Total endpoints**: 28 (24 CRUD + 4 AI)

---

## ⚠️ Archivos que necesitan atención

### Eliminar (ya no se usan):
| Archivo | Razón |
|---|---|
| `src/lib/supabase.ts` | Auth migrado a API, ya no se importa en ningún componente activo |
| `src/scripts/getUserId.ts` | Script aislado que usa Supabase |
| `src/lib/AgentZeroService.ts.bak` | Backup |
| `src/lib/AgentZeroService.ts.copy` | Backup |

### Revisar:
| Archivo | Razón |
|---|---|
| `src/pages/Profile.tsx` | Posiblemente usa Supabase para actualizar perfil |
| `src/pages/Login.tsx` | Ya migrado, pero verificar que no haya referencias indirectas a Supabase |
| `package.json` | Verificar si `@supabase/supabase-js` sigue como dependencia |

---

## 🚀 Cómo levantar el proyecto

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env con tus credenciales
uvicorn app.main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Frontend
```bash
npm install
# Crear .env con: VITE_API_ENDPOINT=http://localhost:8000
npm run dev
# Frontend: http://localhost:5173
```

### Docker (opcional)
```bash
docker-compose up -d
```

---

## 📋 Tareas pendientes (por prioridad)

### Prioridad ALTA
1. **Eliminar Supabase del proyecto**
   - Borrar `src/lib/supabase.ts`
   - Borrar `src/scripts/getUserId.ts`
   - Remover `@supabase/supabase-js` de `package.json`
   - Verificar que ningún componente lo importe

2. **Revisar Profile.tsx**
   - Verificar si usa Supabase para actualizar perfil
   - Si es así, migrar a usar `apiClient.put("/auth/me", data)` o endpoint equivalente

3. **Agregar `EditEventDialog` al flujo**
   - `EventList.tsx` tiene prop `onEditEvent` pero no se usa en `Events.tsx`
   - Conectar con `useUpdateEvent` hook

### Prioridad MEDIA
4. **Google Calendar integration**
   - Backend: crear `backend/app/routers/google_calendar.py`
   - Frontend: botón de sincronización en Events

5. **OpenAI real**
   - Los endpoints de IA existen pero necesitan `OPENAI_API_KEY` configurado
   - Probar flujo completo: crear contacto → crear evento → generar recomendaciones

6. **Tests E2E**
   - Registro → Login → Dashboard
   - Crear contacto → Crear evento → Ver regalos
   - Marcar regalo como comprado

### Prioridad BAJA
7. **Mejorar UX**
   - Skeleton loaders en lugar de spinner genérico
   - Optimistic updates en mutations
   - Error boundaries

8. **Limpiar backups**
   - `AgentZeroService.ts.bak`, `.copy`
   - Archivos `.bat` de Windows si solo usas Termux

---

## 🔑 Decisiones de arquitectura tomadas

1. **Cliente HTTP**: Se usa `fetch` nativo (no axios) en `apiClient.ts` para reducir dependencias.
2. **State management**: React Query para server state, `useState` para UI state. No se usa Redux/Zustand.
3. **Auth**: JWT en localStorage (`cumple_access_token`). No hay refresh tokens implementados aún.
4. **Tipos**: Los tipos del frontend (`src/types/api.ts`) están sincronizados manualmente con los schemas de Pydantic del backend.
5. **Filtrado**: El filtrado por categoría se hace en el frontend (client-side), no en la API.

---

## 📝 Notas para el próximo agente

- **0 errores de TypeScript** al finalizar la sesión (solo un warning de `baseUrl` deprecated en tsconfig).
- Todos los componentes migrados usan la misma convención: `useX` para lectura, `useCreateX`/`useUpdateX`/`useDeleteX` para mutaciones.
- Los dialogs de creación (`CreateContactDialog`, `CreateEventDialog`) manejan sus propias mutaciones internamente.
- El `Dashboard` pasa datos pre-filtrados a `EventList` via prop `events`, lo cual evita llamadas duplicadas a la API.
- `Gifts.tsx` usa `useQueries` para cargar regalos de múltiples eventos en paralelo.
