import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Contact } from "@/components/contacts/CreateContactDialog";
import { EventProps } from "./EventCard";
import { ImageUpload } from "@/components/ui/image-upload";
import { uploadImage } from "@/lib/fileUploadService";

interface ExtendedEventProps extends EventProps {
  contactId?: number | string;
  affinity?: number;
  howWeMet?: string;
  interests?: string;
  previousGifts?: string;
}

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ExtendedEventProps | null | undefined;
  contacts: Contact[];
  onSaveEvent: (updatedEvent: any) => void;
  onCreateContactClick: () => void;
}

export default function EditEventDialog({
  open,
  onOpenChange,
  event,
  contacts,
  onSaveEvent,
  onCreateContactClick
}: EditEventDialogProps) {
  const [title, setTitle] = useState(event?.title || "");
  const [dateString, setDateString] = useState("");
  const [type, setType] = useState<"birthday" | "anniversary" | "graduation" | "holiday" | "other">(
    event?.type || "birthday"
  );
  const [selectedContactId, setSelectedContactId] = useState<string>(
    event?.contactId ? event.contactId.toString() : "none"
  );
  const [personName, setPersonName] = useState(event?.personName || "");
  const [affinity, setAffinity] = useState<string>(
    event?.affinity ? event.affinity.toString() : "3"
  );
  const [howWeMet, setHowWeMet] = useState(event?.howWeMet || "");
  const [interests, setInterests] = useState(event?.interests || "");
  const [previousGifts, setPreviousGifts] = useState(event?.previousGifts || "");
  const [personImage, setPersonImage] = useState<string | undefined>(event?.personImage);
  const [isUploading, setIsUploading] = useState(false);

  // Inicializar fecha al abrir el diálogo
  useEffect(() => {
    if (event?.date) {
      const date = new Date(event.date);
      setDateString(date.toISOString().split('T')[0]);
    }
  }, [event, open]);

  // Actualizar todos los campos cuando cambia el evento
  useEffect(() => {
    setTitle(event?.title || "");
    setPersonName(event?.personName || "");
    setType(event?.type || "birthday");
    setSelectedContactId(event?.contactId ? event.contactId.toString() : "none");
    setAffinity(event?.affinity ? event.affinity.toString() : "3");
    setHowWeMet(event?.howWeMet || "");
    setInterests(event?.interests || "");
    setPreviousGifts(event?.previousGifts || "");
    setPersonImage(event?.personImage);
    
    if (event?.date) {
      const date = new Date(event.date);
      setDateString(date.toISOString().split('T')[0]);
    }
  }, [event]);

  // Cuando se selecciona un contacto, autocompletar algunos campos
  const handleContactChange = (contactId: string) => {
    setSelectedContactId(contactId);
    
    if (contactId && contactId !== "none") {
      const selectedContact = contacts.find(contact => contact.id.toString() === contactId);
      if (selectedContact) {
        setPersonName(selectedContact.name);
        
        // Si el contacto tiene fecha de nacimiento y es un cumpleaños, usar esa fecha
        if (selectedContact.birthdate && type === "birthday") {
          // Obtener solo mes y día, usar el año actual
          const birthdate = new Date(selectedContact.birthdate);
          const currentYear = new Date().getFullYear();
          const eventDate = new Date(currentYear, birthdate.getMonth(), birthdate.getDate());
          
          // Si la fecha ya pasó este año, usar el próximo año
          if (eventDate < new Date()) {
            eventDate.setFullYear(currentYear + 1);
          }
          
          setDateString(eventDate.toISOString().split('T')[0]);
        }
        
        // Si hay notas, usarlas como intereses
        if (selectedContact.notes) {
          setInterests(selectedContact.notes);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateString) {
      alert("Por favor, selecciona una fecha para el evento");
      return;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      alert("La fecha seleccionada no es válida");
      return;
    }

    onSaveEvent({
      ...event,
      title,
      date,
      type,
      personName,
      contactId: selectedContactId !== "none" ? selectedContactId : undefined,
      affinity: parseInt(affinity),
      howWeMet,
      interests,
      previousGifts
    });

    onOpenChange(false);
  };

  const handleSave = () => {
    if (!title) {
      alert("Por favor, ingresa un título para el evento");
      return;
    }

    if (!dateString) {
      alert("Por favor, selecciona una fecha para el evento");
      return;
    }

    if (!event) {
      console.error("Error: No hay evento para editar");
      return;
    }

    // Crear un nuevo objeto Date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      alert("La fecha seleccionada no es válida");
      return;
    }

    // Asegurarse de que el affinity sea un número
    const affinityNum = parseInt(affinity);

    // Llamar a la función para guardar el evento con todas las propiedades necesarias
    onSaveEvent({
      ...event,
      title,
      date,
      type,
      personName,
      personImage,
      contactId: selectedContactId !== "none" ? selectedContactId : undefined,
      affinity: affinityNum,
      howWeMet,
      interests,
      previousGifts
    });

    onOpenChange(false);
  };

  // Manejar la subida de una imagen
  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      // Subir imagen a la carpeta de eventos
      const imagePath = await uploadImage(file, 'events');
      setPersonImage(imagePath);
      setIsUploading(false);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      setIsUploading(false);
      alert("Error al subir la imagen. Por favor, inténtalo de nuevo.");
    }
  };

  // Manejar la eliminación de la imagen
  const handleImageRemove = () => {
    setPersonImage(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>
            Modifica los detalles del evento y guarda los cambios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="contact">Contacto</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  onCreateContactClick();
                }}
              >
                Nuevo Contacto
              </Button>
            </div>
            <Select value={selectedContactId} onValueChange={handleContactChange}>
              <SelectTrigger id="contact">
                <SelectValue placeholder="Seleccionar contacto existente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Evento sin contacto --</SelectItem>
                {contacts.map(contact => (
                  <SelectItem key={contact.id} value={contact.id.toString()}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título del Evento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cumpleaños de Juan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={dateString}
              onChange={(e) => setDateString(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Evento</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="birthday">🎂 Cumpleaños</SelectItem>
                <SelectItem value="anniversary">💑 Aniversario</SelectItem>
                <SelectItem value="graduation">🎓 Graduación</SelectItem>
                <SelectItem value="holiday">🎉 Festividad</SelectItem>
                <SelectItem value="other">📅 Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personName">Nombre de la Persona</Label>
            <Input
              id="personName"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="affinity">Grado de Afinidad (1-5)</Label>
            <Select value={affinity} onValueChange={setAffinity}>
              <SelectTrigger id="affinity">
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">⭐ Conocido</SelectItem>
                <SelectItem value="2">⭐⭐ Amigo</SelectItem>
                <SelectItem value="3">⭐⭐⭐ Buen Amigo</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ Muy Cercano</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ Íntimo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="howWeMet">Cómo se Conocieron</Label>
            <Select value={howWeMet} onValueChange={setHowWeMet}>
              <SelectTrigger id="howWeMet">
                <SelectValue placeholder="Seleccionar relación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="childhood">Amigo de la Infancia</SelectItem>
                <SelectItem value="school">Compañero de Estudios</SelectItem>
                <SelectItem value="work">Colega de Trabajo</SelectItem>
                <SelectItem value="family">Familiar</SelectItem>
                <SelectItem value="mutual">Amigo en Común</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Intereses y Hobbies</Label>
            <Textarea
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Deportes, música, cine, lectura..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousGifts">Regalos Previos</Label>
            <Textarea
              id="previousGifts"
              value={previousGifts}
              onChange={(e) => setPreviousGifts(e.target.value)}
              placeholder="Lista de regalos que ya le has hecho..."
              className="min-h-[80px]"
            />
          </div>
          
          {/* Sección para subir imagen */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-base font-medium">Imagen del evento</h3>
            <div className="flex flex-col items-center">
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                defaultImage={personImage}
                label="Subir imagen para este evento"
              />
              {isUploading && <p className="text-sm text-muted-foreground mt-2">Subiendo imagen...</p>}
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 