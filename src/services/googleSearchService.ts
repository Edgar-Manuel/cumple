import axios from 'axios';
import { mockProducts } from '@/lib/mockProducts';
import type { GiftRecommendation } from '@/lib/AgentZeroService';
import type { EventProps } from '@/components/events/EventCard';
import type { Contact } from '@/components/contacts/CreateContactDialog';
import { fallbackRecommendations } from "./fallbackRecommendations";

interface GoogleSearchApiResponse {
  items: Array<{
    title: string;
    link: string;
    snippet: string;
    pagemap?: {
      offer?: Array<{
        price?: string;
        image?: string;
      }>;
      cse_image?: Array<{
        src: string;
      }>;
      product?: Array<{
        image?: string;
        name?: string;
      }>;
    };
  }>;
}

// Categorías para clasificar los regalos
const GIFT_CATEGORIES = [
  'technology', 'books', 'cooking', 'travel', 'sports', 'fashion', 'home', 'beauty', 'music', 'hobby'
];

// Mapa de imágenes por categoría (fallback)
const CATEGORY_IMAGES: Record<string, string> = {
  technology: 'https://m.media-amazon.com/images/I/71JyFzKZBTL._AC_SL1500_.jpg',
  books: 'https://m.media-amazon.com/images/I/81-QB7nDh4L._AC_SL1500_.jpg',
  cooking: 'https://m.media-amazon.com/images/I/71FbF1J8MkL._AC_SL1500_.jpg',
  travel: 'https://m.media-amazon.com/images/I/81mV+BzjpXL._AC_SL1500_.jpg',
  sports: 'https://m.media-amazon.com/images/I/61FizF8J4GL._AC_SL1500_.jpg',
  fashion: 'https://m.media-amazon.com/images/I/71GrFRV+9JL._AC_SL1500_.jpg',
  home: 'https://m.media-amazon.com/images/I/71hCiNcR5xL._AC_SL1500_.jpg',
  beauty: 'https://m.media-amazon.com/images/I/619FWbX1sjL._AC_SL1500_.jpg',
  music: 'https://m.media-amazon.com/images/I/71F4JU7MZPL._AC_SL1500_.jpg',
  hobby: 'https://m.media-amazon.com/images/I/71DkWx0+nNL._AC_SL1500_.jpg',
  premium: 'https://m.media-amazon.com/images/I/81tSFbPpnQL._AC_SL1500_.jpg'
};

// Constante con la clave API de Google y el Search Engine ID
// Claves temporales para pruebas - ACTUALIZAR con claves propias
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';
const GOOGLE_SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '000888210889775888983:pqb3ch1ewhg';
const AMAZON_AFFILIATE_TAG = import.meta.env.VITE_AMAZON_AFFILIATE_TAG || 'cumple-21';

// Clase para el servicio de búsqueda de Google
class GoogleSearchService {
  private apiKey: string;
  private searchEngineId: string;
  private useOfflineMode: boolean;
  private affiliateTag: string;

  constructor(apiKey?: string, searchEngineId?: string, affiliateTag?: string) {
    this.apiKey = apiKey || GOOGLE_API_KEY;
    this.searchEngineId = searchEngineId || GOOGLE_SEARCH_ENGINE_ID;
    this.affiliateTag = affiliateTag || AMAZON_AFFILIATE_TAG;
    
    // Permitir el uso de la API si hay credenciales
    this.useOfflineMode = !this.apiKey || !this.searchEngineId;
    
    if (this.useOfflineMode) {
      console.warn('GoogleSearchService: Usando modo offline con datos precargados porque faltan credenciales');
    } else {
      console.log('GoogleSearchService: Configurado con API key de Google Search');
    }
  }

