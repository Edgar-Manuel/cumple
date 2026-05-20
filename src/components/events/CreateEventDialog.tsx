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
import { Textarea } from "@/components/ui/textarea";
import { Contact } from "@/components/contacts/CreateContactDialog";
import { Plus, Calendar, Info, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  onCreateEvent: (event: {
    title: string;
    date: Date;
    type: "birthday" | "anniversary" | "graduation" | "holiday" | "other";
    personName: string;
    contactId?: number | string;
    eventInterests?: string;
    previousGifts?: string;
  }) => void;
  onCreateContactClick: () => void;
}

// Crear tipos de eventos comunes con sus descripciones
const eventTypes = [
  { 
    value: "birthday", 
    label: "Cumpleaños",
    description: "Celebración anual del nacimiento"
  },
  { 
    value: "anniversary", 
    label: "Aniversario",
    description: "Conmemoración de una fecha importante"
  },
  { 
    value: "graduation", 
    label: "Graduación",
    description: "Celebración académica o profesional"
  },
  { 
    value: "holiday", 
    label: "Festividad",
    description: "Día festivo o celebración cultural"
  },
  { 
    value: "other", 
    label: "Otro",
    description: "Cualquier otro tipo de evento"
  }
];

// Plantillas de títulos para cada tipo de evento
const eventTitleTemplates = {
  birthday: "Cumpleaños de ",
  anniversary: "Aniversario con ",
  graduation: "Graduación de ",
  holiday: "Celebración con ",
  other: "Evento con "
};

