import { GiftRecommendation } from "@/types/gift";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/apiClient";

interface GiftCardProps {
  gift: GiftRecommendation;
  eventDate?: string | Date;
  contactName?: string;
  showCategory?: boolean;
}

export function GiftCard({ gift, eventDate, contactName, showCategory = true }: GiftCardProps) {
  const { toast } = useToast();

  // Para gifts del backend (id numerico) pasamos por /gifts/{id}/track para
  // incrementar el click_count y luego redirigir 302 a Amazon con el tag.
  // Para gifts offline (id string) abrimos el affiliateLink directo.
  const isBackendGift = typeof gift.id === "number";
  const trackedHref = isBackendGift
    ? `${API_BASE_URL}/gifts/${gift.id}/track`
    : gift.affiliateLink;

  const handleClick = () => {
    toast({
      title: "¡Genial elección!",
      description: `Te estamos llevando a "${gift.title}" en Amazon.`,
      duration: 4000,
    });
  };

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      })
    : null;

  const displayName = contactName || gift.personName || "Desconocido";
  const hasLink = !!gift.affiliateLink || isBackendGift;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-2">{gift.title}</CardTitle>
          {showCategory && gift.category && (
            <Badge variant="outline" className="ml-2">
              {gift.category}
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {displayName}
        </CardDescription>
      </CardHeader>

      {gift.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={gift.imageUrl}
            alt={gift.title}
            className="w-full h-full object-contain p-2"
          />
        </div>
      )}

      <CardContent className="pt-4">
        <p className="mb-3">{gift.description}</p>
        <div className="flex justify-between items-center mt-4">
          <p className="font-bold text-lg">
            {typeof gift.price === 'number' ? `${gift.price.toFixed(2)}€` : 'Precio no disponible'}
          </p>
          {formattedDate && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {hasLink ? (
          <Button asChild className="w-full gap-2" onClick={handleClick}>
            <a
              href={trackedHref}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Ver en Amazon
            </a>
          </Button>
        ) : (
          <Button className="w-full gap-2" disabled>
            <ExternalLink className="h-4 w-4" />
            Sin enlace disponible
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