  // Función para verificar si un enlace es válido
  private async verifyLink(url: string): Promise<boolean> {
    try {
      // Usar axios para hacer una petición HEAD al enlace
      const response = await axios.head(url, {
        timeout: 3000, // Timeout de 3 segundos
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Si la respuesta es 200, el enlace es válido
      return response.status === 200;
    } catch (error) {
      // Si hay un error, el enlace no es válido
      console.error(`Error al verificar enlace ${url}:`, error);
      return false;
    }
  }

  // Función para formatear enlaces de Amazon
  private formatAmazonLink(link?: string): string | undefined {
    if (!link) return undefined;
    
    try {
      // Si ya es una URL válida, asegurarnos que tenga el formato correcto
      if (link.includes('amazon')) {
        // Extraer el ASIN (ID de producto de Amazon)
        const asinMatch = link.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
        if (asinMatch && asinMatch[1]) {
          const asin = asinMatch[1];
          
          // Determinar si es amazon.es o amazon.com
          const domain = link.includes('amazon.es') ? 'amazon.es' : 'amazon.com';
          
          // Construir un enlace limpio con el ASIN
          return `https://www.${domain}/dp/${asin}?tag=${this.affiliateTag}`;
        }
      }
      
      // Si no pudimos extraer un ASIN pero es un enlace de Amazon, devolverlo tal cual
      if (link.includes('amazon')) {
        return link;
      }
      
      return link;
    } catch (error) {
      console.error("Error al formatear enlace de Amazon:", error);
      return link;
    }
  }

  /**
   * Genera recomendaciones de regalos para un evento específico
   */
  async generateGiftRecommendations(
    event: EventProps, 
    contact?: Contact
  ): Promise<GiftRecommendation[]> {
    try {
      // Si estamos en modo offline, usar directamente recomendaciones precargadas
      if (this.useOfflineMode) {
        console.log('GoogleSearchService: Modo offline, usando recomendaciones precargadas');
        return this.getOfflineRecommendations(event);
      }
      
      // Si tenemos credenciales, intentar usar la API de Google
      const interests = contact?.interests || '';
      const personName = event.personName || 'una persona especial';
      const eventType = event.type || 'cumpleaños';
      
      // Construir la consulta de búsqueda con énfasis en tendencias actuales
      let query = `últimas tendencias regalos ${new Date().getFullYear()} ${eventType} de ${personName}`;
      
      // Añadir intereses específicos si están disponibles
      if (interests) {
        query += ` intereses: ${interests}`;
      }
      
      // Añadir términos que impulsen la búsqueda de productos nuevos y de moda
      query += ' productos novedosos actuales tendencia';
      
      console.log(`GoogleSearchService: Buscando tendencias: "${query}"`);
      
      // Realizar la búsqueda en Google
      const searchResults = await this.performGoogleSearch(query);
      
      if (!searchResults?.items?.length) {
        console.warn('No se encontraron resultados, usando recomendaciones precargadas');
        return this.getOfflineRecommendations(event);
      }
      
      // Transformar los resultados en recomendaciones de regalos
      const recommendations = this.transformSearchResultsToRecommendations(
        searchResults.items,
        event,
        personName
      );
      
      return recommendations;
    } catch (error) {
      console.error('Error generando recomendaciones con Google Search:', error);
      return this.getOfflineRecommendations(event);
    }
  }

  /**
   * Realiza una búsqueda en Google usando la API Custom Search
   */
  private async performGoogleSearch(query: string): Promise<GoogleSearchApiResponse> {
    try {
      console.log(`GoogleSearchService: Intentando búsqueda con API key ${this.apiKey.substring(0, 5)}...`);
      
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('cx', this.searchEngineId);
      url.searchParams.append('q', query);
      
      // Añadir opciones para mejorar resultados de productos
      url.searchParams.append('num', '10'); // Más resultados
      url.searchParams.append('gl', 'es'); // Geolocalización España
      url.searchParams.append('hl', 'es'); // Idioma español
      
      console.log(`GoogleSearchService: URL de búsqueda: ${url.toString()}`);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Aumentar timeout para evitar problemas de red
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Error en la API de Google (${response.status}): ${errorData}`);
        
        // Información detallada para errores específicos
        if (response.status === 403) {
          console.error("Error 403 Forbidden: Problema con la clave API (permisos insuficientes, cuota excedida o clave inválida)");
          console.error("Verifique que la clave API esté configurada correctamente y tenga la API Custom Search habilitada");
          console.error("También compruebe que no se haya excedido la cuota gratuita (100 solicitudes/día)");
        } else if (response.status === 429) {
          console.error("Error 429 Too Many Requests: Se ha excedido el límite de solicitudes");
        }
        
        throw new Error(`Error en la API de Google: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`GoogleSearchService: Búsqueda exitosa, ${data.items?.length || 0} resultados encontrados`);
      
      return data;
    } catch (error) {
      console.error('Error en la búsqueda de Google:', error);
      
      // Proporcionar información más específica sobre el error para facilitar la depuración
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Error de red al conectar con la API de Google. Verifique su conexión a Internet.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        console.error('La solicitud a la API de Google expiró. La API podría estar experimentando problemas o su conexión es lenta.');
      }
      
      throw error;
    }
  }

