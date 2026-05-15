import { useState, useEffect } from 'react';
import { getUserCount, subscribeToUserCountChanges } from '@/services/userCountService';

/**
 * Hook para obtener y mantener actualizado el conteo de usuarios activos
 * @returns {number} El número actual de usuarios activos
 */
export function useUserCount(): number {
  const [count, setCount] = useState<number>(getUserCount());
  
  useEffect(() => {
    // Obtener el conteo inicial
    setCount(getUserCount());
    
    // Suscribirse a cambios en el conteo
    const unsubscribe = subscribeToUserCountChanges((newCount) => {
      setCount(newCount);
    });
    
    // Limpieza al desmontar el componente
    return () => {
      unsubscribe();
    };
  }, []);
  
  return count;
} 