import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GiftCard } from "@/components/gifts/GiftCard";
import { Gift, ArrowLeft, Calendar, User, Loader2, Sparkles, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useEvent } from "@/hooks/useEvents";
import { useContact } from "@/hooks/useContacts";
import { useGiftsByEvent } from "@/hooks/useGifts";
import { useGenerateGiftRecommendations } from "@/hooks/useAI";
import { apiGiftToRecommendation } from "@/types/gift";
import { ApiClientError } from "@/lib/apiClient";

export default function EventGifts() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const eventIdNum = eventId ? parseInt(eventId, 10) : undefined;
  const validEventId = eventIdNum && !Number.isNaN(eventIdNum) ? eventIdNum : undefined;

  const { data: event, isLoading: isLoadingEvent, error: eventError } =
    useEvent(validEventId);
  const { data: contact } = useContact(event?.contact_id);
  const { data: gifts, isLoading: isLoadingGifts } = useGiftsByEvent(validEventId);
  const generateGifts = useGenerateGiftRecommendations();

  const recommendations = useMemo(() => {
    if (!gifts) return [];
    return gifts.map((g) => apiGiftToRecommendation(g, contact?.name ?? ""));
  }, [gifts, contact?.name]);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleGenerate = () => {
    if (!validEventId) return;
    generateGifts.mutate(
      { event_id: validEventId },
      {
        onSuccess: () => {
          toast({
            title: "Recomendaciones generadas",
            description:
              "Las nuevas recomendaciones se han añadido a este evento.",
          });
        },
        onError: (err) => {
          const description =
            err instanceof ApiClientError
              ? err.detail
              : "No se pudieron generar recomendaciones en este momento.";
          toast({
            title: "Error",
            description,
            variant: "destructive",
          });
        },
      },
    );
  };

  if (!validEventId) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p className="text-center text-destructive">
            ID de evento no válido.
          </p>
          <div className="text-center mt-4">
            <Button onClick={() => navigate("/gifts")}>Ver todos los regalos</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

        {isLoadingEvent ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Cargando evento...</p>
          </div>
        ) : eventError || !event ? (
          <div className="text-center py-12 bg-destructive/10 rounded-lg">
            <p className="text-destructive font-medium">
              No se pudo cargar el evento
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/gifts")}
            >
              Ver todos los regalos
            </Button>
          </div>
        ) : (
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

                  {contact?.interests && (
                    <div className="md:col-span-2 mt-2">
                      <p className="text-sm font-medium">Intereses:</p>
                      <p className="text-sm text-gray-600">
                        {contact.interests}
                      </p>
                    </div>
                  )}

                  {event.notes && (
                    <div className="md:col-span-2 mt-2">
                      <p className="text-sm font-medium">Notas:</p>
                      <p className="text-sm text-gray-600">{event.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recomendaciones de regalos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Recomendaciones personalizadas
                </h2>
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generateGifts.isPending}
                >
                  {generateGifts.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generar con IA
                </Button>
              </div>

              {isLoadingGifts ? (
                <div className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : recommendations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No hay recomendaciones aún
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-4">
                      Pulsa "Generar con IA" para crear recomendaciones
                      personalizadas basadas en los intereses del contacto.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>
                      Como afiliados de Amazon, ganamos una pequeña comisión por las
                      compras elegibles realizadas a través de estos enlaces. El precio
                      para ti no cambia.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((gift) => (
                      <GiftCard
                        key={gift.id}
                        gift={gift}
                        eventDate={event.date}
                        contactName={contact?.name}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