  /**
   * Transforma los resultados de la búsqueda en recomendaciones estructuradas
   */
  private transformSearchResultsToRecommendations(
    items: GoogleSearchApiResponse['items'],
    event: EventProps,
    personName: string
  ): GiftRecommendation[] {
    return items.slice(0, 5).map((item, index) => {
      // Extraer precio si está disponible
      const price = this.extractPrice(item) || (19.99 + (index * 10));
      
      // Extraer o generar categoría
      const category = this.categorizeGift(item.title, item.snippet);
      
      // Generar un ID único basado en timestamp y índice
      const timestamp = Date.now();
      const id = `gift-${timestamp}-${index + 1}`;
      
      // Generar enlace de afiliado
      const affiliateLink = this.generateAffiliateLink(item.link);
      
      // Extraer o asignar imagen - ahora extraemos la imagen después del enlace de afiliado
      // para poder usar el ASIN en caso necesario
      const imageUrl = this.extractImageUrl(item, category);
      
      // Generar la descripción enriquecida
      const description = this.generateDescription(item.snippet, personName, category);
      
      return {
        id,
        title: item.title.substring(0, 80),
        description,
        price,
        imageUrl,
        affiliateLink,
        eventId: event.id,
        personName,
        category,
        relevance: 95 - (index * 5) // Asignar relevancia decreciente
      };
    });
  }

