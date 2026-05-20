/**
 * Hooks de TanStack Query para Eventos
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "@/services/eventsService";
import type { EventCreate, EventUpdate } from "@/types/api";

const QUERY_KEY = "events";

/**
 * Hook para listar todos los eventos
 */
export function useEvents() {
  return useQuery({
    queryKey: [QUERY_KEY, "all"],
    queryFn: () => eventsService.list(),
  });
}

/**
 * Hook para listar eventos próximos
 */
export function useUpcomingEvents(days: number = 7) {
  return useQuery({
    queryKey: [QUERY_KEY, "upcoming", days],
    queryFn: () => eventsService.upcoming(days),
  });
}

/**
 * Hook para obtener un evento específico
 */
export function useEvent(id: number | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => eventsService.get(id as number),
    enabled: id !== undefined,
  });
}

/**
 * Hook para crear un evento
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EventCreate) => eventsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para actualizar un evento
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EventUpdate }) =>
      eventsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para marcar un evento como completado
 */
export function useMarkEventCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventsService.markCompleted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para eliminar un evento
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
