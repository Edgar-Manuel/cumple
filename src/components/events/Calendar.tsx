import { useState, useEffect } from "react";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EventProps } from "./EventCard";

// Eliminar datos de muestra
// const datesWithEvents = [...];

interface CalendarProps {
  events?: EventProps[];
}

export default function Calendar({ events = [] }: CalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [validEvents, setValidEvents] = useState<EventProps[]>([]);
  const [hasError, setHasError] = useState(false);
  
  // Validar los eventos para asegurarse de que las fechas sean correctas
  useEffect(() => {
    try {
      // Filtrar eventos con fechas válidas
      const filteredEvents = events.filter(event => 
        event && event.date && event.date instanceof Date && !isNaN(event.date.getTime())
      );
      
      console.log(`Eventos filtrados (válidos): ${filteredEvents.length} de ${events.length}`);
      setValidEvents(filteredEvents);
      
      // Si hay eventos que se eliminaron por tener fechas inválidas
      if (filteredEvents.length < events.length) {
        console.warn(`Se omitieron ${events.length - filteredEvents.length} eventos con fechas inválidas`);
      }
      
      setHasError(false);
    } catch (error) {
      console.error("Error crítico al procesar eventos para el calendario:", error);
      setValidEvents([]);
      setHasError(true);
    }
  }, [events]);
  
  // Si hay un error crítico, mostrar mensaje de error
  if (hasError) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
        <div className="text-center">
          <CalendarIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-medium text-lg text-red-500">
            Error al cargar el calendario
          </h3>
          <p className="text-gray-500 mt-2">
            Ha ocurrido un error al cargar los eventos del calendario. Por favor, actualiza la página o inténtalo de nuevo más tarde.
          </p>
        </div>
      </div>
    );
  }
  
  // Función para obtener los eventos de un día específico
  const getEventsForDay = (day: Date) => {
    try {
      return validEvents.filter(event => 
        event?.date &&
        event.date.getDate() === day.getDate() && 
        event.date.getMonth() === day.getMonth() && 
        event.date.getFullYear() === day.getFullYear()
      );
    } catch (error) {
      console.error("Error al filtrar eventos para el día:", error);
      return [];
    }
  };

  // Función para formatear la fecha en español
  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat("es", {
        month: "long",
        year: "numeric"
      }).format(date);
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "";
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium text-lg flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
          Calendario
        </h3>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium capitalize">
            {formatDate(month)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                try {
                  const newMonth = new Date(month);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setMonth(newMonth);
                } catch (error) {
                  console.error("Error al cambiar al mes anterior:", error);
                }
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                try {
                  const newMonth = new Date(month);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setMonth(newMonth);
                } catch (error) {
                  console.error("Error al cambiar al mes siguiente:", error);
                }
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
          {/* Días de la semana */}
          {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day) => (
            <div key={day} className="bg-white p-3 text-center">
              <span className="text-sm font-medium text-muted-foreground">
                {day}
              </span>
            </div>
          ))}

          {/* Días del mes */}
          {Array.from({ length: 35 }, (_, i) => {
            try {
              const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
              const startingDay = firstDay.getDay();
              const day = new Date(month.getFullYear(), month.getMonth(), i - startingDay + 1);
              const isCurrentMonth = day.getMonth() === month.getMonth();
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().toDateString() === day.toDateString();
              const isSaturday = day.getDay() === 6;
              const isSunday = day.getDay() === 0;

              return (
                <div
                  key={i}
                  className={cn(
                    "bg-white min-h-[120px] p-2 relative",
                    !isCurrentMonth && "bg-muted/5",
                    isToday && "bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !isCurrentMonth && "text-muted-foreground",
                      isSaturday || isSunday ? "text-red-500" : "text-foreground",
                      isToday && "text-primary"
                    )}
                  >
                    {day.getDate()}
                  </span>

                  {/* Eventos del día */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-2 rounded-md bg-primary/10 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <User size={12} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-medium truncate">{event.title}</p>
                            <p className="text-muted-foreground truncate">{event.personName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } catch (error) {
              console.error("Error al renderizar día del calendario:", error);
              return <div key={i} className="bg-white min-h-[120px] p-2 relative"></div>;
            }
          })}
        </div>
      </div>
    </div>
  );
}