  /**
   * Extrae la URL de la imagen del resultado de búsqueda
   */
  private extractImageUrl(
    item: GoogleSearchApiResponse['items'][0], 
    category: string
  ): string {
    // Primero, verificar si hay una imagen en los resultados
    if (item.pagemap?.cse_image?.[0]?.src) {
      const imageUrl = item.pagemap.cse_image[0].src;
      
      // Limpieza y mejora de URLs de imágenes de Amazon
      if (imageUrl.includes('amazon')) {
        // Intentar extraer el ASIN
        const asinMatch = imageUrl.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
        
        if (asinMatch && asinMatch[1]) {
          const asin = asinMatch[1];
          
          // Intentar construir una URL mejor basada en el ASIN
          // Usar formato de alta calidad y tamaño grande
          return `https://m.media-amazon.com/images/I/${asin}._AC_SL500_.jpg`;
        }
        
        // Si no pudimos extraer un ASIN pero es una imagen de Amazon, mejorar la URL
        if (imageUrl.includes('._')) {
          // Es una URL de Amazon con un formato específico, intentar mejorarla
          return imageUrl.replace(/\._.*?_\./, '._AC_SL500_.');
        }
      }

      // Si la imagen viene de otro sitio que no sea Amazon, verificar sitios comunes
      if (imageUrl.includes('cloudfront.net') || 
          imageUrl.includes('googleapis.com') || 
          imageUrl.includes('gstatic.com')) {
        // Estos dominios suelen tener parámetros para el tamaño de la imagen
        // Intenta mejorar la calidad añadiendo parámetros si no existen
        if (!imageUrl.includes('=s') && !imageUrl.includes('=w')) {
          if (imageUrl.includes('?')) {
            return `${imageUrl}&w=500`;
          } else {
            return `${imageUrl}?w=500`;
          }
        }
      }
      
      // Si es una imagen de producto de otros sitios conocidos
      if (imageUrl.includes('product') || 
          imageUrl.includes('items') || 
          imageUrl.includes('goods') ||
          imageUrl.includes('img')) {
        // Probablemente sea una imagen de producto, usarla tal cual
        return imageUrl;
      }
      
      // En otros casos, usar la URL tal como viene
      return imageUrl;
    }
    
    // Intentar con otras fuentes de imágenes del resultado
    if (item.pagemap?.product?.[0]?.image) {
      return item.pagemap.product[0].image;
    }
    
    if (item.pagemap?.offer?.[0]?.image) {
      return item.pagemap.offer[0].image;
    }
    
    // Si no hay una imagen adecuada en los resultados, usar un placeholder según la categoría
    return CATEGORY_IMAGES[category] || 'https://m.media-amazon.com/images/I/71JyFzKZBTL._AC_SL1500_.jpg';
  }

