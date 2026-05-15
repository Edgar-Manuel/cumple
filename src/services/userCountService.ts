// Clave para almacenar el conteo de usuarios en localStorage
const USER_COUNT_KEY = 'cumple_user_count';

// Evento personalizado para notificar cuando cambia el contador
const USER_COUNT_CHANGED_EVENT = 'userCountChanged';

// Obtener el conteo actual de usuarios
export function getUserCount(): number {
  const count = localStorage.getItem(USER_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

// Incrementar el conteo de usuarios
export function incrementUserCount(): number {
  const currentCount = getUserCount();
  const newCount = currentCount + 1;
  localStorage.setItem(USER_COUNT_KEY, newCount.toString());
  
  // Disparar evento para que los componentes puedan actualizarse
  const event = new CustomEvent(USER_COUNT_CHANGED_EVENT, { detail: newCount });
  window.dispatchEvent(event);
  
  return newCount;
}

// Resetear el conteo a 0 (útil para pruebas o administración)
export function resetUserCount(): void {
  localStorage.setItem(USER_COUNT_KEY, '0');
  
  // Disparar evento para que los componentes puedan actualizarse
  const event = new CustomEvent(USER_COUNT_CHANGED_EVENT, { detail: 0 });
  window.dispatchEvent(event);
}

// Suscribirse a cambios en el conteo
export function subscribeToUserCountChanges(callback: (count: number) => void): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<number>;
    callback(customEvent.detail);
  };
  
  window.addEventListener(USER_COUNT_CHANGED_EVENT, handler);
  
  // Retornar función para desuscribirse
  return () => {
    window.removeEventListener(USER_COUNT_CHANGED_EVENT, handler);
  };
}

// Hook personalizado para usar el conteo de usuarios en componentes
export function simulateUserRegistration(): void {
  incrementUserCount();
} 