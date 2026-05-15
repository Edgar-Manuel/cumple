import { motion } from "framer-motion";
import { EventProps } from "./EventCard";
import { getCardBackgroundClasses } from "@/lib/cardImageUtils";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

// Propiedades extendidas para el componente
export interface UpcomingEventCardProps {
  event: EventProps;
  index: number;
  gridPosition: string;
  isDragging?: boolean;
  onEdit?: (id: string | number) => void;
  onClick?: (event: EventProps) => void;
  className?: string;
}

export default function UpcomingEventCard({
  event,
  index,
  gridPosition,
  isDragging = false,
  onEdit,
  onClick,
  className
}: UpcomingEventCardProps) {
  // Calcular días restantes
  const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const isPast = daysUntil < 0;
  const isToday = daysUntil === 0;
  const isSoon = daysUntil > 0 && daysUntil <= 7;
  
  // Estado del evento
  const statusText = isPast 
    ? "Pasado" 
    : isToday 
      ? "¡Hoy!" 
      : `En ${daysUntil} días`;
  
  // Clase para el estado
  const statusClass = isToday 
    ? 'bg-green-500 text-white' 
    : isSoon 
      ? 'bg-amber-500 text-white' 
      : isPast 
        ? 'bg-gray-400 text-white dark:bg-gray-700' 
        : 'bg-blue-500/70 text-white';
  
  // Manejar clic en botón de edición
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(event.id);
    }
  };
  
  // Manejar clic en tarjeta
  const handleCardClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <motion.div
      layoutId={`event-${event.id}`}
      className={cn(
        `relative overflow-hidden rounded-xl cursor-pointer ${gridPosition}`,
        isDragging ? 'ring-2 ring-primary shadow-lg scale-105' : '',
        className
      )}
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 350,
            damping: 25,
            delay: index * 0.05
          }
        }
      }}
      whileHover={{ scale: 1.02 }}
      onClick={handleCardClick}
    >
      {/* Color o imagen de fondo según el tipo de evento */}
      <div className={`absolute inset-0 ${getCardBackgroundClasses(event.type)}`} />
      
      {/* Imagen de fondo si existe */}
      {event.personImage && (
        <div className="absolute inset-0">
          <img 
            src={event.personImage} 
            alt={event.personName}
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      )}
      
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      
      {/* Indicador de tipo de evento */}
      <div className="absolute top-2 left-2 rounded-md px-2 py-0.5 text-xs font-medium bg-black/30 text-white">
        {event.type === "birthday" ? "🎂" : 
         event.type === "anniversary" ? "💑" : 
         event.type === "graduation" ? "🎓" : 
         event.type === "holiday" ? "🎉" : "📅"}
      </div>
      
      {/* Botón de edición */}
      {onEdit && (
        <div className="absolute top-2 right-2 z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full bg-black/20 hover:bg-black/40 text-white"
            onClick={handleEditClick}
          >
            <Pencil size={12} />
          </Button>
        </div>
      )}
      
      {/* Contenido */}
      <div className="absolute inset-0 p-3 flex flex-col justify-end">
        <div className="relative z-10">
          <h3 className="text-white text-sm sm:text-base font-medium line-clamp-1">
            {event.title}
          </h3>
          <p className="text-white/80 text-xs mt-0.5 line-clamp-1">
            {event.personName}
          </p>
          <div className="flex items-center mt-1">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${statusClass}`}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 