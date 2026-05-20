import { useMemo, useState } from "react";
import EventCard, { EventProps } from "./EventCard";
import CreateEventDialog from "./CreateEventDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  Grid,
  List,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAnimationClasses } from "@/lib/animations";
import { useEvents, useCreateEvent } from "@/hooks/useEvents";
import { useContacts } from "@/hooks/useContacts";
import { useToast } from "@/components/ui/use-toast";
import { ApiClientError } from "@/lib/apiClient";
import type { Contact } from "@/components/contacts/CreateContactDialog";
import type { ApiContact, ApiEvent } from "@/types/api";

type ViewMode = "grid" | "list";

interface EventListProps {
  /**
   * Si se pasan eventos, se usan en lugar de cargar desde la API.
   * Permite reutilizar este componente en el Dashboard con datos prefiltrados.
   */
  events?: EventProps[];
  onEditEvent?: (eventId: string | number) => void;
}

function isValidEventType(type: string): EventProps["type"] {
  const valid: EventProps["type"][] = [
    "birthday",
    "anniversary",
    "graduation",
    "holiday",
    "other",
  ];
  return (valid as string[]).includes(type)
    ? (type as EventProps["type"])
    : "other";
}

function mapApiEventToProps(
  event: ApiEvent,
  contactsById: Map<number, ApiContact>,
): EventProps {
  const contact = contactsById.get(event.contact_id);
  return {
    id: event.id,
    title: event.title,
    date: new Date(event.date),
    type: isValidEventType(event.event_type),
    personName: contact?.name ?? "Sin contacto",
    personImage: contact?.photo_url,
  };
}

export default function EventList({
  events: providedEvents,
  onEditEvent,
}: EventListProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { toast } = useToast();

  // Solo cargar de la API si no nos pasaron eventos
  const shouldFetch = providedEvents === undefined;
  const {
    data: apiEvents,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useEvents();
  const { data: contacts } = useContacts();
  const createEvent = useCreateEvent();

  const contactsById = useMemo(() => {
    const map = new Map<number, ApiContact>();
    contacts?.forEach((c) => map.set(c.id, c));
    return map;
  }, [contacts]);

  const eventsList: EventProps[] = useMemo(() => {
    if (!shouldFetch) return providedEvents ?? [];
    if (!apiEvents) return [];
    return apiEvents.map((e) => mapApiEventToProps(e, contactsById));
  }, [shouldFetch, providedEvents, apiEvents, contactsById]);

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return eventsList.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        event.personName.toLowerCase().includes(q),
    );
  }, [eventsList, searchQuery]);

  // Sort events by date (closest first)
  const sortedEvents = useMemo(
    () =>
      [...filteredEvents].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [filteredEvents],
  );

  const handleCreateEvent = (data: {
    title: string;
    date: Date;
    type: "birthday" | "anniversary" | "graduation" | "holiday" | "other";
    personName: string;
    contactId?: number | string;
    affinity?: number;
    howWeMet?: string;
    interests?: string;
    previousGifts?: string;
  }) => {
    if (!data.contactId) {
      toast({
        title: "Selecciona un contacto",
        description:
          "Para crear un evento necesitas asociarlo a un contacto existente.",
        variant: "destructive",
      });
      return;
    }

    const contactIdNum =
      typeof data.contactId === "number"
        ? data.contactId
        : parseInt(data.contactId, 10);

    if (Number.isNaN(contactIdNum)) {
      toast({
        title: "Contacto inválido",
        description: "El identificador del contacto no es válido.",
        variant: "destructive",
      });
      return;
    }

    createEvent.mutate(
      {
        contact_id: contactIdNum,
        title: data.title,
        event_type: data.type,
        date: data.date.toISOString(),
        reminder_days: 7,
        notes: data.previousGifts || data.howWeMet || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Evento creado",
            description: `Se ha creado "${data.title}" correctamente.`,
          });
          setIsCreateDialogOpen(false);
        },
        onError: (err) => {
          const message =
            err instanceof ApiClientError
              ? err.detail
              : "No se pudo crear el evento.";
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const showLoading = shouldFetch && isLoadingEvents;
  const showError = shouldFetch && eventsError;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-none px-3",
                viewMode === "grid" && "bg-secondary",
              )}
              onClick={() => setViewMode("grid")}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-none px-3",
                viewMode === "list" && "bg-secondary",
              )}
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </div>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus size={14} />
            <span>Nuevo Evento</span>
          </Button>
        </div>
      </div>

      {/* Loading / Error / Content */}
      {showLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : showError ? (
        <div className="text-center py-12 bg-destructive/10 rounded-lg">
          <p className="text-destructive font-medium">
            No se pudieron cargar los eventos
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {eventsError instanceof ApiClientError
              ? eventsError.detail
              : "Verifica tu conexión con el servidor."}
          </p>
        </div>
      ) : sortedEvents.length > 0 ? (
        <div
          className={cn(
            "grid gap-6 animate-fade-in",
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1",
          )}
        >
          {sortedEvents.map((event, index) => (
            <div
              key={event.id}
              className={getAnimationClasses({
                variant: "slide-up",
                delay:
                  index < 3
                    ? index === 0
                      ? "none"
                      : index === 1
                        ? "short"
                        : "medium"
                    : "none",
              })}
            >
              <EventCard
                {...event}
                onEdit={
                  onEditEvent ? () => onEditEvent(event.id) : undefined
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/30 rounded-lg">
          <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay eventos</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {searchQuery
              ? "No se encontraron eventos con los criterios de búsqueda actuales."
              : "Aún no tienes eventos programados."}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={14} className="mr-2" />
            Crear nuevo evento
          </Button>
        </div>
      )}

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        contacts={(contacts ?? []) as Contact[]}
        onCreateEvent={handleCreateEvent}
        onCreateContactClick={() => {
          toast({
            title: "Crear contacto",
            description:
              "Ve a la sección de Contactos para crear uno nuevo, luego vuelve aquí.",
          });
        }}
      />
    </div>
  );
}
