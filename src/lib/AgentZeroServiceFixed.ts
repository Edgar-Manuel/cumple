import { EventProps } from "@/components/events/EventCard";
import { Contact } from "@/components/contacts/CreateContactDialog";
import { loadContacts, loadEvents, saveEvents } from "@/lib/storage";
import { getUserCount, incrementUserCount } from "@/services/userCountService";
import { googleSearchService } from "@/services/googleSearchService";

// Extendemos EventProps para incluir los campos específicos que necesitamos
interface ExtendedEventProps extends EventProps {
  contactId?: number | string;
  affinity?: number;
  howWeMet?: string;
  interests?: string;
  previousGifts?: string;
}

// Interfaces para las recomendaciones y mensajes generados por Agent-Zero
export interface GiftRecommendation {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  affiliateLink: string;
  eventId: string | number;
  personName: string;
  category?: string;  // Nueva propiedad para categorizar las recomendaciones
  relevance?: number; // Nueva propiedad para indicar la relevancia de la recomendación
}

export interface GeneratedMessage {
  id: string;
  content: string;
  eventId: string | number;
  personName: string;
  type: "birthday" | "anniversary" | "graduation" | "holiday" | "other";
}

export interface SocialPostDraft {
  id: string;
  content: string;
  eventId: string | number;
  personName: string;
  platform: "facebook" | "instagram" | "twitter" | "whatsapp";
}

export interface AgentNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "suggestion";
  timestamp: Date;
  read: boolean;
}

// Nueva interfaz para planes de suscripción
export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  popular?: boolean;
}

// Nueva interfaz para complementos/add-ons
export interface PlanAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  oneTime: boolean;
}

// Nueva interfaz para usuarios registrados
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  registrationDate: Date;
  currentPlan: string;
  addOns: string[];
  trialEndsAt?: Date;
  discountApplied?: boolean;
}

// Interfaz para las categorías de interés
export interface InterestCategory {
  name: string;
  keywords: string[];
  searchTerms: string[];
}

// Agrega una clase para gestionar las recomendaciones
export class RecommendationsManager {
  private dbPath: string = "recommendations_db.json";
  private recommendations: GiftRecommendation[] = [];
  private lastUpdated: Date = new Date(0); // 1970-01-01
  
  constructor() {
    this.loadRecommendations();
  }
  
  public getRecommendationsForEvent(eventId: string | number): GiftRecommendation[] {
    return this.recommendations.filter(rec => rec.eventId === eventId);
  }
  
  public getRecommendationsForPerson(personName: string): GiftRecommendation[] {
    return this.recommendations.filter(rec => 
      rec.personName.toLowerCase() === personName.toLowerCase());
  }
  
  public getAllRecommendations(): GiftRecommendation[] {
    return [...this.recommendations];
  }
  
  public addRecommendations(newRecs: GiftRecommendation[]): void {
    // Añadir sólo recomendaciones que no existan ya (por ID)
    for (const newRec of newRecs) {
      const existingIndex = this.recommendations.findIndex(rec => rec.id === newRec.id);
      if (existingIndex >= 0) {
        // Actualizar existente
        this.recommendations[existingIndex] = newRec;
      } else {
        // Añadir nueva
        this.recommendations.push(newRec);
      }
    }
    
    this.lastUpdated = new Date();
    this.saveRecommendations();
  }
  
  public needsUpdate(): boolean {
    // Actualizar si han pasado más de 24 horas desde la última actualización
    const now = new Date();
    const hoursSinceLastUpdate = (now.getTime() - this.lastUpdated.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastUpdate > 24;
  }
  
  private loadRecommendations(): void {
    try {
      // En un entorno real, esto cargaría del sistema de archivos o una API
      // Para este ejemplo, simulamos cargar desde localStorage en el navegador
      const savedRecs = localStorage.getItem(this.dbPath);
      if (savedRecs) {
        this.recommendations = JSON.parse(savedRecs);
        this.lastUpdated = new Date();
      }
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error);
    }
  }
  
