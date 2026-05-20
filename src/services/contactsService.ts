/**
 * Servicio de Contactos con la API Backend
 */
import { apiClient } from "@/lib/apiClient";
import type {
  ApiContact,
  ContactCreate,
  ContactUpdate,
} from "@/types/api";

export const contactsService = {
  /**
   * Lista todos los contactos del usuario
   */
  async list(params?: { skip?: number; limit?: number }): Promise<ApiContact[]> {
    const query = new URLSearchParams();
    if (params?.skip) query.append("skip", String(params.skip));
    if (params?.limit) query.append("limit", String(params.limit));
    const qs = query.toString();
    return apiClient.get<ApiContact[]>(`/contacts/${qs ? `?${qs}` : ""}`);
  },

  /**
   * Obtiene un contacto específico
   */
  async get(id: number): Promise<ApiContact> {
    return apiClient.get<ApiContact>(`/contacts/${id}`);
  },

  /**
   * Crea un nuevo contacto
   */
  async create(data: ContactCreate): Promise<ApiContact> {
    return apiClient.post<ApiContact>("/contacts/", data);
  },

  /**
   * Actualiza un contacto existente
   */
  async update(id: number, data: ContactUpdate): Promise<ApiContact> {
    return apiClient.put<ApiContact>(`/contacts/${id}`, data);
  },

  /**
   * Elimina un contacto
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/contacts/${id}`);
  },
};
