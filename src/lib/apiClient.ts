/**
 * Cliente HTTP para comunicación con el Backend API
 * Maneja autenticación JWT automáticamente
 */

import type { ApiError } from "@/types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_ENDPOINT || "http://localhost:8000";

const TOKEN_KEY = "cumple_access_token";

/**
 * Gestión del token JWT
 */
export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

/**
 * Error personalizado de la API
 */
export class ApiClientError extends Error {
  status: number;
  detail: string;

  constructor(message: string, status: number, detail: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Realiza una llamada HTTP a la API
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenStorage.get();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiClientError(
      "Error de conexión con el servidor",
      0,
      "Network error"
    );
  }

  // Manejar 401 - Token inválido o expirado
  if (response.status === 401) {
    tokenStorage.clear();
    throw new ApiClientError(
      "Sesión expirada",
      401,
      "Unauthorized"
    );
  }

  // Si la respuesta no tiene contenido (204)
  if (response.status === 204) {
    return {} as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorData = data as ApiError | null;
    const detail = errorData?.detail || response.statusText || "Error desconocido";
    throw new ApiClientError(detail, response.status, detail);
  }

  return data as T;
}

/**
 * Cliente API con métodos HTTP
 */
export const apiClient = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: "DELETE" });
  },
};

/**
 * Verifica si la API está disponible
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiClient.get("/health");
    return true;
  } catch {
    return false;
  }
}
