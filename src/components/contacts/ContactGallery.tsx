import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import InteractiveBentoGallery from "@/components/blocks/interactive-bento-gallery";
import { useContacts } from "@/hooks/useContacts";
import { useEvents } from "@/hooks/useEvents";
import type { ApiContact, ApiEvent } from "@/types/api";

// Mapeo de posibles posiciones en la cuadrícula
const gridPositions = [
  "md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2",
  "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  "md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2",
  "md:col-span-2 md:row-span-1 sm:col-span-2 sm:row-span-1",
];

// URL de imagen por defecto para contactos sin imagen
const DEFAULT_IMAGE =
  "https://via.placeholder.com/400x600/667eea/ffffff?text=Sin+Imagen";

// Interfaz para los elementos de medios
interface MediaItem {
  id: number;
  type: string;
  title: string;
  desc: string;
  url: string;
  span: string;
}

interface ContactGalleryProps {
  title?: string;
  description?: string;
}

function buildDescription(
  contact: ApiContact,
  events: ApiEvent[] | undefined,
): string {
  if (contact.notes) return contact.notes;

  const birthday = events?.find(
    (e) => e.contact_id === contact.id && e.event_type === "birthday",
  );
  if (birthday) {
    return `Cumpleaños: ${new Date(birthday.date).toLocaleDateString("es-ES")}`;
  }

  return contact.relationship ?? "";
}

export default function ContactGallery({
  title = "Mis Contactos",
  description = "Arrastra y explora tus contactos",
}: ContactGalleryProps) {
  const { data: contacts, isLoading } = useContacts();
  const { data: events } = useEvents();

  const mediaItems = useMemo<MediaItem[]>(() => {
    if (!contacts) return [];
    return contacts.map((contact, index) => ({
      id: contact.id,
      type: "image",
      title: contact.name,
      desc: buildDescription(contact, events),
      url: contact.photo_url || DEFAULT_IMAGE,
      span: gridPositions[index % gridPositions.length],
    }));
  }, [contacts, events]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Si no hay contactos, mostrar mensaje
  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8">
        <h2 className="text-xl font-semibold mb-2">
          No hay contactos para mostrar
        </h2>
        <p className="text-muted-foreground">
          Añade contactos para verlos en la galería
        </p>
      </div>
    );
  }

  return (
    <InteractiveBentoGallery
      mediaItems={mediaItems}
      title={title}
      description={description}
    />
  );
}