export default function CreateEventDialog({
  open,
  onOpenChange,
  contacts,
  onCreateEvent,
  onCreateContactClick
}: CreateEventDialogProps) {
  const [title, setTitle] = useState("");
  const [dateString, setDateString] = useState("");
  const [type, setType] = useState<"birthday" | "anniversary" | "graduation" | "holiday" | "other">("birthday");
  const [selectedContactId, setSelectedContactId] = useState<string>("none");
  const [personName, setPersonName] = useState("");
  const [eventInterests, setEventInterests] = useState("");
  const [previousGifts, setPreviousGifts] = useState("");

  // Gestión de título automático cuando cambia el tipo o el contacto
  useEffect(() => {
    if (selectedContactId && selectedContactId !== "none") {
      const contact = contacts.find(c => c.id.toString() === selectedContactId);
      if (contact) {
        // Actualizar el título basado en el tipo de evento y el nombre del contacto
        const templateBase = eventTitleTemplates[type];
        setTitle(`${templateBase}${contact.name}`);
      }
    }
  }, [type, selectedContactId, contacts]);

  // Sugerir fecha basada en el tipo de evento
  const suggestDate = (eventType: string) => {
    const today = new Date();
    let suggestedDate = new Date();
    
    switch(eventType) {
      case "birthday":
        // Para cumpleaños, si hay fecha de nacimiento, usar esa
        if (selectedContactId && selectedContactId !== "none") {
          const contact = contacts.find(c => c.id.toString() === selectedContactId);
          if (contact && contact.birthdate) {
            const birthdate = new Date(contact.birthdate);
            suggestedDate = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
            
            // Si la fecha ya pasó este año, sugerir para el próximo
            if (suggestedDate < today) {
              suggestedDate.setFullYear(today.getFullYear() + 1);
            }
          } else {
            // Sin fecha de nacimiento, sugerir 1 mes en el futuro
            suggestedDate.setMonth(today.getMonth() + 1);
          }
        } else {
          // Sin contacto seleccionado, sugerir 1 mes en el futuro
          suggestedDate.setMonth(today.getMonth() + 1);
        }
        break;
        
      case "anniversary":
        // Sugerir 1 año desde hoy para aniversarios
        suggestedDate.setFullYear(today.getFullYear() + 1);
        break;
        
      case "graduation":
        // Sugerir fecha de graduación común (mayo-junio)
        const gradMonth = today.getMonth() <= 5 ? 5 : 17; // Junio de este año o del próximo
        suggestedDate = new Date(
          today.getMonth() <= 5 ? today.getFullYear() : today.getFullYear() + 1, 
          gradMonth % 12, 
          15
        );
        break;
        
      case "holiday":
        // Sugerir próxima Navidad como ejemplo
        suggestedDate = new Date(today.getFullYear(), 11, 25);
        if (suggestedDate < today) {
          suggestedDate.setFullYear(today.getFullYear() + 1);
        }
        break;
        
      default:
        // Para otros, sugerir 2 semanas en el futuro
        suggestedDate.setDate(today.getDate() + 14);
    }
    
    return suggestedDate.toISOString().split('T')[0];
  };

  // Cuando cambia el tipo de evento, actualizar la fecha sugerida si no hay una ya seleccionada
  const handleTypeChange = (newType: "birthday" | "anniversary" | "graduation" | "holiday" | "other") => {
    setType(newType);
    
    // Si no hay fecha seleccionada o el usuario está empezando, sugerir una fecha
    if (!dateString) {
      setDateString(suggestDate(newType));
    }
  };

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

    onCreateEvent({
      title,
      date,
      type,
      personName,
      contactId: selectedContactId !== "none" ? selectedContactId : undefined,
      eventInterests: eventInterests || undefined,
      previousGifts: previousGifts || undefined,
    });

    setTitle("");
    setDateString("");
    setType("birthday");
    setSelectedContactId("none");
    setPersonName("");
    setEventInterests("");
    setPreviousGifts("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
          <DialogDescription>
            Añade un evento importante y <span className="font-medium text-primary">recibirás recomendaciones personalizadas de regalos</span> cuando se acerque la fecha.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selección de contacto (primera sección importante) */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="contact" className="flex items-center gap-2">
                  <span>Persona</span>
                  <Badge variant="outline" className="text-xs font-normal">Importante</Badge>
                </Label>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={onCreateContactClick}
                  className="text-xs h-7 px-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nuevo Contacto
                </Button>
              </div>
              
              <Select
                value={selectedContactId}
                onValueChange={handleContactChange}
              >
                <SelectTrigger id="contact" className="w-full">
                  <SelectValue placeholder="Selecciona un contacto o crea uno nuevo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin contacto asociado</SelectItem>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedContactId === "none" && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Para obtener mejores recomendaciones, selecciona o crea un contacto
                </p>
              )}
            </div>

            {/* Tipo de evento */}
            <div className="space-y-2">
              <Label htmlFor="type" className="flex items-center gap-2">
                <span>Tipo de evento</span>
                <Badge variant="outline" className="text-xs font-normal">Importante</Badge>
              </Label>
              <Select
                value={type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecciona el tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(eventType => (
                    <SelectItem key={eventType.value} value={eventType.value}>
                      <span className="flex items-center gap-2">
                        {eventType.label}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{eventType.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha del evento */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <span>Fecha</span>
                <Badge variant="outline" className="text-xs font-normal">Importante</Badge>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="date"
                  type="date"
                  value={dateString}
                  onChange={(e) => setDateString(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setDateString(suggestDate(type))}
                  className="h-10 w-10"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Título del evento */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Título del evento</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Cumpleaños de Ana"
                required
              />
            </div>

            {/* Campos dependientes del contacto seleccionado */}
            {selectedContactId === "none" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="personName">Nombre de la persona</Label>
                <Input
                  id="personName"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Ej. Ana García"
                  required
                />
              </div>
            )}

            {/* Sección de personalización para mejores recomendaciones */}
            <div className="space-y-2 md:col-span-2 pt-4 border-t">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-primary">Información para Recomendaciones</h3>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                Esta información nos ayuda a generar mejores recomendaciones de regalos para este evento
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="eventInterests" className="flex justify-between">
                <span>Intereses específicos para este evento</span>
                <span className="text-xs text-muted-foreground">Opcional</span>
              </Label>
              <Textarea
                id="eventInterests"
                value={eventInterests}
                onChange={(e) => setEventInterests(e.target.value)}
                placeholder="Ej. Este año está obsesionado con la cocina italiana, busca un libro de pasta..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="previousGifts">Regalos anteriores</Label>
              <Textarea
                id="previousGifts"
                value={previousGifts}
                onChange={(e) => setPreviousGifts(e.target.value)}
                placeholder="Lista de regalos que ya has dado a esta persona (para evitar repeticiones)"
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Evento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 