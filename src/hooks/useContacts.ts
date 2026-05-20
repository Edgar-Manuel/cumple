/**
 * Hooks de TanStack Query para Contactos
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactsService } from "@/services/contactsService";
import type { ContactCreate, ContactUpdate } from "@/types/api";

const QUERY_KEY = "contacts";

/**
 * Hook para listar contactos
 */
export function useContacts(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => contactsService.list(params),
  });
}

/**
 * Hook para obtener un contacto específico
 */
export function useContact(id: number | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => contactsService.get(id as number),
    enabled: id !== undefined,
  });
}

/**
 * Hook para crear un contacto
 */
export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactCreate) => contactsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para actualizar un contacto
 */
export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContactUpdate }) =>
      contactsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Hook para eliminar un contacto
 */
export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
