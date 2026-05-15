import type { GiftRecommendation } from '@/lib/AgentZeroService';

// Productos de ejemplo para usar como fallback cuando falla la API de Google
// Nota: eventId y personName se añadirán dinámicamente cuando se usen estos productos
export const mockProducts: Partial<GiftRecommendation>[] = [
  {
    id: "mock-1",
    title: "Set de Regalo Premium",
    description: "Un detalle elegante y versátil para celebrar el evento especial.",
    price: 49.99,
    imageUrl: "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600",
    affiliateLink: "https://www.amazon.es/s?k=set+regalo+premium&tag=cumple-21",
    category: "general",
    relevance: 95
  },
  {
    id: "mock-2",
    title: "Caja Sorpresa Personalizada",
    description: "Una caja llena de pequeños detalles personalizados que harán sonreír a esa persona especial.",
    price: 39.99,
    imageUrl: "https://images.pexels.com/photos/264771/pexels-photo-264771.jpeg?auto=compress&cs=tinysrgb&w=600",
    affiliateLink: "https://www.amazon.es/s?k=caja+regalo+personalizada&tag=cumple-21",
    category: "general",
    relevance: 90
  },
  {
    id: "mock-3",
    title: "Smartwatch Multifunción",
    description: "El complemento perfecto para quienes buscan tecnología y estilo en su día a día.",
    price: 129.99,
    imageUrl: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600",
    affiliateLink: "https://www.amazon.es/s?k=smartwatch&tag=cumple-21",
    category: "technology",
    relevance: 88
  },
  {
    id: "mock-4",
    title: "Experiencia Gastronómica",
    description: "Un regalo para disfrutar con todos los sentidos, ideal para los amantes de la buena cocina.",
    price: 89.99,
    imageUrl: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600",
    affiliateLink: "https://www.amazon.es/s?k=experiencia+gastronomica+regalo&tag=cumple-21",
    category: "cooking",
    relevance: 85
  },
  {
    id: "mock-5",
    title: "Altavoz Bluetooth Portátil",
    description: "Música de alta calidad en cualquier lugar y momento, con un diseño elegante y compacto.",
    price: 59.99,
    imageUrl: "https://images.pexels.com/photos/164866/pexels-photo-164866.jpeg?auto=compress&cs=tinysrgb&w=600",
    affiliateLink: "https://www.amazon.es/s?k=altavoz+bluetooth+portatil&tag=cumple-21",
    category: "music",
    relevance: 82
  }
]; 