# 🔍 AUDITORÍA COMPLETA DEL PROYECTO CUMPLE

**Fecha**: 20 de Mayo 2026  
**Auditor**: Agente de desarrollo  
**Estado del proyecto**: 65% completado

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Estado | Críticos | Advertencias |
|---|---|---|---|
| TypeScript | ✅ Limpio | 0 | 1 (baseUrl deprecated) |
| Supabase | ✅ Eliminado | 0 | 0 |
| Migración API | ✅ Completa | 0 | 0 |
| Código muerto | 🔴 Problema | 8 archivos | ~2,500 líneas |
| Backend OpenAI | 🔴 Roto | 1 | API deprecated |
| Seguridad | 🟡 Regular | 2 | 3 |
| Auth (refresh token) | 🟡 Pendiente | 0 | 1 |

---

## ✅ LO QUE ESTÁ BIEN

### Frontend migrado completamente
- **0 referencias a Supabase** en todo `src/`
- **0 errores de TypeScript**
- Todas las páginas usan React Query: `Dashboard`, `Contacts`, `Events`, `Gifts`, `EventGifts`, `Profile`, `Login`
- AuthContext migrado a API con JWT
- Cliente HTTP (`apiClient.ts`) con interceptor JWT y manejo de errores

### Backend funcional
- 28 endpoints (24 CRUD + 4 IA)
- Autenticación JWT con bcrypt
- CORS configurado
- Modelos SQLAlchemy con relaciones correctas
- Schemas Pydantic con validación

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. Código muerto en frontend (~2,500 líneas en 8 archivos)

Estos archivos **no se usan en ninguna ruta activa** pero siguen importando código antiguo:

| Archivo | Líneas | Importado por | Acción |
|---|---|---|---|
| `src/lib/AgentZeroService.ts` | 1,476 | `AgentStatusProvider.tsx` (muerto) | **Eliminar** |
| `src/lib/AgentZeroServiceFixed.ts` | 433 | Nadie | **Eliminar** |
| `src/components/layout/AgentStatusProvider.tsx` | 67 | Nadie (no está en routes) | **Eliminar** |
| `src/lib/storage.ts` | 116 | `giftRecommendationService.ts`, `AgentZeroService*` | **Eliminar** |
| `src/services/giftRecommendationService.ts` | 425 | Nadie | **Eliminar** |
| `src/services/googleSearchService.ts` | 787 | `AgentZeroService.ts` (muerto) | **Eliminar** |
| `src/services/fallbackRecommendations.ts` | 127 | `googleSearchService.ts` (muerto) | **Eliminar** |
| `src/lib/mockProducts.ts` | 56 | `googleSearchService.ts` (muerto) | **Eliminar** |

**Impacto**: Estos archivos importan `storage.ts` que usa localStorage mock, creando confusión sobre qué datos son reales vs simulados.

### 2. Backend OpenAI usa API deprecated

**Archivo**: `backend/app/ai_service.py`

El código usa `openai.ChatCompletion.acreate()` que fue **eliminado en openai >= 1.0.0**. Con la versión actual del SDK, esto lanzará `AttributeError`.

```python
# ACTUAL (ROTO con openai >= 1.0):
response = await openai.ChatCompletion.acreate(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": prompt}],
)

# DEBE SER:
client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
response = await client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": prompt}],
)
```

**Impacto**: Los 4 endpoints de IA (`/ai/messages/generate`, `/ai/gifts/recommendations`, `/ai/social/generate`, `/ai/messages/event/{id}`) **fallarán silenciosamente** con el fallback genérico si se activa OpenAI.

### 3. Credenciales de Supabase expuestas en historial de git

