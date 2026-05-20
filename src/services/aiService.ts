/**
 * Servicio de IA con la API Backend
 */
import { apiClient } from "@/lib/apiClient";
import type { ApiMessage } from "@/types/api";

export type SocialPlatform = "instagram" | "twitter" | "facebook" | "whatsapp";
export type MessageTone = "formal" | "friendly" | "intimate";

interface GeneratedContent {
  content: string;
}

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
   * Genera recomendaciones de regalos
   */
  async generateGiftRecommendations(
    params: GenerateRecommendationsParams
  ): Promise<GeneratedContent> {
    return apiClient.post<GeneratedContent>(
      "/ai/gifts/recommendations",
      params
    );
  },

  /**
   * Genera contenido para redes sociales
   */
  async generateSocialPost(
    params: GenerateSocialParams
  ): Promise<GeneratedContent> {
    return apiClient.post<GeneratedContent>("/ai/social/generate", params);
  },

  /**
   * Lista los mensajes generados para un evento
   */
  async listEventMessages(eventId: number): Promise<ApiMessage[]> {
    return apiClient.get<ApiMessage[]>(`/ai/messages/event/${eventId}`);
  },
};
