/**
 * Cliente HTTP para comunicación con el Backend API
 * Maneja autenticación JWT con refresh automático
 */

import type { ApiError } from "@/types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_ENDPOINT || "http://localhost:8000";

const ACCESS_TOKEN_KEY = "cumple_access_token";
const REFRESH_TOKEN_KEY = "cumple_refresh_token";

let refreshPromise: Promise<void> | null = null;

/**
 * Gestión de tokens JWT
 */
export const tokenStorage = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(access: string, refresh: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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
 * Refresca el access token usando el refresh token
 */
async function refreshAccessToken(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      tokenStorage.clear();
      throw new ApiClientError("Sin sesión", 401, "No refresh token");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      tokenStorage.clear();
      throw new ApiClientError("Sesión expirada", 401, "Refresh failed");
    }

    const data = await response.json();
    tokenStorage.set(data.access_token, data.refresh_token);
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Realiza una llamada HTTP a la API
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenStorage.getAccess();

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
  } catch {
    throw new ApiClientError(
      "Error de conexión con el servidor",
      0,
      "Network error"
    );
  }

  // Si 401 y no hemos reintentado, intentar refresh
  if (response.status === 401 && !retried && tokenStorage.getRefresh()) {
    try {
      await refreshAccessToken();
    } catch {
      throw new ApiClientError("Sesión expirada", 401, "Unauthorized");
    }
    // Reintentar con el nuevo token
    return request<T>(endpoint, options, true);
  }

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