  private saveRecommendations(): void {
    try {
      // En un entorno real, esto guardaría en el sistema de archivos o una API
      // Para este ejemplo, simulamos guardar en localStorage en el navegador
      localStorage.setItem(this.dbPath, JSON.stringify(this.recommendations));
    } catch (error) {
      console.error("Error al guardar recomendaciones:", error);
    }
  }
}

// Clase para gestionar la comunicación con Agent-Zero
export class AgentZeroService {
  private static instance: AgentZeroService;
  private baseUrl: string = "http://localhost:5000"; // URL del servicio Agent-Zero
  private apiKey: string = "";
  private isDockerRunning: boolean = false;
  private agentContextId: string = "";
  private recommendationsManager: RecommendationsManager;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;
  private useFallbackMode: boolean = false;
  private useGoogleAPI: boolean = false; // Indica si estamos usando Google en lugar de OpenAI
  
  // Propiedades para almacenar datos fallback
  private _fallbackSuggestions: {title: string, description: string}[] = [];
  private _fallbackPlans: SubscriptionPlan[] = [];
  private _fallbackAddOns: PlanAddOn[] = [];

  // Más propiedades de la clase...

  constructor() {
    // Inicializar el gestor de recomendaciones primero
    this.recommendationsManager = new RecommendationsManager();
    
    // Forzar modo fallback para que la aplicación funcione sin Agent-Zero
    this.useFallbackMode = true;
    
    // Inicializar datos fallback después de tener el recommendationsManager
    this.initializeFallbackData();
    
    // Silenciamos mensajes repetitivos de inicialización de fallback
    console.log("Modo fallback activado: CUMPLE funcionará con recomendaciones predefinidas");
    
    // Más código del constructor...
  }
  
  // Métodos de la clase...
  
  // Método para obtener sugerencias personalizadas para los eventos próximos
  public async getPersonalizedEventSuggestions(): Promise<{title: string, description: string}[]> {
    // Si estamos en modo fallback, usar las sugerencias predefinidas
    if (this.useFallbackMode) {
      console.log("Usando sugerencias personalizadas en modo fallback");
      // Verificar que _fallbackSuggestions está definido
      if (!this._fallbackSuggestions || this._fallbackSuggestions.length === 0) {
        // Si no hay sugerencias fallback, devolver algunas sugerencias por defecto
        return [
          {
            title: "Bienvenido a CUMPLE",
            description: "Comienza agregando contactos y eventos para aprovechar todas las funcionalidades."
          }
        ];
      }
      return this._fallbackSuggestions;
    }
    
    // Obtener eventos del usuario
    const events = loadEvents<ExtendedEventProps>();
    
    // Si no hay eventos, devolver sugerencias generales
    if (!events || events.length === 0) {
      return [
        {
          title: "Comienza añadiendo contactos",
          description: "Agrega a tus amigos y familiares para recibir recordatorios de sus fechas especiales."
        },
        {
          title: "Configura tu primer evento",
          description: "Añade un cumpleaños o aniversario para comenzar a recibir recomendaciones."
        }
      ];
    }
    
    // Si hay eventos, generar sugerencias personalizadas
    return [
      {
        title: `Prepárate para ${events[0]?.type || 'el próximo evento'}`,
        description: `No olvides preparar algo especial para ${events[0]?.personName || 'tu ser querido'}.`
      },
      {
        title: "Explora los complementos premium",
        description: "Mejora tu experiencia con los paquetes de mensajes y recomendaciones exclusivas."
      }
    ];
  }
  
  // Método para obtener información sobre los planes disponibles
  public async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // Comprobar si estamos en modo fallback
    if (this.useFallbackMode) {
      // Si no hay planes fallback definidos, crear algunos por defecto
      if (!this._fallbackPlans || this._fallbackPlans.length === 0) {
        this._fallbackPlans = [
          {
            id: "basic",
            name: "Básico",
            monthlyPrice: 5.99,
            annualPrice: 59.88,
            features: [
              "Hasta 20 contactos",
              "Recordatorios básicos",
              "Recomendaciones limitadas"
            ]
          },
          {
            id: "premium",
            name: "Premium",
            monthlyPrice: 14.99,
            annualPrice: 143.88,
            features: [
              "Contactos ilimitados",
              "Recordatorios avanzados", 
              "Recomendaciones ilimitadas"
            ],
            popular: true
          },
          {
            id: "pro",
            name: "Profesional",
            monthlyPrice: 19.99,
            annualPrice: 199.88,
            features: [
              "Todo lo de Premium",
              "Asistente de planificación",
              "Acceso prioritario a nuevas funciones"
            ]
          }
        ];
      }
      return this._fallbackPlans;
    }
    
