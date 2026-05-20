import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  Users,
  Gift,
  Bell,
  Plus,
  UserPlus,
  Loader2,
} from "lucide-react";
import EventList from "@/components/events/EventList";
import Calendar from "@/components/events/Calendar";
import CreateEventDialog from "@/components/events/CreateEventDialog";
import CreateContactDialog, {
  Contact,
} from "@/components/contacts/CreateContactDialog";
import { useAuth } from "@/lib/AuthContext";
import { EventProps } from "@/components/events/EventCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents, useUpcomingEvents, useCreateEvent } from "@/hooks/useEvents";
import { useContacts } from "@/hooks/useContacts";
import { useToast } from "@/components/ui/use-toast";
import { ApiClientError } from "@/lib/apiClient";
import type { ApiContact, ApiEvent } from "@/types/api";

const mapEventType = (
  type: ApiEvent["event_type"],
): EventProps["type"] => {
  switch (type) {
    case "birthday":
    case "anniversary":
    case "graduation":
    case "holiday":
      return type;
    default:
      return "other";
  }
};

const buildEventProps = (
  event: ApiEvent,
  contactsById: Map<number, ApiContact>,
): EventProps => {
  const contact = contactsById.get(event.contact_id);
  return {
    id: event.id,
    title: event.title,
    date: new Date(event.date),
    type: mapEventType(event.event_type),
    personName: contact?.name ?? "Sin contacto",
    personImage: contact?.photo_url ?? undefined,
  };
};

