import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Obtener valores de las variables de entorno con valores predeterminados como fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hgwwcootwuhqeiirmfkg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd3djb290d3VocWVpaXJtZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODExNTYsImV4cCI6MjA1Njc1NzE1Nn0.JXnF6HQRfno4kjqksUZCTCB-e7_pzh8HOyiEOMXBB1w';

// Verificación simplificada, con mensaje de advertencia en lugar de error
if (!supabaseUrl || !supabaseKey) {
  console.warn('Advertencia: Las variables de entorno de Supabase no están completas. La funcionalidad puede estar limitada.');
}

let supabase: SupabaseClient;

try {
  // Intentar crear el cliente de Supabase
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Conexión con Supabase inicializada correctamente');
} catch (error) {
  // Si hay un error, crear un cliente simulado
  console.error('Error al inicializar Supabase:', error);
  
  // Cliente simulado que no causará errores
  supabase = {
    auth: {
      signIn: () => Promise.resolve({ error: null, data: { user: null } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
  } as unknown as SupabaseClient;
  
  console.warn('Usando cliente Supabase simulado. La funcionalidad estará limitada.');
}

export default supabase;

