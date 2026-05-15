import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Gift, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  User,
  Pencil,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { agentZeroService } from "@/lib/AgentZeroService";
import { saveEvents, loadEvents } from "@/lib/storage";
import { getCardBackgroundClasses, getDefaultEventImage } from "@/lib/cardImageUtils";

export interface EventProps {
  id: string | number;
  title: string;
  date: Date;
  type: "birthday" | "anniversary" | "graduation" | "holiday" | "other";
  personName: string;
  personImage?: string;
  className?: string;
}

interface EventCardProps extends EventProps {
  onShowRecommendations?: (personName: string) => void;
  onUpdate?: () => void;
  onEdit?: () => void;
}

export default function EventCard({ 
  id, 
  title, 
  date, 
  type, 
  personName, 
  personImage,
  className,
  onShowRecommendations,
  onUpdate,
  onEdit
}: EventCardProps) {
  const formattedDate = new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const isPast = daysUntil < 0;
  const isToday = daysUntil === 0;
  
  const statusText = isPast 
    ? "Pasado" 
    : isToday 
      ? "Hoy" 
      : `En ${daysUntil} días`;
      
  const statusClass = isPast 
    ? "bg-muted/50 text-muted-foreground" 
    : isToday 
      ? "bg-primary/10 text-primary" 
      : daysUntil <= 7 
        ? "bg-primary/10 text-primary" 
        : "bg-secondary text-secondary-foreground";
        
  // Función para mostrar recomendaciones
  const handleShowRecommendations = async () => {
    if (onShowRecommendations) {
      onShowRecommendations(personName);
    } else {
      // Navegar directamente a la página de recomendaciones específicas para este evento
      navigate(`/gifts/event/${id}`);
    }
  };
  
  // Función para generar un mensaje personalizado
  const handleGenerateMessage = async () => {
    toast({
      title: "Generando mensaje",
      description: `Preparando un mensaje personalizado para ${personName}...`,
    });
    
    try {
      const message = await agentZeroService.generateMessage(id);
      
      if (message) {
        // Mostrar toast con el mensaje generado
        toast({
          title: "Mensaje generado",
          description: message.content,
        });
      } else {
        toast({
          title: "No se pudo generar el mensaje",
          description: "Inténtalo de nuevo más tarde.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error al generar mensaje:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el mensaje.",
        variant: "destructive"
      });
    }
  };
  
  // Función para compartir evento
  const handleShare = () => {
    // Simular compartir
    toast({
      title: "Compartir evento",
      description: `Compartiendo los detalles del evento de ${personName}...`,
    });
    
    // En una implementación real, aquí se abriría un modal o un selector de redes sociales
    setTimeout(() => {
      toast({
        title: "¡Evento compartido!",
        description: "El evento ha sido compartido exitosamente.",
      });
    }, 1500);
  };

  // Función para editar evento
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onEdit) {
      onEdit();
    } else {
      toast({
        title: "Editar evento",
        description: `Próximamente: Edición de eventos.`,
      });
    }
  };

  // Función para eliminar evento
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm(`¿Estás seguro de que deseas eliminar el evento "${title}"?`)) {
      try {
        // Cargar eventos actuales
        const currentEvents = loadEvents();
        
        // Filtrar el evento a eliminar
        const updatedEvents = currentEvents.filter(event => event.id !== id);
        
        // Guardar eventos actualizados
        saveEvents(updatedEvents);
        
        toast({
          title: "Evento eliminado",
          description: `El evento "${title}" ha sido eliminado correctamente.`,
        });
        
        // Actualizar la vista si existe la función onUpdate
        if (onUpdate) {
          onUpdate();
        } else {
          // Si no hay función de actualización, recargar la página
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } catch (error) {
        console.error("Error al eliminar evento:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar el evento.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className={cn(
      "glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer relative",
      className
    )} onClick={handleShowRecommendations}>
      {/* Fondo con gradiente según tipo de evento */}
      <div className={`absolute inset-0 ${getCardBackgroundClasses(type)}`} />
      
      {/* Imagen de fondo si existe */}
      {personImage && (
        <div className="absolute inset-0">
          <img 
            src={personImage} 
            alt={personName}
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      )}
      
      {/* Overlay para asegurar legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 mb-3">
            {personImage ? (
              <img 
                src={personImage} 
                alt={personName} 
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-subtle"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shadow-subtle">
                <User size={20} className="text-secondary-foreground" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{personName}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleShowRecommendations();
              }}>
                <Gift className="mr-2 h-4 w-4" />
                Ver recomendaciones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleGenerateMessage();
              }}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Generar mensaje
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-muted-foreground" />
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              statusClass
            )}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
      
      <div className="border-t flex divide-x">
        <Button 
          variant="ghost" 
          className="flex-1 rounded-none h-10 text-xs hover:bg-primary/10" 
          title="Sugerir regalo"
          onClick={(e) => {
            e.stopPropagation();
            handleShowRecommendations();
          }}
        >
          <Gift size={14} className="mr-1" />
          <span className="hidden sm:inline">Regalo</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex-1 rounded-none h-10 text-xs hover:bg-primary/10" 
          title="Generar mensaje"
          onClick={(e) => {
            e.stopPropagation();
            handleGenerateMessage();
          }}
        >
          <MessageSquare size={14} className="mr-1" />
          <span className="hidden sm:inline">Mensaje</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex-1 rounded-none h-10 text-xs hover:bg-primary/10" 
          title="Compartir"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
        >
          <Share2 size={14} className="mr-1" />
          <span className="hidden sm:inline">Compartir</span>
        </Button>
      </div>
    </div>
  );
}
