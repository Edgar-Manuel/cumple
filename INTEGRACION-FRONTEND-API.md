# Integración Frontend-API - CUMPLE

## Estado Actual

✅ **Backend API**: Completamente funcional en `/backend`
✅ **Frontend**: React+TypeScript en `/src`

## Pasos para Integración

### 1. Instalar Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Editar `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cumple_db
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-your-key
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### 2. Ejecutar Backend

```bash
python -m uvicorn app.main:app --reload
# Estará en http://localhost:8000
```

### 3. Actualizar Frontend - Variables de Entorno

Editar `.env` en la raíz:
```env
VITE_API_ENDPOINT=http://localhost:8000
```

### 4. Actualizar Frontend - AuthContext

El archivo `src/lib/AuthContext.tsx` necesita ser actualizado para usar la API:

```typescript
// Cambiar de Supabase a API Backend
import { apiClient } from '@/lib/apiClient';

// En lugar de supabase.auth.signUp():
const response = await apiClient.post('/auth/register', {
  email,
  username,
  full_name,
  password
});

// Guardar token
localStorage.setItem('access_token', response.access_token);
```

### 5. Crear Cliente API

Crear archivo `src/lib/apiClient.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:8000',
});

// Agregar token a cada request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 6. Actualizar Hooks de Datos

Reemplazar llamadas mock con API real:

**Antes (Mock)**:
```typescript
const contacts = await mockGetContacts();
```

**Después (API)**:
```typescript
const { data: contacts } = await apiClient.get('/contacts/');
```

### 7. Actualizar Componentes

Ejemplos de integración por página:

#### ContactList.tsx
```typescript
import apiClient from '@/lib/apiClient';

useEffect(() => {
  const fetchContacts = async () => {
    try {
      const { data } = await apiClient.get('/contacts/');
      setContacts(data);
    } catch (error) {
      toast.error('Error cargando contactos');
    }
  };
  fetchContacts();
}, []);
```

#### EventList.tsx
```typescript
// Eventos próximos
const { data: events } = await apiClient.get('/events/?upcoming=true&days=7');

// Todos los eventos
const { data: allEvents } = await apiClient.get('/events/');
```

#### GiftCard.tsx
```typescript
const onPurchased = async (giftId: number) => {
  await apiClient.put(`/gifts/${giftId}`, { is_purchased: true });
};
```

## Endpoints Disponibles

### Autenticación
- `POST /auth/register` - Registrar
- `POST /auth/login` - Login
- `GET /auth/me` - Usuario actual

### Contactos
- `GET /contacts/` - Listar
- `POST /contacts/` - Crear
- `GET /contacts/{id}` - Obtener
- `PUT /contacts/{id}` - Actualizar
- `DELETE /contacts/{id}` - Eliminar

### Eventos
- `GET /events/` - Listar
- `GET /events/?upcoming=true&days=7` - Próximos
- `POST /events/` - Crear
- `GET /events/{id}` - Obtener
- `PUT /events/{id}` - Actualizar
- `DELETE /events/{id}` - Eliminar

### Regalos
- `GET /gifts/event/{event_id}` - Por evento
- `POST /gifts/` - Crear
- `GET /gifts/{id}` - Obtener
- `PUT /gifts/{id}` - Marcar comprado
- `DELETE /gifts/{id}` - Eliminar

## Tipos Compartidos

### User
```typescript
{
  id: number
  email: string
  username: string
  full_name?: string
  is_active: boolean
  created_at: string
}
```

### Contact
```typescript
{
  id: number
  user_id: number
  name: string
  email?: string
  phone?: string
  relationship?: string
  interests?: string
  affinity?: number
  how_we_met?: string
  notes?: string
  photo_url?: string
  created_at: string
  updated_at: string
}
```

### Event
```typescript
{
  id: number
  user_id: number
  contact_id: number
  title: string
  event_type: string
  date: string
  reminder_days: number
  notes?: string
  is_completed: boolean
  google_calendar_id?: string
  created_at: string
  updated_at: string
}
```

## Testing de Integración

### Con Postman/Insomnia

1. Registrar usuario
2. Copiar access_token
3. Usar en header: `Authorization: Bearer {token}`
4. Probar endpoints

### Con curl

```bash
# Registrar
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"pass123"}'

# Login y obtener token
TOKEN=$(curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}' | jq '.access_token')

# Crear contacto
curl -X POST http://localhost:8000/contacts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","relationship":"friend"}'
```

## Checklist de Integración

- [ ] Backend corriendo en puerto 8000
- [ ] Base de datos PostgreSQL configurada
- [ ] Variables de entorno del frontend actualizado
- [ ] `apiClient.ts` creado
- [ ] AuthContext actualizado para usar API
- [ ] Páginas de contactos integradas
- [ ] Páginas de eventos integradas
- [ ] Páginas de regalos integradas
- [ ] Tests end-to-end ejecutados
- [ ] Frontend corriendo en puerto 5173
- [ ] Login/registro funcionando
- [ ] CRUD de contactos funcionando
- [ ] CRUD de eventos funcionando
- [ ] CRUD de regalos funcionando

## Troubleshooting

### CORS Error
```env
CORS_ORIGINS=["http://localhost:5173"]
```

### Token Inválido
```typescript
// Limpiar token expirado
localStorage.removeItem('access_token');
// Redirigir a login
navigate('/login');
```

### Base de Datos No Conectada
```bash
# Verificar PostgreSQL
psql -U cumple_user -d cumple_db -c "SELECT 1;"
```

## Próximos Pasos

1. ✅ API Backend
2. ⬜ Integración Frontend
3. ⬜ OpenAI para mensajes y regalos
4. ⬜ Google Calendar
5. ⬜ Despliegue a producción
