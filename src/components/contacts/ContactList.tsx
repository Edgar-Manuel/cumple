import { useMemo, useState } from "react";
import ContactCard, { ContactProps } from "./ContactCard";
import CreateContactDialog from "./CreateContactDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Grid, List, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAnimationClasses } from "@/lib/animations";
import { useContacts, useDeleteContact } from "@/hooks/useContacts";
import { useEvents } from "@/hooks/useEvents";
import { useToast } from "@/components/ui/use-toast";
import { ApiClientError } from "@/lib/apiClient";
import type { ApiContact, ApiEvent } from "@/types/api";

type ViewMode = "grid" | "list";

interface ContactListProps {
  categoryFilter?: string | null;
}

function mapApiContactToProps(
  contact: ApiContact,
  events: ApiEvent[] | undefined,
): ContactProps {
  const birthdayEvent = events?.find(
    (e) => e.contact_id === contact.id && e.event_type === "birthday",
  );

  return {
    id: contact.id,
    name: contact.name,
    image: contact.photo_url,
    email: contact.email,
    phone: contact.phone,
    birthdate: birthdayEvent ? new Date(birthdayEvent.date) : undefined,
    relationship: contact.relationship,
    relationshipLevel: contact.affinity ?? 3,
  };
}

export default function ContactList({ categoryFilter }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { toast } = useToast();
  const {
    data: contacts,
    isLoading,
    error,
  } = useContacts();
  const { data: events } = useEvents();
  const deleteContact = useDeleteContact();

  const mappedContacts = useMemo<ContactProps[]>(() => {
    if (!contacts) return [];
    return contacts.map((c) => mapApiContactToProps(c, events));
  }, [contacts, events]);

  // Filter contacts based on search query and category
  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return mappedContacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(query) ||
        (contact.email && contact.email.toLowerCase().includes(query)) ||
        (contact.phone && contact.phone.includes(searchQuery));

      if (!matchesSearch) return false;

      if (categoryFilter === null || categoryFilter === undefined) return true;

      if (categoryFilter === "favorites") {
        return (contact.relationshipLevel ?? 0) >= 4;
      }

      return contact.relationship === categoryFilter;
    });
  }, [mappedContacts, searchQuery, categoryFilter]);

  // Sort contacts by name
  const sortedContacts = useMemo(
    () => [...filteredContacts].sort((a, b) => a.name.localeCompare(b.name)),
    [filteredContacts],
  );

  const handleDelete = (id: number | string, name: string) => {
    if (typeof id !== "number") return;
    if (!confirm(`¿Eliminar el contacto "${name}"?`)) return;

    deleteContact.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Contacto eliminado",
          description: `"${name}" se ha eliminado correctamente.`,
        });
      },
      onError: (err) => {
        const message =
          err instanceof ApiClientError
            ? err.detail
            : "No se pudo eliminar el contacto.";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contactos..."
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
            <span>Nuevo Contacto</span>
          </Button>
        </div>
      </div>

      {/* Loading / Error / Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-destructive/10 rounded-lg">
          <p className="text-destructive font-medium">
            No se pudieron cargar los contactos
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof ApiClientError
              ? error.detail
              : "Verifica tu conexión con el servidor."}
          </p>
        </div>
      ) : sortedContacts.length > 0 ? (
        <div
          className={cn(
            "grid gap-6 animate-fade-in",
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1",
          )}
        >
          {sortedContacts.map((contact, index) => (
            <div
              key={contact.id}
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
              <ContactCard
                {...contact}
                onDelete={() => handleDelete(contact.id, contact.name)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/30 rounded-lg">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay contactos</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {searchQuery
              ? "No se encontraron contactos con los criterios de búsqueda actuales."
              : "Aún no has añadido ningún contacto."}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={14} className="mr-2" />
            Crear nuevo contacto
          </Button>
        </div>
      )}

      <CreateContactDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
