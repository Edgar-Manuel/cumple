import { EventProps } from "@/components/events/EventCard";
import { Contact } from "@/components/contacts/CreateContactDialog";
import { loadContacts, loadEvents } from "@/lib/storage";
import { GiftRecommendation } from "@/lib/AgentZeroService";

// Interfaz para evento extendido
interface ExtendedEventProps extends EventProps {
  contactId?: number | string;
  affinity?: number;
  howWeMet?: string;
  interests?: string;
  previousGifts?: string;
}

// Interfaz para categoría de interés
interface InterestCategory {
  name: string;
  keywords: string[];
  searchTerms: string[];
  priceRanges: {
    min: number;
    max: number;
  }[];
}

// Clase para servicio de recomendación de regalos personalizado
export class GiftRecommendationService {
  private static instance: GiftRecommendationService;
  private recommendations: Map<string | number, GiftRecommendation[]> = new Map();
  
  // Categorías de intereses mejoradas basadas en el análisis detallado
  private interestCategories: InterestCategory[] = [
    {
      name: "Lectura",
      keywords: ["lectura", "libros", "leer", "literatura", "novelas", "misterio", "poesía", "poesia", "cómics", "comics", "manga"],
      searchTerms: [
        "trilogía Carlos Ruiz Zafón",
        "colección novelas misterio",
        "libros edición especial",
        "soporte libros premium",
        "lámpara lectura ajustable",
        "estantería moderna libros",
      ],
      priceRanges: [
        { min: 80, max: 150 }
      ]
    },
    {
      name: "Senderismo",
      keywords: ["senderismo", "hiking", "trekking", "montaña", "montana", "naturaleza", "outdoor", "camping", "excursiones", "aventura"],
      searchTerms: [
        "botas Merrell Moab 3 Mid Waterproof",
        "bastones trekking telescópicos",
        "tienda Coleman dos personas",
        "chaqueta impermeable senderismo",
        "mochila hidratación trail",
        "GPS outdoor resistente agua"
      ],
      priceRanges: [
        { min: 80, max: 150 }
      ]
    },
    {
      name: "Cocina",
      keywords: ["cocina", "cocinar", "gastronomía", "gastronomia", "repostería", "reposteria", "chef", "recetas", "panadería", "panaderia"],
      searchTerms: [
        "procesador Moulinex multifunción",
        "juego cuchillos Wüsthof profesional",
        "robot cocina programable",
        "sartenes antiadherentes premium",
        "horno sobremesa convección",
        "báscula digital precisión cocina"
      ],
      priceRanges: [
        { min: 80, max: 150 }
      ]
    }
  ];

  private constructor() {}

  public static getInstance(): GiftRecommendationService {
    if (!GiftRecommendationService.instance) {
      GiftRecommendationService.instance = new GiftRecommendationService();
    }
    return GiftRecommendationService.instance;
  }

  /**
   * Genera recomendaciones de regalos personalizadas para un evento específico
   */
  public async generateRecommendations(eventId: string | number): Promise<GiftRecommendation[]> {
    // Verificar si ya tenemos recomendaciones para este evento
    if (this.recommendations.has(eventId)) {
      return this.recommendations.get(eventId) || [];
    }

    // Cargar información del evento
    const events = loadEvents<ExtendedEventProps>();
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      console.error(`No se encontró el evento con ID ${eventId}`);
      return [];
    }

    // Cargar contacto asociado al evento
    let contact: Contact | undefined;
    const contacts = loadContacts<Contact>();
    
    if (event.contactId) {
      contact = contacts.find(c => c.id === event.contactId);
    }

    // Generar recomendaciones basadas en intereses
    const recommendations = this.generatePersonalizedRecommendations(event, contact);
    
    // Guardar las recomendaciones para uso futuro
    this.recommendations.set(eventId, recommendations);
    
