import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCreateContact } from "@/hooks/useContacts";
import { useCreateEvent } from "@/hooks/useEvents";
import { ApiClientError } from "@/lib/apiClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Tipo `Contact` re-exportado para compatibilidad con código existente
 * que aún consume la forma local previa (incluye `birthdate`, ausente en `ApiContact`).
 * Cuando se complete la migración, importar `ApiContact` directamente desde `@/types/api`.
 */
export interface Contact {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  interests?: string;
  affinity?: number;
  how_we_met?: string;
  notes?: string;
  photo_url?: string;
  /**
   * Fecha de nacimiento. En la nueva API esto se modela como un evento separado
   * de tipo "birthday"; se mantiene aquí como opcional para compatibilidad.
   */
  birthdate?: string | Date;
  image?: string;
}

const commonInterests = [
  "Tecnología", "Deportes", "Lectura", "Música", "Cine", "Viajes",
  "Cocina", "Arte", "Fotografía", "Jardinería", "Videojuegos", "Moda",
  "Fitness", "Decoración", "Naturaleza", "Historia"
];

const commonRelationships = [
  "Familiar", "Amigo/a", "Compañero/a de trabajo", "Pareja", "Vecino/a",
  "Conocido/a", "Profesor/a", "Estudiante", "Jefe/a", "Cliente"
];

export default function CreateContactDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateContactDialogProps) {
  const { toast } = useToast();
  const createContact = useCreateContact();
  const createEvent = useCreateEvent();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [affinity, setAffinity] = useState("3");
  const [howWeMet, setHowWeMet] = useState("");
  const [interests, setInterests] = useState("");
  const [notes, setNotes] = useState("");

  const addInterest = (interest: string) => {
    if (interests.includes(interest)) return;
    setInterests(interests.length > 0 ? `${interests}, ${interest}` : interest);
  };

  const calculateAge = (date: string) => {
    if (!date) return "";
    const today = new Date();
    const birth = new Date(date);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} años`;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRelationship("");
    setBirthdate("");
    setAffinity("3");
    setHowWeMet("");
    setInterests("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newContact = await createContact.mutateAsync({
        name,
        email: email || undefined,
        phone: phone || undefined,
        relationship: relationship || undefined,
        interests: interests || undefined,
        affinity: parseInt(affinity, 10),
        how_we_met: howWeMet || undefined,
        notes: notes || undefined,
      });

      // Si hay fecha de nacimiento, crear un evento de cumpleaños
      if (birthdate) {
        try {
          // Usar próximo cumpleaños (mismo día/mes este año o el siguiente)
          const birth = new Date(birthdate);
          const today = new Date();
          const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
          if (next < today) next.setFullYear(today.getFullYear() + 1);

          await createEvent.mutateAsync({
            contact_id: newContact.id,
            title: `Cumpleaños de ${newContact.name}`,
            event_type: "birthday",
            date: next.toISOString(),
            reminder_days: 7,
          });
        } catch (err) {
          console.error("No se pudo crear el evento de cumpleaños:", err);
        }
      }

      toast({
        title: "Contacto creado",
        description: `${newContact.name} ha sido añadido correctamente.`,
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.detail
          : "No se pudo crear el contacto. Inténtalo de nuevo.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const isSubmitting = createContact.isPending || createEvent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarjeta de Contacto</DialogTitle>
          <DialogDescription>
            Añade un nuevo contacto. <span className="font-medium text-primary">Cuanta más información proporciones, mejores serán las recomendaciones de regalos.</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground">Información Básica</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo*</Label>
              <Input
                id="name"
                placeholder="Ej. María García"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship" className="flex justify-between">
                <span>Relación</span>
                <span className="text-xs text-muted-foreground">Ayuda a personalizar recomendaciones</span>
              </Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una relación" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    Relaciones comunes
                  </div>
                  {commonRelationships.map((rel) => (
                    <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+34 600 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate" className="flex justify-between">
                <span>Fecha de nacimiento</span>
                <span className="text-xs text-muted-foreground">
                  {birthdate ? calculateAge(birthdate) : ""}
                </span>
              </Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affinity" className="flex justify-between">
                <span>Grado de afinidad</span>
                <span className="text-xs text-muted-foreground">Importancia (1-5)</span>
              </Label>
              <Select value={affinity} onValueChange={setAffinity}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el nivel de afinidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Conocido</SelectItem>
                  <SelectItem value="2">2 - Casual</SelectItem>
                  <SelectItem value="3">3 - Normal</SelectItem>
                  <SelectItem value="4">4 - Cercano</SelectItem>
                  <SelectItem value="5">5 - Muy cercano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2 pt-2">
              <h3 className="text-sm font-medium text-primary">Información para Mejores Recomendaciones</h3>
              <p className="text-xs text-muted-foreground">Clave para generar recomendaciones personalizadas</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="interests" className="flex justify-between">
                <span>Intereses y aficiones</span>
                <span className="text-xs text-muted-foreground">¡Muy importante!</span>
              </Label>
              <Textarea
                id="interests"
                placeholder="Ej. Le gusta la tecnología, coleccionar vinilos, hacer senderismo..."
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {commonInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => addInterest(interest)}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    + {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="howWeMet">¿Cómo se conocieron?</Label>
              <Textarea
                id="howWeMet"
                placeholder="Describe brevemente cómo y cuándo conociste a esta persona"
                value={howWeMet}
                onChange={(e) => setHowWeMet(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Cualquier otra información, anécdotas o detalles"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Contacto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
