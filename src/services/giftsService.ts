/**
 * Servicio de Regalos con la API Backend
 */
import { apiClient } from "@/lib/apiClient";
import type { ApiGift, GiftCreate } from "@/types/api";

export const giftsService = {
  /**
   * Lista todos los regalos de un evento
   */
  async listByEvent(eventId: number): Promise<ApiGift[]> {
    return apiClient.get<ApiGift[]>(`/gifts/event/${eventId}`);
  },

  /**
   * Obtiene un regalo específico
   */
  async get(id: number): Promise<ApiGift> {
    return apiClient.get<ApiGift>(`/gifts/${id}`);
  },

  /**
   * Crea una nueva recomendación de regalo
   */
  async create(data: GiftCreate): Promise<ApiGift> {
    return apiClient.post<ApiGift>("/gifts/", data);
  },

  /**
   * Marca un regalo como comprado
   */
  async markPurchased(id: number): Promise<ApiGift> {
    return apiClient.put<ApiGift>(`/gifts/${id}`);
  },

  /**
   * Elimina una recomendación de regalo
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/gifts/${id}`);
  },
};
