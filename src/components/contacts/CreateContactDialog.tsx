import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Contact {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  birthdate?: string;
  affinity?: number; // Grado de afinidad (1-5)
  howWeMet?: string; // Cómo se conocieron
  interests?: string; // Intereses y hobbies
  previousGifts?: string; // Historial de regalos previos
  notes?: string; // Notas adicionales y anécdotas
}

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateContact: (contact: Omit<Contact, "id">) => void;
}

export default function CreateContactDialog({
  open,
  onOpenChange,
  onCreateContact
}: CreateContactDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [affinity, setAffinity] = useState("3"); // Default a nivel medio
  const [howWeMet, setHowWeMet] = useState("");
  const [interests, setInterests] = useState("");
  const [previousGifts, setPreviousGifts] = useState("");
  const [notes, setNotes] = useState("");

  // Lista predefinida de intereses comunes que pueden seleccionarse
  const commonInterests = [
    "Tecnología", "Deportes", "Lectura", "Música", "Cine", "Viajes", 
    "Cocina", "Arte", "Fotografía", "Jardinería", "Videojuegos", "Moda",
    "Fitness", "Decoración", "Naturaleza", "Historia"
  ];

  // Lista predefinida de relaciones comunes
  const commonRelationships = [
    "Familiar", "Amigo/a", "Compañero/a de trabajo", "Pareja", "Vecino/a", 
    "Conocido/a", "Profesor/a", "Estudiante", "Jefe/a", "Cliente"
  ];

  // Agregar interés al campo de intereses
  const addInterest = (interest: string) => {
    if (interests.includes(interest)) return;
    
    const newInterests = interests.length > 0 
      ? `${interests}, ${interest}`
      : interest;
    
    setInterests(newInterests);
  };

  // Calcular edad a partir de la fecha de nacimiento
  const calculateAge = (birthdate: string) => {
    if (!birthdate) return "";
    
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} años`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onCreateContact({
      name,
      email,
      phone,
      relationship,
      birthdate,
      affinity: parseInt(affinity),
      howWeMet,
      interests,
      previousGifts,
      notes
    });

    // Limpiar el formulario
    setName("");
    setEmail("");
    setPhone("");
    setRelationship("");
    setBirthdate("");
    setAffinity("3");
    setHowWeMet("");
    setInterests("");
    setPreviousGifts("");
    setNotes("");
    onOpenChange(false);
  };

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
            {/* Información Básica */}
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
              <Select
                value={relationship}
                onValueChange={setRelationship}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona o escribe una relación" />
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
              <Select
                value={affinity}
                onValueChange={setAffinity}
              >
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

            {/* Información para Recomendaciones */}
            <div className="space-y-2 md:col-span-2 pt-2">
              <h3 className="text-sm font-medium text-primary">Información para Mejores Recomendaciones</h3>
              <p className="text-xs text-muted-foreground">Esta información es clave para generar recomendaciones personalizadas</p>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="interests" className="flex justify-between">
                <span>Intereses y aficiones</span>
                <span className="text-xs text-muted-foreground">¡Muy importante para las recomendaciones!</span>
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
              <Label htmlFor="previousGifts">Regalos anteriores</Label>
              <Textarea
                id="previousGifts"
                placeholder="Lista de regalos que ya le has dado (evita repeticiones)"
                value={previousGifts}
                onChange={(e) => setPreviousGifts(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Cualquier otra información relevante, anécdotas o detalles"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear Contacto</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 