import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GiftRecommendation } from "@/lib/AgentZeroService";
import { giftRecommendationService } from "@/services/giftRecommendationService";
import { loadEvents, loadContacts } from "@/lib/storage";
import { EventProps } from "@/components/events/EventCard";
import { Contact } from "@/components/contacts/CreateContactDialog";
import { GiftCard } from "@/components/gifts/GiftCard";
import { Gift, ArrowLeft, Calendar, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ExtendedEventProps extends EventProps {
  contactId?: number | string;
  affinity?: number;
  howWeMet?: string;
  interests?: string;
  previousGifts?: string;
}

export default function EventGifts() {
  const { eventId } = useParams<{ eventId: string }>();
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [event, setEvent] = useState<ExtendedEventProps | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEventData = async () => {
      setIsLoading(true);
      try {
        if (!eventId) {
          toast({
            title: "Error",
            description: "ID de evento no especificado",
            variant: "destructive"
          });
          navigate("/gifts");
          return;
        }

        // Cargar evento
        const events = loadEvents<ExtendedEventProps>();
        const foundEvent = events.find(e => e.id.toString() === eventId);
        
        if (!foundEvent) {
          toast({
            title: "Error",
            description: "Evento no encontrado",
            variant: "destructive"
          });
          navigate("/gifts");
          return;
        }
        
        setEvent(foundEvent);
        
        // Cargar contacto
        if (foundEvent.contactId) {
          const contacts = loadContacts<Contact>();
          const foundContact = contacts.find(c => c.id === foundEvent.contactId);
          if (foundContact) {
            setContact(foundContact);
          }
        }
        
        // Cargar recomendaciones
        const recs = await giftRecommendationService.generateRecommendations(foundEvent.id);
        setRecommendations(recs);
      } catch (error) {
        console.error("Error al cargar datos del evento:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las recomendaciones para este evento",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEventData();
  }, [eventId, navigate, toast]);
  
  // Formato de fecha
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4">Cargando recomendaciones...</p>
          </div>
        ) : (
          <>
            {event && (
              <div className="space-y-8">
                {/* Información del evento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{event.title}</CardTitle>
                    <CardDescription>
                      Recomendaciones de regalos para este evento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      
                      {contact && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{contact.name}</span>
                        </div>
                      )}
                      
                      {contact && contact.interests && (
                        <div className="md:col-span-2 mt-2">
                          <p className="text-sm font-medium">Intereses:</p>
                          <p className="text-sm text-gray-600">{contact.interests}</p>
                        </div>
                      )}
                      
                      {event.previousGifts && (
                        <div className="md:col-span-2 mt-2">
                          <p className="text-sm font-medium">Regalos anteriores:</p>
                          <p className="text-sm text-gray-600">{event.previousGifts}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recomendaciones de regalos */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Recomendaciones personalizadas
                  </h2>
                  
                  {recommendations.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay recomendaciones disponibles</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-4">
                          No se encontraron recomendaciones para este evento. Prueba a añadir más información sobre los intereses del contacto.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => navigate("/gifts")}
                        >
                          Ver todos los regalos
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendations.map(gift => (
                        <GiftCard
                          key={gift.id}
                          gift={gift}
                          eventDate={event.date}
                          contactName={contact?.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
} 