const apiContactToContact = (c: ApiContact): Contact => ({
  id: c.id,
  name: c.name,
  email: c.email ?? undefined,
  phone: c.phone ?? undefined,
  relationship: c.relationship ?? undefined,
  interests: c.interests ?? undefined,
  affinity: c.affinity ?? undefined,
  how_we_met: c.how_we_met ?? undefined,
  notes: c.notes ?? undefined,
  photo_url: c.photo_url ?? undefined,
});

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const initialTab = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    return tab && ["overview", "calendar", "list"].includes(tab)
      ? tab
      : "overview";
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [isCreateContactDialogOpen, setIsCreateContactDialogOpen] =
    useState(false);
  const [personFilter, setPersonFilter] = useState<string>("all");

  const { data: events, isLoading: isLoadingEvents, error: eventsError } = useEvents();
  const { data: upcoming, isLoading: isLoadingUpcoming } = useUpcomingEvents(30);
  const { data: contacts, isLoading: isLoadingContacts, error: contactsError } = useContacts();
  const createEvent = useCreateEvent();

  const contactsById = useMemo(() => {
    const map = new Map<number, ApiContact>();
    contacts?.forEach((c) => map.set(c.id, c));
    return map;
  }, [contacts]);

  const allEventProps = useMemo<EventProps[]>(() => {
    if (!events) return [];
    return events
      .map((e) => buildEventProps(e, contactsById))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, contactsById]);

  const upcomingEventProps = useMemo<EventProps[]>(() => {
    if (!upcoming) return [];
    return upcoming
      .map((e) => buildEventProps(e, contactsById))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [upcoming, contactsById]);

  const filteredEvents = useMemo(() => {
    if (personFilter === "all") return allEventProps;
    return allEventProps.filter((e) => e.personName === personFilter);
  }, [allEventProps, personFilter]);

  const uniquePersonNames = useMemo(() => {
    const set = new Set<string>();
    allEventProps.forEach((e) => {
      if (e.personName) set.add(e.personName);
    });
    return Array.from(set);
  }, [allEventProps]);

  const contactList = useMemo<Contact[]>(
    () => (contacts ?? []).map(apiContactToContact),
    [contacts],
  );

  const dashboardCards = [
    {
      id: 1,
      title: "Próximos Eventos",
      count: upcomingEventProps.length,
      icon: "calendar" as const,
      color:
        "from-blue-200 to-blue-400 dark:from-blue-900 dark:to-blue-700",
      caption:
        upcomingEventProps.length === 0
          ? "No hay eventos próximos"
          : `${upcomingEventProps.length} eventos en los próximos 30 días`,
    },
    {
      id: 2,
      title: "Total de Contactos",
      count: contacts?.length ?? 0,
      icon: "users" as const,
      color:
        "from-purple-200 to-purple-400 dark:from-purple-900 dark:to-purple-700",
      caption:
        (contacts?.length ?? 0) === 0
          ? "No hay contactos guardados"
          : `${contacts?.length} contactos disponibles`,
    },
    {
      id: 3,
      title: "Eventos Totales",
      count: events?.length ?? 0,
      icon: "gift" as const,
      color:
        "from-pink-200 to-pink-400 dark:from-pink-900 dark:to-pink-700",
      caption:
        (events?.length ?? 0) === 0
          ? "Aún no has creado eventos"
          : `${events?.length} eventos registrados`,
    },
    {
      id: 4,
      title: "Recordatorios",
      count: upcomingEventProps.filter((e) => {
        const diff = Math.ceil(
          (e.date.getTime() - new Date().getTime()) / (1000 * 3600 * 24),
        );
        return diff >= 0 && diff <= 7;
      }).length,
      icon: "bell" as const,
      color:
        "from-amber-200 to-amber-400 dark:from-amber-900 dark:to-amber-700",
      caption: "Eventos en los próximos 7 días",
    },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(location.search);
    params.set("tab", value);
    navigate(`/dashboard?${params.toString()}`, { replace: true });
  };

  const handlePersonFilterChange = (value: string) => {
    setPersonFilter(value);
  };

  const handleCreateEvent = (data: {
    title: string;
    date: Date;
    type: "birthday" | "anniversary" | "graduation" | "holiday" | "other";
    personName: string;
    contactId?: number | string;
    eventInterests?: string;
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
        event_interests: data.eventInterests,
        previous_gifts: data.previousGifts,
      },
      {
        onSuccess: () => {
          toast({
            title: "Evento creado",
            description: `Se ha creado "${data.title}" correctamente.`,
          });
          setIsCreateEventDialogOpen(false);
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

  const isLoading = isLoadingEvents || isLoadingUpcoming || isLoadingContacts;
  const apiError = eventsError || contactsError;
  const greetingName =
    user?.full_name || user?.username || user?.email || "Usuario";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 pt-24 pb-16 bg-secondary/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Hola, {greetingName}</h1>
              <p className="text-muted-foreground mt-1">
                Gestiona tus eventos y contactos especiales
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => setIsCreateEventDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Evento
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateContactDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Contacto
              </Button>
            </div>
          </div>

          {apiError ? (
            <div className="text-center py-12 bg-destructive/10 rounded-lg mb-8">
              <p className="text-destructive font-medium">
                No se pudieron cargar los datos
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {apiError instanceof ApiClientError
                  ? apiError.detail
                  : "Verifica tu conexión con el servidor."}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12 mb-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-3 text-muted-foreground">Cargando dashboard...</p>
            </div>
          ) : (
            <>
              {/* Dashboard cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {dashboardCards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative h-40"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90`}
                    />
                    <div className="p-6 relative z-10 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col space-y-2">
                          <h3 className="font-semibold text-white">{card.title}</h3>
                          <div className="text-3xl font-bold text-white">
                            {card.count}
                          </div>
                          <p className="text-xs text-white opacity-90">
                            {card.caption}
                          </p>
                        </div>
                        <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                          {card.icon === "calendar" && (
                            <CalendarIcon className="h-5 w-5 text-white" />
                          )}
                          {card.icon === "users" && (
                            <Users className="h-5 w-5 text-white" />
                          )}
                          {card.icon === "gift" && (
                            <Gift className="h-5 w-5 text-white" />
                          )}
                          {card.icon === "bell" && (
                            <Bell className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                className="mb-8"
                onValueChange={handleTabChange}
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="calendar">Calendario</TabsTrigger>
                  <TabsTrigger value="list">Lista</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {upcomingEventProps.length === 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Sin eventos próximos</CardTitle>
                        <CardDescription>
                          No tienes eventos programados en los próximos 30 días.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => setIsCreateEventDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Crear primer evento
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <EventList events={upcomingEventProps} />
                  )}
                </TabsContent>

                <TabsContent value="calendar">
                  <Calendar events={allEventProps} />
                </TabsContent>

                <TabsContent value="list">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <Select
                          value={personFilter}
                          onValueChange={handlePersonFilterChange}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por persona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las personas</SelectItem>
                            {uniquePersonNames.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          {filteredEvents.length} eventos encontrados
                        </p>
                      </div>
                    </div>

                    {filteredEvents.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          No hay eventos para mostrar con el filtro actual.
                        </p>
                        <Button
                          onClick={() => handlePersonFilterChange("all")}
                          className="mt-4"
                          variant="outline"
                        >
                          Mostrar todos los eventos
                        </Button>
                      </div>
                    ) : (
                      <EventList events={filteredEvents} />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      <Footer />

      <CreateEventDialog
        open={isCreateEventDialogOpen}
        onOpenChange={setIsCreateEventDialogOpen}
        onCreateEvent={handleCreateEvent}
        contacts={contactList}
        onCreateContactClick={() => setIsCreateContactDialogOpen(true)}
      />

      <CreateContactDialog
        open={isCreateContactDialogOpen}
        onOpenChange={setIsCreateContactDialogOpen}
        onSuccess={() => {
          if (!isCreateEventDialogOpen) {
            setIsCreateEventDialogOpen(true);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
