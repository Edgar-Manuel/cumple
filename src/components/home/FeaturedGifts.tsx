import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { giftRecommendationService } from "@/services/giftRecommendationService";
import { GiftRecommendation } from "@/lib/AgentZeroService";
import { loadEvents, loadContacts } from "@/lib/storage";
import { EventProps } from "@/components/events/EventCard";
import { Contact } from "@/components/contacts/CreateContactDialog";
import { Gift } from "lucide-react";
import { GiftCard } from "@/components/gifts/GiftCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ExtendedEventProps extends EventProps {
  contactId?: number | string;
  affinity?: number;
  howWeMet?: string;
  interests?: string;
  previousGifts?: string;
}

export function FeaturedGifts() {
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadFeaturedGifts = async () => {
      setIsLoading(true);
      try {
        // Cargar eventos y contactos
        const events = loadEvents<ExtendedEventProps>();
        const contacts = loadContacts<Contact>();
        
        // Filtrar eventos próximos
        const upcomingEvents = events.filter(event => {
          const eventDate = new Date(event.date);
          const now = new Date();
          const oneMonthLater = new Date();
          oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
          
          return eventDate >= now && eventDate <= oneMonthLater;
        });
        
        // Obtener recomendaciones para eventos próximos
        const allRecommendations: GiftRecommendation[] = [];
        for (const event of upcomingEvents) {
          if (event.contactId && event.date) {
            try {
              const recs = await giftRecommendationService.generateRecommendations(event.id);
              allRecommendations.push(...recs);
            } catch (error) {
              console.error(`Error al generar recomendaciones para evento ${event.id}:`, error);
            }
          }
        }
        
        // Ordenar por relevancia y tomar las 3 mejores
        const featuredRecs = allRecommendations
          .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
          .slice(0, 3);
        
        setRecommendations(featuredRecs);
      } catch (error) {
        console.error("Error al cargar recomendaciones destacadas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeaturedGifts();
  }, []);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Regalos Destacados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-500">Cargando recomendaciones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Regalos Destacados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No hay recomendaciones de regalos destacados disponibles.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => navigate("/gifts")}
            >
              Ver todos los regalos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Cargar eventos y contactos para obtener información adicional
  const events = loadEvents<ExtendedEventProps>();
  const contacts = loadContacts<Contact>();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Regalos Destacados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {recommendations.map(gift => {
            const event = events.find(e => e.id === gift.eventId);
            const contact = event && event.contactId 
              ? contacts.find(c => c.id === event.contactId) 
              : null;
            
            return (
              <GiftCard 
                key={gift.id}
                gift={gift}
                eventDate={event?.date}
                contactName={contact?.name}
              />
            );
          })}
          
          <div className="text-center mt-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/gifts")}
            >
              Ver todos los regalos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 