  /**
   * Genera un enlace de afiliado para Amazon
   */
  private generateAffiliateLink(originalLink: string): string {
    try {
      // Comprueba si es un enlace de Amazon
      if (originalLink.includes('amazon.')) {
        // Extraer el ASIN/ID del producto si es posible
        const asinMatch = originalLink.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
        if (asinMatch && asinMatch[1]) {
          const asin = asinMatch[1];
          // Usar amazon.es para mercado español
          return `https://www.amazon.es/dp/${asin}?tag=${this.affiliateTag}`;
        }
        
        // Si no podemos extraer el ASIN pero es un enlace con /dp/ o /gp/product/
        const dpMatch = originalLink.match(/\/dp\/([A-Z0-9]+)/);
        const gpMatch = originalLink.match(/\/gp\/product\/([A-Z0-9]+)/);
        
        if (dpMatch && dpMatch[1]) {
          return `https://www.amazon.es/dp/${dpMatch[1]}?tag=${this.affiliateTag}`;
        }
        
        if (gpMatch && gpMatch[1]) {
          return `https://www.amazon.es/gp/product/${gpMatch[1]}?tag=${this.affiliateTag}`;
        }
        
        // Si no podemos extraer un identificador claro, añadir el tag al enlace original
        if (originalLink.includes('?')) {
          return `${originalLink}&tag=${this.affiliateTag}`;
        } else {
          return `${originalLink}?tag=${this.affiliateTag}`;
        }
      }
      
      // Si es algún otro sitio que no sea Amazon, intentar generar un enlace de búsqueda en Amazon
      const searchTerm = encodeURIComponent(
        originalLink.split('/').pop() || 
        originalLink.replace(/^(https?:\/\/)?(www\.)?[^\/]+\//, '') ||
        'gift'
      );
      
      return `https://www.amazon.es/s?k=${searchTerm}&tag=${this.affiliateTag}`;
    } catch (error) {
      console.error('Error al generar enlace de afiliado:', error);
      // En caso de error, devolver un enlace seguro a Amazon
      return `https://www.amazon.es?tag=${this.affiliateTag}`;
    }
  }

  /**
   * Extrae el precio del resultado de búsqueda
   */
  private extractPrice(item: GoogleSearchApiResponse['items'][0]): number | null {
    try {
      if (item.pagemap?.offer?.[0]?.price) {
        const priceStr = item.pagemap.offer[0].price.replace(/[^\d.,]/g, '').replace(',', '.');
        return parseFloat(priceStr);
      }
      
      // Buscar patrones de precio en el snippet o título
      const pricePattern = /(\d+[.,]\d+)\s*(€|\$|EUR)/;
      const matchSnippet = item.snippet.match(pricePattern);
      const matchTitle = item.title.match(pricePattern);
      
      if (matchSnippet) {
        return parseFloat(matchSnippet[1].replace(',', '.'));
      }
      
      if (matchTitle) {
        return parseFloat(matchTitle[1].replace(',', '.'));
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Categoriza el regalo basado en su título y descripción
   */
  private categorizeGift(title: string, description: string): string {
    const text = (title + ' ' + description).toLowerCase();
    
    // Palabras clave por categoría con términos actualizados de tendencias
    const categoryKeywords: Record<string, string[]> = {
      technology: ['tech', 'gadget', 'electrónica', 'digital', 'smart', 'dispositivo', 'ordenador', 'móvil', 'tablet', 'último modelo', 'innovación', 'nueva generación', 'inteligente', 'tecnología avanzada', 'conectividad', 'wireless', 'bluetooth', 'pantalla'],
      books: ['libro', 'lectura', 'novela', 'literatura', 'autor', 'saga', 'publicación', 'bestseller', 'audiolibro', 'kindle', 'e-reader', 'más vendido', 'edición especial', 'escritor', 'narrativa', 'bestseller'],
      cooking: ['cocina', 'culinario', 'chef', 'receta', 'gourmet', 'gastronomía', 'alimento', 'sostenible', 'orgánico', 'air fryer', 'slow cooker', 'thermomix', 'smart kitchen', 'keto', 'vegano', 'kit'],
      travel: ['viaje', 'aventura', 'mochila', 'maleta', 'destino', 'turismo', 'vacaciones', 'equipaje inteligente', 'plegable', 'ultraligero', 'antirrobo', 'impermeable', 'transpirable', 'ergonómico', 'outdoor'],
      sports: ['deporte', 'fitness', 'entrenamiento', 'gimnasio', 'atlético', 'ejercicio', 'smartwatch', 'wearable', 'monitorización', 'rendimiento', 'cross training', 'hiit', 'deporte en casa', 'eléctrico', 'resistencia'],
      fashion: ['moda', 'ropa', 'accesorio', 'vestir', 'calzado', 'estilo', 'colección', 'temporada', 'diseñador', 'sostenible', 'vintage', 'exclusivo', 'ecológico', 'premium', 'limited edition', 'colaboración', 'tendencia'],
      home: ['hogar', 'casa', 'decoración', 'mueble', 'jardín', 'cocina', 'baño', 'inteligente', 'domótica', 'conectado', 'purificador', 'ecológico', 'multifuncional', 'ahorro energético', 'smartheater'],
      beauty: ['belleza', 'cosmético', 'maquillaje', 'skincare', 'perfume', 'cuidado', 'limpieza facial', 'orgánico', 'vegano', 'natural', 'sin tóxicos', 'coreano', 'hidratante', 'antiedad', 'serum', 'premium'],
      music: ['música', 'instrumento', 'audio', 'sonido', 'altavoz', 'auriculares', 'bluetooth', 'noise cancelling', 'inalámbrico', 'hifi', 'estudio', 'vinilo', 'dj', 'premium', 'alta fidelidad', 'bass'],
      hobby: ['hobby', 'afición', 'coleccionismo', 'juego', 'pasatiempo', 'arte', 'manualidad', 'kit', 'vintage', 'puzzle', 'retro', 'gaming', 'vr', 'realidad virtual', 'impresión 3d', 'drone', 'diy']
    };
    
    // Añadir categoría para tendencias generales
    categoryKeywords['trending'] = ['tendencia', 'popular', 'viral', 'trendy', 'de moda', 'lo último', 'novedad', 'éxito', 'innovador', 'exclusivo', 'limitado', 'sensación', 'influencer', 'social media', 'bestseller', 'must have', '2024', 'nueva temporada'];
    
    // Determinar la categoría por coincidencia de palabras clave
    let bestCategory = 'trending'; // Por defecto ahora usamos 'trending' como categoría por defecto
    let highestMatches = 0;
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > highestMatches) {
        highestMatches = matches;
        bestCategory = category;
      }
    }
    
    return bestCategory;
  }

  /**
   * Genera una descripción personalizada para la recomendación
   */
  private generateDescription(
    snippet: string, 
    personName: string, 
    category: string
  ): string {
    // Frases relacionadas con tendencias para incorporar en la descripción
    const trendPhrases = [
      "Una de las tendencias más populares de este año",
      "Lo último en tendencias actuales",
      "El regalo más buscado ahora mismo",
      "Un must-have de esta temporada",
      "La última tendencia del mercado",
      "El producto de moda que todos quieren",
      "La novedad que está causando sensación"
    ];
    
    // Seleccionar aleatoriamente una frase de tendencia
    const trendPhrase = trendPhrases[Math.floor(Math.random() * trendPhrases.length)];
    
    // Si el snippet es suficientemente largo, incorporarlo con la frase de tendencia
    if (snippet.length > 100) {
      return `${trendPhrase} para ${personName}, que disfruta de ${this.getCategoryDescription(category)}. ${snippet.substring(0, 120)}`;
    }
    
    // Plantillas para descripciones generadas, incorporando tendencias
    const templates = [
      `${trendPhrase} perfecto para ${personName}, que disfruta de ${this.getCategoryDescription(category)}. Este año es el regalo más destacado en su categoría.`,
      `Ideal para ${personName}, amante de ${this.getCategoryDescription(category)}. ${trendPhrase} que no puede faltar en su colección.`,
      `${trendPhrase}! Excelente para ${personName}, que disfruta de ${this.getCategoryDescription(category)}. Un regalo innovador con el mejor diseño.`,
      `Lo último en tendencias para sorprender a ${personName}, que adora ${this.getCategoryDescription(category)}. Un regalo que está marcando tendencia este ${new Date().getFullYear()}.`
    ];
    
    // Seleccionar aleatoriamente una plantilla
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  /**
   * Devuelve una descripción textual para una categoría
   */
  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      technology: 'la tecnología de última generación y dispositivos innovadores',
      books: 'la lectura y los bestsellers actuales',
      cooking: 'experimentar con las últimas tendencias gastronómicas',
      travel: 'viajar y descubrir nuevos lugares con los accesorios más avanzados',
      sports: 'el fitness y los gadgets deportivos de esta temporada',
      fashion: 'la moda actual y las prendas exclusivas de temporada',
      home: 'decorar y mejorar su hogar con las últimas innovaciones',
      beauty: 'los productos de belleza premium y las rutinas de moda',
      music: 'la música y el audio de alta calidad con tecnología puntera',
      hobby: 'sus pasatiempos con los kits y equipos más novedosos',
      premium: 'los productos exclusivos y ediciones limitadas de lujo',
      trending: 'estar siempre al día con las últimas tendencias del mercado'
    };
    
    return descriptions[category] || 'descubrir las últimas tendencias del mercado';
  }

  /**
   * Obtiene recomendaciones precargadas para modo offline
   */
  public getOfflineRecommendations(event: EventProps): GiftRecommendation[] {
    // Filtrar recomendaciones por nombre de persona si está disponible
    let filteredRecs = fallbackRecommendations;
    
    if (event.personName) {
      // Intentar encontrar recomendaciones para esta persona
      const personRecs = fallbackRecommendations.filter(
        rec => rec.personName?.toLowerCase() === event.personName?.toLowerCase()
      );
      
      // Si encontramos al menos 3, usamos esas
      if (personRecs.length >= 3) {
        filteredRecs = personRecs;
      }
    }
    
    // Seleccionar aleatoriamente 5 recomendaciones
    const shuffled = [...filteredRecs].sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 5);
    
    // Si no tenemos suficientes recomendaciones específicas, completar con productos mock
    if (selected.length < 5) {
      const remainingCount = 5 - selected.length;
      const additionalProducts = this.getEnhancedMockProducts(remainingCount, event.personName || 'Usuario');
      selected = [...selected, ...additionalProducts];
    }
    
    // Mejorar las imágenes de los productos seleccionados
    selected = selected.map(rec => this.enhanceProductImage(rec));
    
    // Actualizar los IDs y eventIds para que sean únicos y correspondan al evento actual
    return selected.map((rec: GiftRecommendation, index) => ({
      ...rec,
      id: `gift-${Date.now()}-${index + 1}`,
      eventId: event.id,
      personName: event.personName || rec.personName // Asegurarnos de usar el nombre del evento
    }));
  }
  
