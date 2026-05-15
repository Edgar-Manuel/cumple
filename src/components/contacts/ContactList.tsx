
import { useState } from "react";
import ContactCard, { ContactProps } from "./ContactCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAnimationClasses } from "@/lib/animations";

// Sample data for contacts
const sampleContacts: ContactProps[] = [
  {
    id: "1",
    name: "Ana García",
    email: "ana.garcia@example.com",
    phone: "+34 612 345 678",
    birthdate: new Date(1990, 3, 15), // April 15, 1990
    relationshipLevel: 5,
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "+34 623 456 789",
    birthdate: new Date(1985, 6, 22), // July 22, 1985
    relationshipLevel: 4,
  },
  {
    id: "3",
    name: "Laura Sánchez",
    email: "laura.sanchez@example.com",
    phone: "+34 634 567 890",
    birthdate: new Date(1992, 10, 8), // November 8, 1992
    relationshipLevel: 3,
  },
  {
    id: "4",
    name: "Eduardo Martínez",
    email: "eduardo.martinez@example.com",
    phone: "+34 645 678 901",
    birthdate: new Date(1988, 1, 29), // February 29, 1988
    relationshipLevel: 4,
  },
];

type ViewMode = "grid" | "list";

export default function ContactList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  // Filter contacts based on search query
  const filteredContacts = sampleContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (contact.phone && contact.phone.includes(searchQuery))
  );
  
  // Sort contacts by name
  const sortedContacts = [...filteredContacts].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contactos..."
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
            <span>Nuevo Contacto</span>
          </Button>
        </div>
      </div>
      
      {/* Contacts grid/list */}
      {sortedContacts.length > 0 ? (
        <div className={cn(
          "grid gap-6 animate-fade-in",
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {sortedContacts.map((contact, index) => (
            <div 
              key={contact.id}
              className={getAnimationClasses({ 
                variant: "slide-up", 
                delay: index < 3 ? 
                  index === 0 ? "none" : 
                  index === 1 ? "short" : "medium" : "none",
              })}
            >
              <ContactCard {...contact} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/30 rounded-lg">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay contactos</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            No se encontraron contactos con los criterios de búsqueda actuales.
          </p>
          <Button>
            <Plus size={14} className="mr-2" />
            Crear nuevo contacto
          </Button>
        </div>
      )}
    </div>
  );
}
