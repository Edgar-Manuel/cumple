import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GiftCard } from "@/components/gifts/GiftCard";
import { Gift, Loader2 } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useContacts } from "@/hooks/useContacts";
import { giftsService } from "@/services/giftsService";
import { apiGiftToRecommendation } from "@/types/gift";
import type { GiftRecommendation } from "@/types/gift";
import type { ApiContact, ApiGift } from "@/types/api";

export default function Gifts() {
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const { data: contacts } = useContacts();

  const [selectedContact, setSelectedContact] = useState<string>("todos");

  const contactsById = useMemo(() => {
    const map = new Map<number, ApiContact>();
    contacts?.forEach((c) => map.set(c.id, c));
    return map;
  }, [contacts]);

  const eventIds = events?.map((e) => e.id) ?? [];

  const giftsQueries = useQueries({
    queries: eventIds.map((id) => ({
      queryKey: ["gifts", "event", id],
      queryFn: () => giftsService.listByEvent(id),
    })),
  });

  const isLoadingGifts = giftsQueries.some((q) => q.isLoading);

  const recommendations = useMemo(() => {
    const all: GiftRecommendation[] = [];
    giftsQueries.forEach((query, index) => {
      const gifts = query.data as ApiGift[] | undefined;
      if (!gifts) return;
      const event = events?.[index];
      if (!event) return;
      const contact = contactsById.get(event.contact_id);
      const personName = contact?.name ?? "Sin contacto";
      gifts.forEach((g) =>
        all.push(apiGiftToRecommendation(g, personName)),
      );
    });
    return all;
  }, [giftsQueries, events, contactsById]);

  const filteredRecommendations = useMemo(() => {
    if (selectedContact === "todos") return recommendations;
    return recommendations.filter((rec) => {
      const event = events?.find((e) => e.id === rec.eventId);
      if (!event) return false;
      return event.contact_id.toString() === selectedContact;
    });
  }, [recommendations, selectedContact, events]);

  const recommendationsByCategory = useMemo(() => {
    return filteredRecommendations.reduce(
      (acc, rec) => {
        const category = rec.category || "Otros";
        if (!acc[category]) acc[category] = [];
        acc[category].push(rec);
        return acc;
      },
      {} as Record<string, GiftRecommendation[]>,
    );
  }, [filteredRecommendations]);

  const categories = Object.keys(recommendationsByCategory);
  const isLoading = isLoadingEvents || isLoadingGifts;

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
                {contacts?.map((contact) => (
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Cargando recomendaciones...
            </p>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-gray-100 p-3 inline-block mb-4">
              <Gift className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No hay recomendaciones disponibles
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Para ver recomendaciones, primero crea contactos con intereses
              definidos y eventos próximos asociados a ellos. Luego puedes
              generar recomendaciones desde la página de cada evento.
            </p>
            <div className="mt-6">
              <Button variant="outline" asChild>
                <a href="/contacts">Crear contacto</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.length > 1 ? (
              <Tabs defaultValue={categories[0]} className="w-full">
                <TabsList className="mb-4">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendationsByCategory[category].map((gift) => {
                        const event = events?.find(
                          (e) => e.id === gift.eventId,
                        );
                        const contact = event
                          ? contactsById.get(event.contact_id)
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecommendations.map((gift) => {
                  const event = events?.find((e) => e.id === gift.eventId);
                  const contact = event
                    ? contactsById.get(event.contact_id)
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
      </main>
      <Footer />
    </div>
  );
}