El archivo `src/lib/supabase.ts` contenía:
- `VITE_SUPABASE_URL`: `https://hgwwcootwuhqeiirmfkg.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: JWT completo visible

Aunque el archivo fue eliminado, **las credenciales siguen en el historial de git**. Cualquiera con acceso al repo puede verlas.

**Acción requerida**: Rotar la clave de Supabase inmediatamente.

---

## 🟡 ADVERTENCIAS

### 4. No hay refresh tokens

**Problema**: Los JWT expiran en 30 minutos (`ACCESS_TOKEN_EXPIRE_MINUTES: int = 30`). Cuando expiran, el usuario es deslogueado sin aviso y debe volver a hacer login.

**Solución**: Implementar refresh tokens con rotación.

### 5. `Base.metadata.create_all()` en producción

**Archivo**: `backend/app/main.py:9`

```python
Base.metadata.create_all(bind=engine)
```

Esto crea tablas automáticamente al iniciar la app. Funciona en desarrollo pero:
- No maneja migraciones de schema
- Puede causar pérdida de datos en producción
- No hay rollback

**Solución**: Usar Alembic (ya está configurado en `backend/alembic/` pero no inicializado).

### 6. Seguridad de contraseñas débil

- Mínimo 6 caracteres (muy bajo)
- No se verifica complejidad (mayúsculas, números, símbolos)
- No hay rate limiting en `/auth/login` (vulnerable a brute force)

### 7. Archivos de servicios locales sin uso

| Archivo | Líneas | Problema |
|---|---|---|
| `src/lib/fileUploadService.ts` | 83 | Sube a filesystem local, no usado por componentes activos |
| `src/services/userCountService.ts` | 53 | Contador localStorage cosmético |
| `src/pages/UserCounterPage.tsx` | 52 | Página aislada, no en routes |

### 8. Scripts .bat de Windows

14 archivos `.bat` y `.cmd` en la raíz que no son útiles en Termux/Linux:
- `agent_zero_startup.bat`
- `config_google_api.bat`
- `ejecutar_cumple.bat`
- `google_config.bat`
- `iniciar_agent_zero.bat`
- `iniciar_cumple.bat`
- `iniciar_frontend.bat`
- `iniciar_todo.ps1`
- `start_vite.bat`
- `start.cmd`
- `EJECUTAR_CUMPLE.cmd`

---

## 📋 PLAN DE ACCIÓN (por prioridad)

### Prioridad 1: Limpiar código muerto (30 min)
```bash
# Eliminar archivos muertos del frontend
rm src/lib/AgentZeroService.ts
rm src/lib/AgentZeroServiceFixed.ts
rm src/components/layout/AgentStatusProvider.tsx
rm src/lib/storage.ts
rm src/services/giftRecommendationService.ts
rm src/services/googleSearchService.ts
rm src/services/fallbackRecommendations.ts
rm src/lib/mockProducts.ts
rm src/lib/fileUploadService.ts
rm src/services/userCountService.ts
rm src/pages/UserCounterPage.tsx
```

### Prioridad 2: Fix OpenAI en backend (15 min)
Reescribir `backend/app/ai_service.py` con la API moderna de openai >= 1.0.

### Prioridad 3: Seguridad (1 hora)
1. Rotar clave de Supabase (credenciales expuestas en git history)
2. Agregar rate limiting a `/auth/login`
3. Subir requisito de contraseña a mínimo 8 caracteres
4. Cambiar `SECRET_KEY` por defecto

### Prioridad 4: Refresh tokens (2-3 horas)
Implementar refresh tokens para evitar logout cada 30 minutos.

### Prioridad 5: Alembic migrations (1 hora)
Reemplazar `Base.metadata.create_all()` con migraciones Alembic.

### Prioridad 6: Limpieza de repo (15 min)
- Eliminar archivos `.bat`/`.cmd`/`.ps1` de Windows
- Agregar `src/lib/supabase.ts` a `.gitignore` si se recrea
- Considerar `git filter-branch` para limpiar credenciales del historial

---

## 🏗️ ARQUITECTURA ACTUAL (resumen)

```
Frontend (React 18 + TypeScript + Vite)
├── apiClient.ts          → fetch + JWT en localStorage
├── AuthContext.tsx       → login/register/logout via API
├── services/             → 4 servicios HTTP (auth, contacts, events, gifts, ai)
├── hooks/                → 21 hooks de React Query
├── types/api.ts          → Tipos sincronizados con backend
└── pages/                → 7 páginas, todas migradas a API

Backend (FastAPI + PostgreSQL + SQLAlchemy)
├── routers/              → 5 routers (auth, contacts, events, gifts, ai)
├── models.py             → 5 modelos (User, Contact, Event, Gift, Message)
├── schemas.py            → 8 schemas Pydantic
├── auth.py               → JWT + bcrypt
└── ai_service.py         → ⚠️ OpenAI API deprecated

Externo (pendiente)
├── OpenAI API            → ⚠️ Código roto
├── Google Calendar       → ❌ No implementado
├── Email/WhatsApp        → ❌ No implementado
└── Stripe                → ❌ No implementado
```

---

## 🎯 ESTADO REAL DEL PROYECTO

```
Migración frontend → API:     ████████████████████ 100% ✅
Backend CRUD:                  ████████████████████ 100% ✅
Autenticación:                 ████████████████░░░░  80% ⚠️ (sin refresh)
Integración IA:                ████░░░░░░░░░░░░░░░░  20% 🔴 (API rota)
Google Calendar:               ░░░░░░░░░░░░░░░░░░░░   0% ❌
Testing E2E:                   ░░░░░░░░░░░░░░░░░░░░   0% ❌
Producción:                    ░░░░░░░░░░░░░░░░░░░░   0% ❌
Limpieza de código:            ████████░░░░░░░░░░░░  40% ⚠️ (mucho código muerto)

PROGRESO REAL: ~55% (no 65% como decía PROGRESO.md)
```

---

## 📝 NOTAS PARA EL SIGUIENTE AGENTE

1. **NO tocar** las páginas migradas (`Dashboard`, `Contacts`, `Events`, `Gifts`, `EventGifts`, `Profile`, `Login`) — están funcionando.
2. **EMPEZAR** por eliminar código muerto (Prioridad 1) antes de agregar features nuevas.
3. **FIX** de OpenAI es urgente si se quiere que la IA funcione (Prioridad 2).
4. Las credenciales de Supabase en el historial de git **deben rotarse** — son un riesgo de seguridad.
5. El documento `SESION-MIGRACION-2026-05-20.md` tiene el contexto completo de la migración.
