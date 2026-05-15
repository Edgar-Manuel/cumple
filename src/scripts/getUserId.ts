import supabase from '../lib/supabase';

// Función para obtener el ID del usuario actual
export const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    console.log('ID del usuario autenticado:', user.id);
    return user.id;
  } else {
    console.log('No hay usuario autenticado');
    return null;
  }
};

// Ejecutar la función cuando se importa este módulo
getUserId().catch(console.error);

export default getUserId; 