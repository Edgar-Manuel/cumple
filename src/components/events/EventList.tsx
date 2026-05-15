
import { useState } from "react";
import EventCard, { EventProps } from "./EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar as CalendarIcon, Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAnimationClasses } from "@/lib/animations";

// Sample data for events
const sampleEvents: EventProps[] = [
  {
    id: "1",
    title: "Cumpleaños",
    date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    type: "birthday",
    personName: "Ana García",
  },
  {
    id: "2",
    title: "Aniversario",
    date: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    type: "anniversary",
    personName: "Carlos y María",
  },
  {
    id: "3",
    title: "Graduación",
    date: new Date(new Date().getTime() + 22 * 24 * 60 * 60 * 1000), // 22 days from now
    type: "graduation",
    personName: "Eduardo Martínez",
  },
  {
    id: "4",
    title: "Cumpleaños",
    date: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    type: "birthday",
    personName: "Laura Sánchez",
  },
];

type ViewMode = "grid" | "list";

export default function EventList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  // Filter events based on search query
  const filteredEvents = sampleEvents.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    event.personName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort events by date (closest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
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
                viewMode === "grid" && "bg-secondary"
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
                viewMode === "list" && "bg-secondary"
              )}
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </div>
          <Button size="sm" className="gap-2">
            <Plus size={14} /> 
            <span>Nuevo Evento</span>
          </Button>
        </div>
      </div>
      
      {/* Events grid/list */}
      {sortedEvents.length > 0 ? (
        <div className={cn(
          "grid gap-6 animate-fade-in",
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {sortedEvents.map((event, index) => (
            <div 
              key={event.id}
              className={getAnimationClasses({ 
                variant: "slide-up", 
                delay: index < 3 ? 
                  index === 0 ? "none" : 
                  index === 1 ? "short" : "medium" : "none",
              })}
            >
              <EventCard {...event} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/30 rounded-lg">
          <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay eventos</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            No se encontraron eventos con los criterios de búsqueda actuales.
          </p>
          <Button>
            <Plus size={14} className="mr-2" /> 
            Crear nuevo evento
          </Button>
        </div>
      )}
    </div>
  );
}
