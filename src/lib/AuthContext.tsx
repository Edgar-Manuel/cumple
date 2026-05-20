/**
 * Contexto de autenticación usando la API Backend
 * Reemplaza la integración anterior con Supabase
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { tokenStorage, ApiClientError } from "@/lib/apiClient";
import type {
  ApiUser,
  UserLogin,
  UserRegister,
} from "@/types/api";

type AuthContextType = {
  user: ApiUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  register: (data: UserRegister) => Promise<ApiUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Carga el usuario actual desde el token guardado
   */
  const loadUser = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // Token inválido o expirado
      if (error instanceof ApiClientError && error.status === 401) {
        tokenStorage.clear();
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Login del usuario
   */
  async function login(credentials: UserLogin): Promise<void> {
    await authService.login(credentials);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }

  /**
   * Registra un nuevo usuario (no inicia sesión automáticamente)
   */
  async function register(data: UserRegister): Promise<ApiUser> {
    return authService.register(data);
  }

  /**
   * Cierra la sesión
   */
  async function signOut(): Promise<void> {
    authService.logout();
    setUser(null);
    navigate("/login");
  }

  /**
   * Refresca los datos del usuario actual
   */
  async function refreshUser(): Promise<void> {
    await loadUser();
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    register,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