    // Si no estamos en modo fallback, devolver planes predeterminados
    return [
      {
        id: "basic",
        name: "Básico",
        monthlyPrice: 5.99,
        annualPrice: 59.88,
        features: [
          "Hasta 20 contactos",
          "Recordatorios básicos",
          "Recomendaciones de tendencias actuales limitadas"
        ]
      },
      {
        id: "premium",
        name: "Premium",
        monthlyPrice: 14.99,
        annualPrice: 143.88,
        features: [
          "Contactos ilimitados",
          "Acceso a las últimas tendencias en regalos",
          "Recomendaciones personalizadas",
          "Recordatorios avanzados"
        ],
        popular: true
      }
    ];
  }
  
  // Método para obtener los complementos disponibles
  public async getAvailableAddOns(): Promise<PlanAddOn[]> {
    // Comprobar si estamos en modo fallback
    if (this.useFallbackMode) {
      // Si no hay add-ons fallback definidos, crear algunos por defecto
      if (!this._fallbackAddOns || this._fallbackAddOns.length === 0) {
        this._fallbackAddOns = [
          {
            id: "gift-finder",
            name: "Buscador de Regalos Pro",
            description: "Recomendaciones de regalos personalizadas con IA",
            price: 4.99,
            oneTime: true
          },
          {
            id: "calendar-sync",
            name: "Sincronización con Calendario",
            description: "Integra tus eventos con Google Calendar, Outlook y más",
            price: 2.99,
            oneTime: true
          },
          {
            id: "invitation-designer",
            name: "Diseñador de Invitaciones",
            description: "Crea invitaciones personalizadas para tus eventos",
            price: 3.99,
            oneTime: true
          }
        ];
      }
      return this._fallbackAddOns;
    }
    
    // Para modo no-fallback, retornar add-ons predeterminados
    return [
      {
        id: "trending-gifts",
        name: "Recomendador de Tendencias",
        description: "Acceso a recomendaciones de regalos basados en tendencias actuales",
        price: 5.99,
        oneTime: false
      },
      {
        id: "premium-messages",
        name: "Mensajes Premium",
        description: "Plantillas de mensajes personalizados creados por expertos",
        price: 3.99,
        oneTime: true
      }
    ];
  }
  
  // Método para generar mensajes de marketing personalizados para la landing page
  public async generateMarketingMessages(userId?: string): Promise<string[]> {
    // Mensajes predeterminados para casos de error o fallback
    const defaultMessages = [
      "Nunca olvides un momento especial con CUMPLE",
      "Gestiona todos tus eventos y sorprende a tus seres queridos",
      "La IA que te ayuda a recordar todas las fechas importantes",
      "Mensajes personalizados que parecen escritos por ti"
    ];
    
    // Si estamos en modo fallback o Agent-Zero no está disponible
    if (this.useFallbackMode || !this.isDockerRunning) {
      console.log("Usando mensajes de marketing en modo fallback");
      return defaultMessages;
    }
    
    try {
      // En un caso real, aquí se enviaría una solicitud a Agent-Zero para generar mensajes
      // basados en el perfil del usuario o tendencias actuales
      
      const response = await fetch(`${this.baseUrl}/generate_marketing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          contextId: this.agentContextId,
          userId: userId || "anonymous",
          purpose: "landing_page"
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          return data.messages;
        }
      }
      
      // Si hay algún error o no hay datos válidos, devolver mensajes predeterminados
      console.warn("No se pudieron generar mensajes de marketing personalizados");
      return defaultMessages;
    } catch (error) {
      console.error("Error al generar mensajes de marketing:", error);
      
      // Mensajes predeterminados en caso de error
      return defaultMessages;
    }
  }
  
  // Resto de métodos de la clase...
}

// Exportar una instancia única del servicio
export const agentZeroService = AgentZeroService.getInstance(); 