  /**
   * Mejora la imagen de un producto seleccionando una imagen de mejor calidad
   */
  private enhanceProductImage(recommendation: GiftRecommendation): GiftRecommendation {
    // Si ya tiene una buena imagen, la dejamos
    if (recommendation.imageUrl && 
        !recommendation.imageUrl.includes('placeholder') && 
        !recommendation.imageUrl.includes('default')) {
      return recommendation;
    }
    
    // Imágenes mejoradas según la categoría
    const highQualityImages: Record<string, string[]> = {
      technology: [
        'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/306763/pexels-photo-306763.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/129208/pexels-photo-129208.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      books: [
        'https://images.pexels.com/photos/256431/pexels-photo-256431.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2846814/pexels-photo-2846814.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      cooking: [
        'https://images.pexels.com/photos/4259140/pexels-photo-4259140.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/4259707/pexels-photo-4259707.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3566120/pexels-photo-3566120.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      travel: [
        'https://images.pexels.com/photos/1170187/pexels-photo-1170187.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2315274/pexels-photo-2315274.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      sports: [
        'https://images.pexels.com/photos/260409/pexels-photo-260409.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/6538876/pexels-photo-6538876.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/5615689/pexels-photo-5615689.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3621185/pexels-photo-3621185.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      fashion: [
        'https://images.pexels.com/photos/932401/pexels-photo-932401.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1229177/pexels-photo-1229177.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      home: [
        'https://images.pexels.com/photos/279610/pexels-photo-279610.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/6707577/pexels-photo-6707577.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      beauty: [
        'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2697786/pexels-photo-2697786.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3321416/pexels-photo-3321416.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      music: [
        'https://images.pexels.com/photos/3994816/pexels-photo-3994816.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/7233957/pexels-photo-7233957.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/744318/pexels-photo-744318.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      hobby: [
        'https://images.pexels.com/photos/952478/pexels-photo-952478.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/5723328/pexels-photo-5723328.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/791810/pexels-photo-791810.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      general: [
        'https://images.pexels.com/photos/264771/pexels-photo-264771.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/6707577/pexels-photo-6707577.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3266700/pexels-photo-3266700.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1586353/pexels-photo-1586353.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    };
    
    // Seleccionar una imagen aleatoria para la categoría del producto
    const category = recommendation.category?.toLowerCase() || 'general';
    const categoryImages = highQualityImages[category] || highQualityImages.general;
    const randomIndex = Math.floor(Math.random() * categoryImages.length);
    
    return {
      ...recommendation,
      imageUrl: categoryImages[randomIndex]
    };
  }
  
  /**
   * Obtiene productos mejorados con imágenes de alta calidad
   */
  private getEnhancedMockProducts(count: number, personName: string): GiftRecommendation[] {
    // Definir productos premium con imágenes de alta calidad
    const premiumProducts: Array<Required<Pick<GiftRecommendation, 'title' | 'description' | 'price' | 'imageUrl' | 'category' | 'relevance'>>> = [
      {
        title: "Smartwatch de alta precisión",
        description: `El regalo perfecto para ${personName}, ideal para monitorizar actividad física y mantener un estilo elegante. La última tendencia en tecnología wearable con funciones avanzadas.`,
        price: 149.99,
        imageUrl: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "technology",
        relevance: 92
      },
      {
        title: "Auriculares inalámbricos con cancelación de ruido",
        description: `Perfectos para ${personName}, que disfruta de la música con la mejor calidad de sonido. Tecnología de cancelación de ruido para una experiencia inmersiva.`,
        price: 129.99,
        imageUrl: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "technology",
        relevance: 89
      },
      {
        title: "Set de cocina profesional",
        description: `Para ${personName}, que disfruta experimentando nuevas recetas. Este set de utensilios premium es tendencia entre los chefs más exclusivos.`,
        price: 99.99,
        imageUrl: "https://images.pexels.com/photos/3566120/pexels-photo-3566120.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "cooking",
        relevance: 88
      },
      {
        title: "Mochila impermeable de senderismo",
        description: `Ideal para las aventuras de ${personName}. Diseño ergonómico con múltiples compartimentos y material ultraligero que es tendencia esta temporada.`,
        price: 79.99,
        imageUrl: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "travel",
        relevance: 87
      },
      {
        title: "Libro bestseller edición de lujo",
        description: `El libro que todos están comentando, perfectamente encuadernado en una edición exclusiva para ${personName}. Una historia cautivadora que no podrá dejar de leer.`,
        price: 45.99,
        imageUrl: "https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "books",
        relevance: 85
      },
      {
        title: "Set de cuidado facial premium",
        description: `Lo último en cuidado facial para ${personName}. Productos orgánicos y veganos que son tendencia entre celebridades por sus resultados visibles.`,
        price: 89.99,
        imageUrl: "https://images.pexels.com/photos/3321416/pexels-photo-3321416.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "beauty",
        relevance: 84
      },
      {
        title: "Altavoz bluetooth portátil resistente al agua",
        description: `Música de alta calidad en cualquier lugar para ${personName}. Este altavoz resistente al agua es la última tendencia para disfrutar de la música al aire libre.`,
        price: 69.99,
        imageUrl: "https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "music",
        relevance: 83
      },
      {
        title: "Set de decoración minimalista para el hogar",
        description: `Para que ${personName} transforme su espacio con el estilo más actual. Piezas exclusivas de diseño que están marcando tendencia esta temporada.`,
        price: 119.99,
        imageUrl: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
        category: "home",
        relevance: 82
      }
    ];
    
    // Seleccionar aleatoriamente 'count' productos
    const shuffled = [...premiumProducts].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    // Crear ID único para este momento
    const timestamp = Date.now();
    
    // Personalizar para la persona y asegurar que todos los campos requeridos estén presentes
    return selected.map((product, index): GiftRecommendation => {
      return {
        id: `premium-${timestamp}-${index}`,
        title: product.title,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        personName: personName,
        eventId: `temp-event-${timestamp}`, // Eventualmente se reemplazará con el ID real del evento
        affiliateLink: `https://www.amazon.es/s?k=${encodeURIComponent(product.title)}&tag=${this.affiliateTag}`,
        relevance: product.relevance
      };
    });
  }

  // Obtener recomendaciones de respaldo en caso de fallo
  public getFallbackRecommendations(personName: string, eventId: string | number): GiftRecommendation[] {
    // Clonar los productos mock para no alterar los originales
    const clonedMockProducts = JSON.parse(JSON.stringify(mockProducts));
    
    // Personalizarlos con el nombre de la persona y el ID del evento
    return clonedMockProducts.map((product: Partial<GiftRecommendation>) => ({
      ...product,
      personName,
      eventId
    })) as GiftRecommendation[];
  }
}

// Exportar una instancia por defecto
export const googleSearchService = new GoogleSearchService();

export default googleSearchService; 