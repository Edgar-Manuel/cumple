import React, { useEffect, useState } from 'react';
import InteractiveBentoGallery from '@/components/blocks/interactive-bento-gallery';
import { loadContacts } from '@/lib/storage';
import { Contact } from './CreateContactDialog';

// Mapeo de posibles posiciones en la cuadrícula
const gridPositions = [
  "md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2",
  "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  "md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2",
  "md:col-span-2 md:row-span-1 sm:col-span-2 sm:row-span-1",
];

// URL de imagen por defecto para contactos sin imagen
const DEFAULT_IMAGE = 'https://via.placeholder.com/400x600/667eea/ffffff?text=Sin+Imagen';

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

export default function ContactGallery({ title = "Mis Contactos", description = "Arrastra y explora tus contactos" }: ContactGalleryProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    // Cargar contactos y convertirlos en elementos de medios
    const contacts = loadContacts<Contact>();
    
    const items: MediaItem[] = contacts.map((contact, index) => ({
      id: typeof contact.id === 'string' ? parseInt(contact.id) : contact.id,
      type: "image", // Asumimos que todos son imágenes por ahora
      title: contact.name,
      desc: contact.notes || (contact.birthdate ? `Cumpleaños: ${new Date(contact.birthdate).toLocaleDateString('es-ES')}` : ""),
      url: DEFAULT_IMAGE, // Usamos imagen por defecto ya que Contact no tiene propiedad photo
      span: gridPositions[index % gridPositions.length] // Asignar posiciones de manera cíclica
    }));

    setMediaItems(items);
  }, []);

  // Si no hay contactos, mostrar mensaje
  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8">
        <h2 className="text-xl font-semibold mb-2">No hay contactos para mostrar</h2>
        <p className="text-muted-foreground">Añade contactos para verlos en la galería</p>
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