    return recommendations;
  }

  /**
   * Genera recomendaciones personalizadas basadas en intereses
   */
  private generatePersonalizedRecommendations(
    event: ExtendedEventProps, 
    contact?: Contact
  ): GiftRecommendation[] {
    const timestamp = Date.now();
    const recommendations: GiftRecommendation[] = [];
    
    // Determinar nivel de afinidad y rango de precios
    const affinity = event.affinity || 4; // Valor predeterminado de afinidad
    const minPrice = 80;
    const maxPrice = 150;
    
    // Obtener intereses
    const interests = event.interests || (contact?.interests || "");
    
    // Si no hay intereses definidos, agregar recomendaciones genéricas
    if (!interests.trim()) {
      return this.getGenericRecommendations(event, affinity, minPrice, maxPrice);
    }
    
    // Buscar categorías relevantes basadas en intereses
    const relevantCategories = this.findRelevantCategories(interests);
    
    // Generar recomendaciones para cada categoría relevante
    for (const category of relevantCategories) {
      // Seleccionar términos de búsqueda aleatorios para esta categoría
      const searchTerms = this.getRandomItems(category.searchTerms, 2);
      
      for (const term of searchTerms) {
        // Generar recomendación para este término
        const price = this.getRandomPrice(minPrice, maxPrice);
        const id = `gift-${timestamp}-${recommendations.length + 1}`;
        
        let recommendation: GiftRecommendation;
        
        // Crear recomendaciones específicas para cada categoría
        switch (category.name) {
          case "Lectura":
            if (term.includes("Carlos Ruiz Zafón")) {
              recommendation = {
                id,
                title: "La trilogía de la sombra by Carlos Ruiz Zafón",
                description: "Colección de misterio para amantes de la literatura española.",
                price: 80.00,
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/51QMZTfK8jL._SX320_BO1,204,203,200_.jpg",
                affiliateLink: "https://www.amazon.es/dp/B001234567?tag=cumple-21",
                eventId: event.id,
                personName: event.personName || (contact?.name || "Desconocido"),
                category: category.name,
                relevance: 0.95
              };
            } else {
              recommendation = {
                id,
                title: "Set de libros de misterio premium",
                description: "Colección especial de novelas de misterio de autores españoles reconocidos.",
                price: 95.00,
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/51KvCf9xOcL._SX320_BO1,204,203,200_.jpg",
                affiliateLink: "https://www.amazon.es/dp/B009876543?tag=cumple-21",
                eventId: event.id,
                personName: event.personName || (contact?.name || "Desconocido"),
                category: category.name,
                relevance: 0.9
              };
            }
            break;
            
          case "Senderismo":
            if (term.includes("Merrell")) {
              recommendation = {
                id,
                title: "Merrell Moab 3 Mid Waterproof hiking boots",
                description: "Botas impermeables y cómodas para tus aventuras de senderismo.",
                price: 120.00,
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71nUwb1a0mL._AC_UY695_.jpg",
                affiliateLink: "https://www.amazon.es/dp/B002345678?tag=cumple-21",
                eventId: event.id,
                personName: event.personName || (contact?.name || "Desconocido"),
                category: category.name,
                relevance: 0.95
              };
            } else if (term.includes("Coleman")) {
              recommendation = {
                id,
                title: "Coleman two-person tent",
                description: "Tienda de campaña fácil de montar, ideal para tus escapadas al aire libre.",
                price: 80.00,
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71IqJc6Zz4L._AC_SL1500_.jpg",
                affiliateLink: "https://www.amazon.es/dp/B005678901?tag=cumple-21",
                eventId: event.id,
                personName: event.personName || (contact?.name || "Desconocido"),
                category: category.name,
                relevance: 0.85
              };
            } else {
              recommendation = {
                id,
                title: "Set de bastones telescópicos para trekking",
                description: "Bastones ligeros y resistentes, ideales para cualquier ruta de montaña.",
                price: 89.99,
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71JgKgJmAjL._AC_SL1500_.jpg",
                affiliateLink: "https://www.amazon.es/dp/B008765432?tag=cumple-21",
                eventId: event.id,
                personName: event.personName || (contact?.name || "Desconocido"),
                category: category.name,
                relevance: 0.8
              };
            }
            break;
            
          case "Cocina":
            if (term.includes("Moulinex")) {
              recommendation = {
                id,
                title: "Moulinex food processor",
                description: "Ideal para ahorrar tiempo en la cocina, perfecto para tus recetas.",
                price: 100.00,
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71HXkIEcGzL._AC_SL1500_.jpg",
                affiliateLink: "https://www.amazon.es/dp/B003456789?tag=cumple-21",
                eventId: event.id,
                personName: event.personName || (contact?.name || "Desconocido"),
                category: category.name,
                relevance: 0.9
              };
            } else if (term.includes("Wüsthof")) {
              recommendation = {
                id,
                title: "Wüsthof knives set",
                description: "Juego de cuchillos de alta calidad para mejorar tu experiencia culinaria.",
                price: 150.00,
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71-mWkUEzFL._AC_SL1500_.jpg",
                affiliateLink: "https://www.amazon.es/dp/B004567890?tag=cumple-21",
                eventId: event.id,
                personName: event.personName || (contact?.name || "Desconocido"),
                category: category.name,
                relevance: 0.95
              };
            } else {
              recommendation = {
                id,
                title: "Set de utensilios de cocina premium",
                description: "Completo juego de utensilios para cocina profesional, fabricados en acero inoxidable.",
                price: 85.00,
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/71zyD4xB4yL._AC_SL1500_.jpg",
                affiliateLink: "https://www.amazon.es/dp/B007654321?tag=cumple-21",
                eventId: event.id,
                personName: event.personName || (contact?.name || "Desconocido"),
                category: category.name,
                relevance: 0.85
              };
            }
            break;
            
          default:
            recommendation = {
              id,
              title: term,
              description: this.generatePersonalizedDescription(term, event, contact),
              price,
              imageUrl: "https://via.placeholder.com/300",
              affiliateLink: `https://www.amazon.es/dp/B00${Math.floor(Math.random() * 10000000)}?tag=cumple-21`,
              eventId: event.id,
              personName: event.personName || (contact?.name || "Desconocido"),
              category: category.name,
              relevance: 0.7
            };
        }
        
        recommendations.push(recommendation);
      }
    }
    
    // Ordenar recomendaciones por relevancia
    return recommendations.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  }

  /**
   * Encuentra categorías de interés relevantes basadas en los intereses del contacto
   */
  private findRelevantCategories(interests: string): InterestCategory[] {
    const relevantCategories: InterestCategory[] = [];
    const lowerInterests = interests.toLowerCase();
    
    for (const category of this.interestCategories) {
      // Comprobar si alguna palabra clave coincide con los intereses
      const hasMatch = category.keywords.some(keyword => 
        lowerInterests.includes(keyword.toLowerCase())
      );
      
      if (hasMatch) {
        relevantCategories.push(category);
      }
    }
    
    // Si no hay categorías relevantes, devolver todas
    if (relevantCategories.length === 0) {
      return [...this.interestCategories];
    }
    
    return relevantCategories;
  }

  /**
   * Genera recomendaciones genéricas cuando no hay intereses específicos
   */
  private getGenericRecommendations(
    event: ExtendedEventProps, 
    affinity: number, 
    minPrice: number, 
    maxPrice: number
  ): GiftRecommendation[] {
    const timestamp = Date.now();
    const recommendations: GiftRecommendation[] = [];
    
    // Seleccionar categorías aleatorias
    const randomCategories = this.getRandomItems(this.interestCategories, 3);
    
    for (const category of randomCategories) {
      // Seleccionar términos de búsqueda aleatorios para esta categoría
      const searchTerm = this.getRandomItems(category.searchTerms, 1)[0];
      const price = this.getRandomPrice(minPrice, maxPrice);
      
      recommendations.push({
        id: `gift-${timestamp}-${recommendations.length + 1}`,
        title: searchTerm,
        description: this.generateGenericDescription(searchTerm, event),
        price,
        imageUrl: "https://via.placeholder.com/300",
        affiliateLink: `https://www.amazon.es/dp/B00${Math.floor(Math.random() * 10000000)}?tag=cumple-21`,
        eventId: event.id,
        personName: event.personName || "Desconocido",
        category: category.name,
        relevance: 0.6
      });
    }
    
    return recommendations;
  }

  /**
   * Genera una descripción personalizada para la recomendación
   */
  private generatePersonalizedDescription(
    searchTerm: string,
    event: ExtendedEventProps,
    contact?: Contact
  ): string {
    const personName = event.personName || (contact?.name || "esta persona");
    
    // Lista de plantillas de descripciones
    const templates = [
      `Perfecto para ${personName}, que disfruta de ${event.interests}. Este ${searchTerm} es ideal para su cumpleaños.`,
      `${personName} apreciará este ${searchTerm}, especialmente considerando su interés en ${event.interests}.`,
      `Basado en los intereses de ${personName}, este ${searchTerm} será un regalo práctico y duradero.`,
      `Un regalo que ${personName} no esperará, pero que se alineará perfectamente con su pasión por ${event.interests}.`,
      `Elegante y útil, este ${searchTerm} complementará perfectamente los intereses de ${personName} en ${event.interests}.`
    ];
    
    // Seleccionar una plantilla aleatoria
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Genera una descripción genérica para la recomendación
   */
  private generateGenericDescription(searchTerm: string, event: ExtendedEventProps): string {
    const personName = event.personName || "esta persona";
    
    // Lista de plantillas de descripciones
    const templates = [
      `Un regalo práctico y duradero para ${personName}. Este ${searchTerm} es una excelente opción para su cumpleaños.`,
      `${personName} apreciará este ${searchTerm}, un regalo elegante y de calidad.`,
      `Este ${searchTerm} es un regalo versátil y útil que ${personName} podrá disfrutar.`,
      `Una opción segura para sorprender a ${personName}, este ${searchTerm} es un regalo que no decepciona.`,
      `Un regalo moderno y funcional para ${personName}, este ${searchTerm} será muy apreciado.`
    ];
    
    // Seleccionar una plantilla aleatoria
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Obtiene elementos aleatorios de un array
   */
  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Genera un precio aleatorio dentro de un rango
   */
  private getRandomPrice(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }
}

// Instancia singleton del servicio de recomendaciones
export const giftRecommendationService = GiftRecommendationService.getInstance(); 