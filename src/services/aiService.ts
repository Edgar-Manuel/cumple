/**
 * Servicio de IA con la API Backend
 */
import { apiClient } from "@/lib/apiClient";
import type { ApiMessage, ApiGift } from "@/types/api";

export type SocialPlatform = "instagram" | "twitter" | "facebook" | "whatsapp";
export type MessageTone = "formal" | "friendly" | "intimate";

interface GenerateMessageParams {
  event_id: number;
  tone?: MessageTone;
  save?: boolean;
}

interface GenerateRecommendationsParams {
  event_id: number;
  budget?: number;
  save?: boolean;
}

interface GenerateSocialParams {
  event_id: number;
  platform: SocialPlatform;
}

export const aiService = {
  /**
   * Genera un mensaje personalizado para un evento
   */
  async generateMessage(params: GenerateMessageParams): Promise<ApiMessage> {
    return apiClient.post<ApiMessage>("/ai/messages/generate", params);
  },

  /**
   * Genera y guarda recomendaciones de regalos (devuelve lista de regalos creados)
   */
  async generateGiftRecommendations(
    params: GenerateRecommendationsParams
  ): Promise<ApiGift[]> {
    return apiClient.post<ApiGift[]>(
      "/ai/gifts/recommendations",
      params
    );
  },

  /**
   * Genera contenido para redes sociales
   */
  async generateSocialPost(
    params: GenerateSocialParams
  ): Promise<{ content: string }> {
    return apiClient.post<{ content: string }>("/ai/social/generate", params);
  },

  /**
   * Lista los mensajes generados para un evento
   */
  async listEventMessages(eventId: number): Promise<ApiMessage[]> {
    return apiClient.get<ApiMessage[]>(`/ai/messages/event/${eventId}`);
  },
};
