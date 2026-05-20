/**
 * Hooks de TanStack Query para generación con IA
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiService } from "@/services/aiService";
import type {
  SocialPlatform,
  MessageTone,
} from "@/services/aiService";

const QUERY_KEY = "ai";

/**
 * Hook para generar un mensaje
 */
export function useGenerateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      event_id: number;
      tone?: MessageTone;
      save?: boolean;
    }) => aiService.generateMessage(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, "messages", variables.event_id],
      });
    },
  });
}

/**
 * Hook para generar recomendaciones de regalos
 */
export function useGenerateGiftRecommendations() {
  return useMutation({
    mutationFn: (params: { event_id: number; budget?: number }) =>
      aiService.generateGiftRecommendations(params),
  });
}

/**
 * Hook para generar publicaciones de redes sociales
 */
export function useGenerateSocialPost() {
  return useMutation({
    mutationFn: (params: { event_id: number; platform: SocialPlatform }) =>
      aiService.generateSocialPost(params),
  });
}

/**
 * Hook para listar mensajes generados de un evento
 */
export function useEventMessages(eventId: number | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, "messages", eventId],
    queryFn: () => aiService.listEventMessages(eventId as number),
    enabled: eventId !== undefined,
  });
}
