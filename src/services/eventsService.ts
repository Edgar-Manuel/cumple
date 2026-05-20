/**
 * Servicio de Eventos con la API Backend
 */
import { apiClient } from "@/lib/apiClient";
import type {
  ApiEvent,
  EventCreate,
  EventUpdate,
} from "@/types/api";

export const eventsService = {
  /**
   * Lista todos los eventos del usuario
   */
  async list(params?: {
    upcoming?: boolean;
    days?: number;
  }): Promise<ApiEvent[]> {
    const query = new URLSearchParams();
    if (params?.upcoming) query.append("upcoming", "true");
    if (params?.days) query.append("days", String(params.days));
    const qs = query.toString();
    return apiClient.get<ApiEvent[]>(`/events/${qs ? `?${qs}` : ""}`);
  },

  /**
   * Obtiene eventos próximos
   */
  async upcoming(days: number = 7): Promise<ApiEvent[]> {
    return this.list({ upcoming: true, days });
  },

  /**
   * Obtiene un evento específico
   */
  async get(id: number): Promise<ApiEvent> {
    return apiClient.get<ApiEvent>(`/events/${id}`);
  },

  /**
   * Crea un nuevo evento
   */
  async create(data: EventCreate): Promise<ApiEvent> {
    return apiClient.post<ApiEvent>("/events/", data);
  },

  /**
   * Actualiza un evento existente
   */
  async update(id: number, data: EventUpdate): Promise<ApiEvent> {
    return apiClient.put<ApiEvent>(`/events/${id}`, data);
  },

  /**
   * Marca un evento como completado
   */
  async markCompleted(id: number): Promise<ApiEvent> {
    return this.update(id, { is_completed: true });
  },

  /**
   * Elimina un evento
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/events/${id}`);
  },
};
