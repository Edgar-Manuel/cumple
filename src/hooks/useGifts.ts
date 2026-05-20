/**
 * Hooks de TanStack Query para Regalos
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { giftsService } from "@/services/giftsService";
import type { GiftCreate } from "@/types/api";

const QUERY_KEY = "gifts";

/**
 * Hook para listar regalos de un evento
 */
export function useGiftsByEvent(eventId: number | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, "event", eventId],
    queryFn: () => giftsService.listByEvent(eventId as number),
    enabled: eventId !== undefined,
  });
}

/**
 * Hook para obtener un regalo específico
 */
export function useGift(id: number | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => giftsService.get(id as number),
    enabled: id !== undefined,
  });
}

/**
 * Hook para crear una recomendación de regalo
 */
export function useCreateGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GiftCreate) => giftsService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, "event", variables.event_id],
      });
    },
  });
}

/**
 * Hook para marcar un regalo como comprado
 */
export function useMarkGiftPurchased() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => giftsService.markPurchased(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para eliminar un regalo
 */
export function useDeleteGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => giftsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
