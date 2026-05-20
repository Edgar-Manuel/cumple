/**
 * Tipo unificado para tarjetas de recomendación de regalo en la UI.
 * Esta forma es la que consume `GiftCard` y similares, independiente
 * del servicio (API, IA u offline) que la genere.
 */
import type { ApiGift } from "@/types/api";

export interface GiftRecommendation {
  id: string | number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  affiliateLink: string;
  eventId: string | number;
  personName: string;
  category?: string;
  relevance?: number;
}

/**
 * Adapta un `ApiGift` del backend a la forma `GiftRecommendation` usada por la UI.
 */
export function apiGiftToRecommendation(
  gift: ApiGift,
  personName: string = "",
): GiftRecommendation {
  return {
    id: gift.id,
    title: gift.title,
    description: gift.description ?? "",
    price: gift.price ?? 0,
    imageUrl: gift.image_url ?? "",
    affiliateLink: gift.affiliate_link ?? "",
    eventId: gift.event_id,
    personName,
    category: gift.category,
    relevance: gift.relevance,
  };
}
