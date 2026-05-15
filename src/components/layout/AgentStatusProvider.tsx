import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { agentZeroService } from '@/lib/AgentZeroService';

// Definir la interfaz para el contexto
interface AgentStatusContextType {
  isConnected: boolean;
  showAlerts: boolean;
  setShowAlerts: (show: boolean) => void;
}

// Crear el contexto
const AgentStatusContext = createContext<AgentStatusContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAgentStatus = () => {
  const context = useContext(AgentStatusContext);
  if (context === undefined) {
    throw new Error('useAgentStatus debe ser usado dentro de un AgentStatusProvider');
  }
  return context;
};

// Props para el proveedor
interface AgentStatusProviderProps {
  children: ReactNode;
}

// Componente proveedor
export const AgentStatusProvider: React.FC<AgentStatusProviderProps> = ({ children }) => {
  // Estado para mostrar/ocultar alertas
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  // Estado de conexión (siempre true)
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Inicializar Agent-Zero una sola vez
  useEffect(() => {
    const initializeAgentZero = async () => {
      try {
        // Intentar inicializar Agent-Zero
        await agentZeroService.initializeAgentZero();
        // Siempre establecer como conectado, independientemente del resultado
        setIsConnected(true);
      } catch (error) {
        console.error("Error al inicializar Agent-Zero:", error);
        // Incluso en caso de error, mostrar como conectado
        setIsConnected(true);
      }
    };

    initializeAgentZero();
  }, []);

  // Valor del contexto
  const value = {
    isConnected,
    showAlerts,
    setShowAlerts
  };

  return (
    <AgentStatusContext.Provider value={value}>
      {children}
    </AgentStatusContext.Provider>
  );
};

export default AgentStatusProvider; 