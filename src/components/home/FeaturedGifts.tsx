import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { GiftCard } from "@/components/gifts/GiftCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUpcomingEvents } from "@/hooks/useEvents";
import { useContacts } from "@/hooks/useContacts";
import { giftsService } from "@/services/giftsService";
import { apiGiftToRecommendation } from "@/types/gift";
import type { GiftRecommendation } from "@/types/gift";

export function FeaturedGifts() {
  const navigate = useNavigate();
  const { data: events, isLoading: isLoadingEvents } = useUpcomingEvents(30);
  const { data: contacts } = useContacts();
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>(
    [],
  );
  const [isLoadingGifts, setIsLoadingGifts] = useState(false);

  useEffect(() => {
    if (!events) return;
    let cancelled = false;
    setIsLoadingGifts(true);

    (async () => {
      try {
        const all: GiftRecommendation[] = [];
        for (const event of events) {
          try {
            const gifts = await giftsService.listByEvent(event.id);
            const contact = contacts?.find((c) => c.id === event.contact_id);
            gifts.forEach((g) =>
              all.push(apiGiftToRecommendation(g, contact?.name ?? "")),
            );
          } catch {
            // Ignorar eventos sin regalos
          }
        }
        if (!cancelled) {
          const featured = all
            .sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0))
            .slice(0, 3);
          setRecommendations(featured);
        }
      } finally {
        if (!cancelled) setIsLoadingGifts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [events, contacts]);

  const isLoading = isLoadingEvents || isLoadingGifts;

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
            <p className="mt-2 text-sm text-gray-500">
              Cargando recomendaciones...
            </p>
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
            <p className="text-sm text-gray-500">
              No hay recomendaciones de regalos destacados disponibles.
            </p>
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
          {recommendations.map((gift) => {
            const event = events?.find((e) => e.id === gift.eventId);
            const contact = event
              ? contacts?.find((c) => c.id === event.contact_id)
              : undefined;
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
            <Button variant="outline" onClick={() => navigate("/gifts")}>
              Ver todos los regalos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
