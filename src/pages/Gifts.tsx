import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { GiftRecommendation } from "@/lib/AgentZeroService";
import { giftRecommendationService } from "@/services/giftRecommendationService";
import { loadEvents, loadContacts } from "@/lib/storage";
import { EventProps } from "@/components/events/EventCard";
import { Contact } from "@/components/contacts/CreateContactDialog";
import { Gift } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAgentStatus } from "@/components/layout/AgentStatusProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GiftCard } from "@/components/gifts/GiftCard";

interface ExtendedEventProps extends EventProps {
  contactId?: number | string;
  affinity?: number;
  howWeMet?: string;
  interests?: string;
  previousGifts?: string;
}

export default function Gifts() {
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [events, setEvents] = useState<ExtendedEventProps[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { isConnected } = useAgentStatus();

  useEffect(() => {
    // Cargar eventos, contactos y recomendaciones al montar el componente
    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedEvents = loadEvents<ExtendedEventProps>();
        const loadedContacts = loadContacts<Contact>();
        setEvents(loadedEvents);
        setContacts(loadedContacts);
        
        // Obtener recomendaciones para todos los eventos
        const allRecommendations: GiftRecommendation[] = [];
        for (const event of loadedEvents) {
          // Solo generar recomendaciones para eventos con contacto y fecha
          if (event.contactId && event.date) {
            try {
              // Usar el nuevo servicio de recomendaciones personalizado
              const recs = await giftRecommendationService.generateRecommendations(event.id);
              allRecommendations.push(...recs);
            } catch (error) {
              console.error(`Error al generar recomendaciones para evento ${event.id}:`, error);
            }
          }
        }
        setRecommendations(allRecommendations);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las recomendaciones de regalos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleBuyGift = (gift: GiftRecommendation) => {
    // Abrir el enlace de afiliado en una nueva pestaña
    if (gift.affiliateLink) {
      window.open(gift.affiliateLink, '_blank');
      
      // Mostrar toast de confirmación
      toast({
        title: "¡Genial elección!",
        description: `Estás siendo redirigido a la página del producto "${gift.title}".`,
        duration: 5000,
      });
    }
  };

  const filteredRecommendations = selectedContact === "todos" 
    ? recommendations 
    : recommendations.filter(rec => {
        // Encontrar el evento relacionado con esta recomendación
        const event = events.find(e => e.id === rec.eventId);
        // Si no hay evento o no tiene contactId, no filtrar este regalo
        if (!event || !event.contactId) return true;
        // Filtrar basado en el contactId seleccionado
        return event.contactId.toString() === selectedContact;
      });

  // Organizar recomendaciones por categoría
  const recommendationsByCategory = filteredRecommendations.reduce((acc, rec) => {
    const category = rec.category || "Otros";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(rec);
    return acc;
  }, {} as Record<string, GiftRecommendation[]>);

  // Obtener categorías disponibles
  const categories = Object.keys(recommendationsByCategory);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="h-7 w-7" />
            Recomendaciones de Regalos
          </h1>
          
          <div className="flex items-center gap-4">
            <Select value={selectedContact} onValueChange={setSelectedContact}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las personas</SelectItem>
                {contacts.map(contact => (
                  <SelectItem key={contact.id} value={contact.id.toString()}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4">Cargando recomendaciones...</p>
          </div>
        ) : (
          <>
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-12">
                <div className="rounded-full bg-gray-100 p-3 inline-block mb-4">
                  <Gift className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No hay recomendaciones disponibles</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Para ver recomendaciones, primero crea contactos con intereses definidos y eventos próximos asociados a ellos.
                </p>
                <div className="mt-6">
                  <Button variant="outline" asChild>
                    <a href="/contacts">Crear contacto</a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.length > 1 && (
                  <Tabs defaultValue={categories[0]} className="w-full">
                    <TabsList className="mb-4">
                      {categories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {categories.map(category => (
                      <TabsContent key={category} value={category}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {recommendationsByCategory[category].map(gift => {
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
                                showCategory={false}
                              />
                            );
                          })}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
                
                {categories.length <= 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecommendations.map(gift => {
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
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
} 