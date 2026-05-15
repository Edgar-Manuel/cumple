import { GiftRecommendation } from "@/lib/AgentZeroService";

// Recomendaciones fallback para cuando no se puede conectar con la API
export const fallbackRecommendations: GiftRecommendation[] = [
  {
    id: "gift-1",
    title: "Smartwatch último modelo con monitorización de salud",
    description: "La última tendencia en tecnología wearable. Perfecto regalo para quien valora estar conectado y mantenerse saludable. Incluye seguimiento de actividad física, sueño y más.",
    price: 129.99,
    imageUrl: "https://m.media-amazon.com/images/I/71JyFzKZBTL._AC_SL1500_.jpg",
    affiliateLink: "https://amazon.es/dp/B08DFPV5Y2?tag=cumple-21",
    eventId: "event-1",
    personName: "Gianella",
    category: "technology",
    relevance: 95
  },
  {
    id: "gift-2",
    title: "Set de cuidado facial premium con ingredientes naturales",
    description: "Una de las tendencias más populares de este año. Kit completo con productos para una rutina facial completa, con ingredientes orgánicos y veganos.",
    price: 49.99,
    imageUrl: "https://m.media-amazon.com/images/I/619FWbX1sjL._AC_SL1500_.jpg",
    affiliateLink: "https://amazon.es/dp/B07T1DJBP8?tag=cumple-21",
    eventId: "event-1",
    personName: "Gianella",
    category: "beauty",
    relevance: 90
  },
  {
    id: "gift-3",
    title: "Auriculares inalámbricos con cancelación de ruido",
    description: "Lo último en tendencias para amantes de la música. Disfruta de un sonido envolvente de alta fidelidad sin distracciones.",
    price: 89.99,
    imageUrl: "https://m.media-amazon.com/images/I/71F4JU7MZPL._AC_SL1500_.jpg",
    affiliateLink: "https://amazon.es/dp/B094C4VDJR?tag=cumple-21",
    eventId: "event-1",
    personName: "Gianella",
    category: "music",
    relevance: 88
  },
  {
    id: "gift-4",
    title: "Libro bestseller 2024 - Novela que está causando sensación",
    description: "El regalo más buscado ahora mismo para amantes de la lectura. Una historia cautivadora que no podrá dejar de leer.",
    price: 19.99,
    imageUrl: "https://m.media-amazon.com/images/I/81-QB7nDh4L._AC_SL1500_.jpg",
    affiliateLink: "https://amazon.es/dp/B09QFP3J4K?tag=cumple-21",
    eventId: "event-2",
    personName: "Juan",
    category: "books",
    relevance: 85
  },
  {
    id: "gift-5",
    title: "Set de coctelería profesional - 12 piezas",
    description: "La tendencia que está causando sensación entre entusiastas de la mixología. Kit completo para preparar cócteles gourmet en casa.",
    price: 39.99,
    imageUrl: "https://m.media-amazon.com/images/I/71FbF1J8MkL._AC_SL1500_.jpg",
    affiliateLink: "https://amazon.es/dp/B07F396TC2?tag=cumple-21",
    eventId: "event-2",
    personName: "Juan",
    category: "cooking",
    relevance: 82
  },
  {
    id: "gift-6",
    title: "Kit de jardinería para interiores - Cultivo de hierbas",
    description: "Una de las tendencias más populares de este año para entusiastas del hogar. Sistema completo para cultivar hierbas frescas en cualquier época del año.",
    price: 34.99,
    imageUrl: "https://m.media-amazon.com/images/I/71hCiNcR5xL._AC_SL1500_.jpg",
    affiliateLink: "https://amazon.es/dp/B08TM4GGZ3?tag=cumple-21",
    eventId: "event-3",
    personName: "María",
    category: "home",
    relevance: 80
  },
  {
    id: "gift-7",
    title: "Mochila de senderismo ultraligera - Última generación",
    description: "Lo último en tendencias para amantes de la aventura. Diseño ergonómico, impermeable y con múltiples compartimentos.",
    price: 59.99,
    imageUrl: "https://m.media-amazon.com/images/I/81mV+BzjpXL._AC_SL1500_.jpg",
    affiliateLink: "https://amazon.es/dp/B07YF3G5CC?tag=cumple-21",
    eventId: "event-3",
    personName: "María",
    category: "travel",
    relevance: 78
  },
  {
    id: "gift-8",
    title: "Reloj de pulsera edición exclusiva 2024",
    description: "Edición limitada que está marcando tendencia este 2024. Diseño elegante con materiales premium y funcionalidades avanzadas.",
    price: 149.99,
    imageUrl: "https://m.media-amazon.com/images/I/71GrFRV+9JL._AC_SL1500_.jpg",
    affiliateLink: "https://amazon.es/dp/B09DWSQ23P?tag=cumple-21",
    eventId: "event-3",
    personName: "María",
    category: "fashion",
    relevance: 75
  },
  {
    id: "gift-9",
    title: "Kit de pintura y arte - Edición profesional",
    description: "El producto de moda que todos quieren para despertar la creatividad. Incluye todos los materiales necesarios para crear obras de arte impresionantes.",
    price: 45.99,
    imageUrl: "https://m.media-amazon.com/images/I/71DkWx0+nNL._AC_SL1500_.jpg",
    affiliateLink: "https://amazon.es/dp/B083TFLMSP?tag=cumple-21",
    eventId: "event-4",
    personName: "Carlos",
    category: "hobby",
    relevance: 72
  },
  {
    id: "gift-10",
    title: "Equipo para entrenamiento en casa - Completo",
    description: "La novedad que está causando sensación entre entusiastas del fitness. Sistema compacto para entrenamientos completos sin salir de casa.",
    price: 79.99,
    imageUrl: "https://m.media-amazon.com/images/I/61FizF8J4GL._AC_SL1500_.jpg",
    affiliateLink: "https://amazon.es/dp/B08HM532GJ?tag=cumple-21",
    eventId: "event-4",
    personName: "Carlos",
    category: "sports",
    relevance: 70
  }
];

export default fallbackRecommendations; 