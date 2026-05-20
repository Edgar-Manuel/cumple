/**
 * Servicio de Autenticación con la API Backend
 */
import { apiClient, tokenStorage } from "@/lib/apiClient";
import type {
  ApiUser,
  AuthToken,
  UserLogin,
  UserRegister,
} from "@/types/api";

export const authService = {
  /**
   * Registra un nuevo usuario
   */
  async register(data: UserRegister): Promise<ApiUser> {
    return apiClient.post<ApiUser>("/auth/register", data);
  },

  /**
   * Login - guarda access y refresh tokens
   */
  async login(data: UserLogin): Promise<AuthToken> {
    const token = await apiClient.post<AuthToken>("/auth/login", data);
    tokenStorage.set(token.access_token, token.refresh_token);
    return token;
  },

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser(): Promise<ApiUser> {
    return apiClient.get<ApiUser>("/auth/me");
  },

  /**
   * Logout - limpia los tokens
   */
  logout(): void {
    tokenStorage.clear();
  },

  /**
   * Verifica si hay sesión activa
   */
  isAuthenticated(): boolean {
    return tokenStorage.getAccess() !== null;
  },
};
