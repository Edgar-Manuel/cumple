-- Este comando devuelve el ID del usuario actualmente autenticado
SELECT auth.uid() AS user_id;

-- Si necesitas crear un usuario de prueba, puedes usar:
-- (Requiere permisos de administrador)
/*
INSERT INTO auth.users (id, email, confirmed_at, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'test@example.com',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
*/ 