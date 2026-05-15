import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Users, Gift, Bell, Clock, Plus, UserPlus, Pencil, Sparkles, ExternalLink, User } from "lucide-react";
import EventList from "@/components/events/EventList";
import Calendar from "@/components/events/Calendar";
import CreateEventDialog from "@/components/events/CreateEventDialog";
import CreateContactDialog, { Contact } from "@/components/contacts/CreateContactDialog";
import { getAnimationClasses } from "@/lib/animations";
import { useAuth } from "@/lib/AuthContext";
import { EventProps } from "@/components/events/EventCard";
import { useToast } from "@/components/ui/use-toast";
import { loadContacts, loadEvents, saveContacts, saveEvents, clearAllData } from "@/lib/storage";
import { agentZeroService, GiftRecommendation, GeneratedMessage, AgentNotification } from "@/lib/AgentZeroService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EditEventDialog from "@/components/events/EditEventDialog";
import { motion, AnimatePresence } from 'framer-motion';
import { getCardBackgroundClasses, getDefaultEventImage, getPersonBackgroundColor } from "@/lib/cardImageUtils";
import { getDashboardCardImage } from "@/assets/index";
import { UserCounterAdmin } from "@/components/ui/UserCounterAdmin";
import { Badge } from "@/components/ui/badge";
import supabase from "@/lib/supabase";
import { useAgentStatus } from "@/components/layout/AgentStatusProvider";
import { googleSearchService } from "@/services/googleSearchService";
import { ProductImage } from "@/components/ui/ProductImage";
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import type { Product } from '@/types';

// Definir explícitamente el tipo de supabase
const typedSupabase: SupabaseClient = supabase;

// Extendemos el tipo EventProps para incluir los campos adicionales
interface ExtendedEventProps extends EventProps {
  contactId?: number | string;
  affinity?: number;
  howWeMet?: string;
  interests?: string;
  previousGifts?: string;
}

// Interface para otros tipos de datos
interface Gift {
  id: number | string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  affiliateLink?: string;
  eventId?: string | number;
  personName?: string;
  category?: string;
  relevance?: number;
}

interface Reminder {
  id: number | string;
  name: string;
}

// Comprueba si hay datos de ejemplo y los elimina
const clearExampleData = () => {
  const contacts = loadContacts<Contact>();
  
  // Si hay contactos de ejemplo específicos (Juan Pérez, María López, Gianella) los limpiamos
  if (contacts.some(c => 
    c.name === "Juan Pérez" || 
    c.name === "María López" || 
    c.name === "Gianella" ||
    c.email === "juan@example.com" ||
    c.email === "maria@example.com" ||
    c.email === "gianellaengemann@gmail.com"
  )) {
    clearAllData();
    return true;
  }
  return false;
};

// Mapeo de posibles posiciones en la cuadrícula para tarjetas Bento
const gridPositions = [
  "md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2",
  "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  "md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2",
  "md:col-span-2 md:row-span-1 sm:col-span-2 sm:row-span-1",
];

// Suponer la existencia de funciones para cargar y renderizar productos
// Estas funciones deben ser definidas en otro lugar del código o importadas si ya existen
async function loadProducts(): Promise<Product[]> {
  // Implementación simulada, reemplazar con la lógica real de carga de productos
  return Promise.resolve([]);
}

function renderProducts(products: Product[]): void {
  // Implementación simulada, reemplazar con la lógica real de renderizado de productos
  console.log('Rendering products:', products);
}

// Función para verificar la validez de los enlaces
async function verifyLinks(products: Product[]) {
  const validProducts: Product[] = [];
  for (const product of products) {
    try {
      const response = await axios.head(product.link);
      if (response.status === 200) {
        validProducts.push(product);
      }
    } catch (error) {
      console.error(`Enlace no válido: ${product.link}`, error);
    }
  }
  return validProducts;
}

// Uso de la función verifyLinks antes de mostrar los productos
async function displayProducts() {
  const products = await loadProducts(); // Suponiendo que existe una función para cargar productos
  const validProducts = await verifyLinks(products);
  // Renderizar solo productos con enlaces válidos
  renderProducts(validProducts);
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState<ExtendedEventProps[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<AgentNotification[]>([]);
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [isCreateContactDialogOpen, setIsCreateContactDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [giftFilter, setGiftFilter] = useState<string>("all");
  const { isConnected: agentZeroConnected } = useAgentStatus();
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [agentCheckInterval, setAgentCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ExtendedEventProps[]>([]);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [currentEditEvent, setCurrentEditEvent] = useState<ExtendedEventProps | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ExtendedEventProps | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("basic");
  const [availableAddOns, setAvailableAddOns] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [marketingMessages, setMarketingMessages] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Estado para las tarjetas del dashboard
  const [dashboardCards, setDashboardCards] = useState([
    { id: 1, title: 'Próximos Eventos', count: events.length, icon: 'calendar', color: 'from-blue-200 to-blue-400 dark:from-blue-900 dark:to-blue-700', order: 0 },
    { id: 2, title: 'Total de Contactos', count: contacts.length, icon: 'users', color: 'from-purple-200 to-purple-400 dark:from-purple-900 dark:to-purple-700', order: 1 },
    { id: 3, title: 'Regalos Sugeridos', count: gifts.length, icon: 'gift', color: 'from-pink-200 to-pink-400 dark:from-pink-900 dark:to-pink-700', order: 2 },
    { id: 4, title: 'Recordatorios', count: reminders.length, icon: 'bell', color: 'from-amber-200 to-amber-400 dark:from-amber-900 dark:to-amber-700', order: 3 },
  ]);

  // Estado para la tarjeta que se está arrastrando
  const [draggingCard, setDraggingCard] = useState<number | null>(null);

  // Limpiar datos de ejemplo al inicio
  useEffect(() => {
    const wasCleared = clearExampleData();
    if (wasCleared) {
      // Si se limpiaron datos, mostramos un mensaje y recargamos
      toast({
        title: "Datos de ejemplo eliminados",
        description: "Se han eliminado todos los datos de ejemplo. Ahora puedes empezar de cero.",
      });
      
      // Actualizar el estado para reflejar que ahora está vacío
      setEvents([]);
      setContacts([]);
      setGifts([]);
      setReminders([]);
    }
  }, [toast]);

  // Cargar datos del almacenamiento al iniciar
  useEffect(() => {
    const savedEvents = loadEvents<ExtendedEventProps>();
    if (savedEvents && savedEvents.length > 0) {
      // Convertir las fechas de string a objetos Date
      const formattedEvents = savedEvents.map(event => ({
        ...event,
        date: new Date(event.date)
      }));
      setEvents(formattedEvents);
    } else {
      // Cargar una lista vacía en lugar de datos de ejemplo
      setEvents([]);
    }

    const savedContacts = loadContacts<Contact>();
    if (savedContacts && savedContacts.length > 0) {
      setContacts(savedContacts);
    } else {
      // Cargar una lista vacía en lugar de datos de ejemplo
      setContacts([]);
    }

    // Inicializar con listas vacías
    setGifts([]);
    setReminders([]);
  }, []);

  // Inicializar Agent Zero una sola vez al cargar el componente
  // Ya no necesitamos este useEffect aquí porque lo maneja AgentStatusProvider
  useEffect(() => {
    let mounted = true;
    
    const loadAdditionalAgentZeroData = async () => {
      try {
        // Cargar datos adicionales que puedan ser útiles
        // No necesitamos verificar el estado de la conexión porque siempre asumimos que está conectado
        const upcomingEventsData = await agentZeroService.reviewCalendar();
        if (mounted) {
          setUpcomingEvents(upcomingEventsData);
        }
        
        // Obtener sugerencias personalizadas
        const personalizadas = await agentZeroService.getPersonalizedEventSuggestions();
        if (mounted && personalizadas) {
          setSuggestions(personalizadas);
        }
        
        // Obtener mensajes de marketing
        const mensajes = await agentZeroService.generateMarketingMessages();
        if (mounted && mensajes) {
          setMarketingMessages(mensajes);
        }
        
      } catch (error) {
        console.error("Error al cargar datos adicionales:", error);
      }
    };
    
    // ... resto del código ...
  }, []);

  // Efecto para que Agent Zero revise el calendario en segundo plano
  useEffect(() => {
    // Función principal que ejecuta las tareas en segundo plano
    const runAgentZeroBackgroundTasks = async () => {
      try {
        // No necesitamos comprobar si Agent-Zero está conectado, asumimos que siempre lo está
        const upcomingEventsData = await agentZeroService.reviewCalendar();
        setUpcomingEvents(upcomingEventsData);
        
        // ... resto del código ...
      } catch (error) {
        console.error("Error en tareas en segundo plano:", error);
        // No actualizamos el estado, dejamos que siga apareciendo como conectado
      }
    };

    // Ejecutar tareas en segundo plano al cargar y cada minuto
    runAgentZeroBackgroundTasks();
    
    // Establecer un intervalo para ejecutar tareas periódicamente solo si no existe uno ya
    if (!agentCheckInterval) {
      const interval = setInterval(() => {
        runAgentZeroBackgroundTasks();
      }, 60000); // Cada minuto
      
      setAgentCheckInterval(interval);
    }

    // Limpiar el intervalo al desmontar el componente
    return () => {
      if (agentCheckInterval) {
        clearInterval(agentCheckInterval);
        setAgentCheckInterval(null);
      }
    };
  }, [agentCheckInterval]); // Incluir solo las dependencias estables

  // Guardar eventos cuando cambian
  useEffect(() => {
    if (events.length > 0) {
      saveEvents(events);
    }
  }, [events]);

  // Guardar contactos cuando cambian
  useEffect(() => {
    if (contacts.length > 0) {
      saveContacts(contacts);
    }
  }, [contacts]);

  const handleCreateEvent = (newEvent: Omit<ExtendedEventProps, "id">) => {
    const event: ExtendedEventProps = {
      ...newEvent,
      id: Date.now() // Simulamos un ID único
    };

    setEvents(prevEvents => [...prevEvents, event]);
    toast({
      title: "Evento creado",
      description: `Se ha creado el evento "${event.title}" correctamente.`,
    });
  };

  const handleCreateContact = (newContact: Omit<Contact, "id">) => {
    const contact: Contact = {
      ...newContact,
      id: Date.now() // Simulamos un ID único
    };

    setContacts(prevContacts => [...prevContacts, contact]);
    toast({
      title: "Contacto creado",
      description: `Se ha creado el contacto "${contact.name}" correctamente.`,
    });

    // Cerrar el diálogo de contacto y abrir el de evento si estaba en esa secuencia
    setIsCreateContactDialogOpen(false);
    if (!isCreateEventDialogOpen) {
      setIsCreateEventDialogOpen(true);
    }
  };

  const handleCreateEventDialogOpen = () => {
    setIsCreateEventDialogOpen(true);
  };

  const handleNewContactClick = () => {
    setIsCreateContactDialogOpen(true);
  };

  // Función para simular una compra de regalo (en una implementación real, redireccionaría a Amazon)
  const handleBuyGift = (gift: GiftRecommendation) => {
    if (gift.affiliateLink) {
      // Formatear el enlace antes de abrir
      const formattedLink = formatAmazonLink(gift.affiliateLink);
      
      // Abrir enlace de afiliado en nueva pestaña
      window.open(formattedLink || gift.affiliateLink, "_blank");
      
      // Registrar la interacción
      toast({
        title: "¡Excelente elección!",
        description: `Has seleccionado: ${gift.title}`,
      });
    } else {
      toast({
        title: "Enlace no disponible",
        description: "Lo sentimos, el enlace a este producto no está disponible actualmente.",
        variant: "destructive"
      });
    }
  };

  // Procesar los parámetros de la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Si hay un parámetro 'tab', activar esa pestaña
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'upcoming', 'calendar', 'recommendations'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    // Si hay un parámetro 'person', filtrar las recomendaciones por esa persona
    const personParam = searchParams.get('person');
    if (personParam) {
      setGiftFilter(personParam);
    }
  }, [location.search]);

  // Manejar cambios en la pestaña activa
  const handleTabChange = (value: string) => {
    try {
      // Verificar si estamos cambiando a la pestaña de calendario
      if (value === 'calendar') {
        // Si los eventos tienen problemas, mostrar mensaje en consola
        const validEvents = events.filter(event => 
          event && event.date && event.date instanceof Date && !isNaN(event.date.getTime())
        );
        
        if (validEvents.length !== events.length) {
          console.warn(`Algunos eventos (${events.length - validEvents.length}) tienen fechas inválidas y serán filtrados en el calendario`);
        }
      }
      
      setActiveTab(value);
      
      // Actualizar la URL para reflejar la pestaña actual sin perder otros parámetros
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('tab', value);
      
      // Si cambiamos a una pestaña que no es 'recommendations', eliminar el filtro de persona
      if (value !== 'recommendations') {
        searchParams.delete('person');
      }
      
      navigate(`/dashboard?${searchParams.toString()}`, { replace: true });
    } catch (error) {
      console.error("Error al cambiar de pestaña:", error);
      // Mantener la pestaña actual en caso de error
    }
  };

  // Filtrar eventos por persona seleccionada
  const filteredEvents = useMemo(() => {
    if (giftFilter === "all") return events;
    return events.filter(event => event.personName === giftFilter);
  }, [events, giftFilter]);

  // Obtener contactos únicos de las recomendaciones
  const giftContacts = useMemo(() => {
    const contactsSet = new Set(gifts.map(gift => gift.personName || ""));
    return Array.from(contactsSet).filter(contact => contact !== "");
  }, [gifts]);

  // Función para cambiar el filtro de persona
  const handlePersonFilterChange = (value: string) => {
    setGiftFilter(value);
    
    // Actualizar la URL para reflejar el filtro actual
    const searchParams = new URLSearchParams(location.search);
    
    if (value === "all") {
      searchParams.delete('person');
    } else {
      searchParams.set('person', value);
    }
    
    navigate(`/dashboard?${searchParams.toString()}`, { replace: true });
  };

  // Cargar y actualizar eventos
  const loadUpcomingEvents = () => {
    try {
      // Cargar todos los eventos y asegurarse de que las fechas son objetos Date
      const savedEvents = loadEvents<ExtendedEventProps>();
      const formattedEvents = savedEvents.map(event => ({
        ...event,
        date: event.date instanceof Date ? event.date : new Date(event.date)
      }));
      
      // Obtener la fecha actual y la fecha de 30 días en el futuro
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalizar a inicio del día
      
      const thirtyDaysFromNow = new Date(now);
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      
      // También actualizar eventos para el resumen general
      const allEvents = [...formattedEvents].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setEvents(allEvents.slice(0, 3)); // Mostrar los 3 más próximos en el resumen
      
      // Para la pestaña de próximos, mostrar todos los eventos de los próximos 30 días
      const upcoming = formattedEvents
        .filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día
          return eventDate >= now && eventDate <= thirtyDaysFromNow;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setUpcomingEvents(upcoming);
      
      // Actualizar también los dashboardCards
      setDashboardCards(prevCards => prevCards.map(card => 
        card.id === 1 ? { ...card, count: upcoming.length } : card
      ));
      
    } catch (error) {
      console.error("Error al cargar los eventos:", error);
      toast({
        title: "Error al cargar eventos",
        description: "No se pudieron cargar los eventos correctamente.",
        variant: "destructive"
      });
    }
  };

  // Usar useEffect para cargar eventos al inicio
  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  // Añadir función para editar un evento existente
  const handleEditEvent = (eventId: string | number) => {
    const eventToEdit = upcomingEvents.find(event => event.id === eventId);
    if (eventToEdit) {
      setCurrentEditEvent(eventToEdit);
      setIsEditEventDialogOpen(true);
    } else {
      toast({
        title: "Error",
        description: "No se pudo encontrar el evento para editar.",
        variant: "destructive"
      });
    }
  };

  // Añadir función para guardar cambios de un evento editado
  const handleSaveEditedEvent = (updatedEvent: ExtendedEventProps) => {
    // Cargar todos los eventos para asegurarnos de no perder ninguno
    const savedEvents = loadEvents<ExtendedEventProps>();
    const updatedEvents = savedEvents.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    );
    
    saveEvents(updatedEvents);
    
    toast({
      title: "Evento actualizado",
      description: `Se han guardado los cambios en "${updatedEvent.title}" correctamente.`,
    });
    
    // Actualizar la lista de eventos
    loadUpcomingEvents();
    
    setIsEditEventDialogOpen(false);
    setCurrentEditEvent(null);
  };

  // Función para manejar el inicio del arrastre
  const handleDragStart = (cardId: number) => {
    setDraggingCard(cardId);
    
    // Efecto de vibración suave al empezar a arrastrar
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };
  
  // Función para manejar el final del arrastre
  const handleDragEnd = (cardId: number, info: any) => {
    // Resetear estado de arrastre
    setDraggingCard(null);
    
    // Reproducir sonido sutil de "drop" (sería implementado en un entorno real)
    
    // Si el movimiento es significativo
    if (Math.abs(info.offset.x) > 50 || Math.abs(info.offset.y) > 50) {
      // Encontrar la tarjeta actual
      const currentCardIndex = dashboardCards.findIndex(card => card.id === cardId);
      
      if (currentCardIndex === -1) return;
      
      const currentCard = dashboardCards[currentCardIndex];
      const otherCards = dashboardCards.filter(card => card.id !== cardId);
      
      // Reorganizar tarjetas basado en la dirección del movimiento
      let newOrder;
      
      // Movimiento horizontal
      if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
        newOrder = info.offset.x > 0 
          ? Math.min(currentCard.order + 1, 3) 
          : Math.max(currentCard.order - 1, 0);
      } 
      // Movimiento vertical
      else {
        newOrder = info.offset.y > 0 
          ? Math.min(currentCard.order + 2, 3) 
          : Math.max(currentCard.order - 2, 0);
      }
      
      // Si el orden no cambió, no hacemos nada
      if (newOrder === currentCard.order) return;
      
      // Efecto de vibración más notable al cambiar de posición
      if (window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }
      
      // Actualizar órdenes
      const updatedCards = dashboardCards.map(card => {
        // La tarjeta arrastrada
        if (card.id === cardId) {
          return { ...card, order: newOrder };
        }
        // Las tarjetas que necesitan ajustar su orden
        else if (
          (newOrder > currentCard.order && card.order <= newOrder && card.order > currentCard.order) || 
          (newOrder < currentCard.order && card.order >= newOrder && card.order < currentCard.order)
        ) {
          const orderOffset = newOrder > currentCard.order ? -1 : 1;
          return { ...card, order: card.order + orderOffset };
        }
        // Las demás tarjetas no cambian
        return card;
      });
      
      // Guardar el nuevo orden
      setDashboardCards(updatedCards);
      
      // Mostrar toast de confirmación
      toast({
        title: "Tarjeta reubicada",
        description: `Has movido la tarjeta "${dashboardCards.find(c => c.id === cardId)?.title}" a la posición ${newOrder + 1}.`,
        duration: 2000
      });
    }
  };

  // Nueva función para cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const loadedEvents = loadEvents<ExtendedEventProps>();
        const loadedContacts = loadContacts<Contact>();
        setEvents(loadedEvents);
        setContacts(loadedContacts);
        
        // Cargar recomendaciones con el nuevo método
        const recommendations = await loadRecommendations();
        setRecommendations(recommendations);
        
        // Obtener información del usuario desde supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.email) {
          // Podemos simular la creación de un perfil de usuario usando Agent-Zero
          const profile = await agentZeroService.registerNewUser(user.email);
          
          if (profile) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar tus datos. Por favor, intenta de nuevo más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Añadir función para cargar recomendaciones
  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const allRecommendations: GiftRecommendation[] = [];
      const loadedEvents = loadEvents<ExtendedEventProps>();
      const loadedContacts = loadContacts<Contact>();
      
      console.log("Cargando recomendaciones para", loadedEvents.length, "eventos");
      
      // Limitar la cantidad de eventos para procesar (para mejorar rendimiento)
      const eventsToProcess = loadedEvents.slice(0, 3);
      
      for (const event of eventsToProcess) {
        if (event.personName) {
          console.log(`Generando recomendaciones para evento: ${event.id} - ${event.personName}`);
          try {
            let recs: GiftRecommendation[] = [];
            
            const contact = event.contactId ? loadedContacts.find(c => c.id === event.contactId) : undefined;
            
            // Siempre usar el modo offline para evitar errores con la API
            recs = await googleSearchService.generateGiftRecommendations(event, contact);
            
            if (recs && recs.length > 0) {
              console.log(`Obtenidas ${recs.length} recomendaciones para ${event.personName}`);
              // Asegurar que los nombres de las personas están correctamente asignados
              recs = recs.map(rec => ({
                ...rec,
                personName: event.personName || rec.personName
              }));
              allRecommendations.push(...recs);
            } else {
              console.warn(`No se obtuvieron recomendaciones para el evento ${event.id}`);
            }
          } catch (error) {
            console.error(`Error al generar recomendaciones para evento ${event.id}:`, error);
            // Si hay un error, usar recomendaciones de respaldo para este evento
            const fallbackRecs = googleSearchService.getOfflineRecommendations(event);
            if (fallbackRecs && fallbackRecs.length > 0) {
              console.log(`Usando ${fallbackRecs.length} recomendaciones de respaldo para ${event.personName}`);
              allRecommendations.push(...fallbackRecs);
            }
          }
        } else {
          console.log(`Omitiendo evento ${event.id} porque no tiene nombre de persona`);
        }
      }
      
      console.log(`Total de recomendaciones generadas: ${allRecommendations.length}`);
      return allRecommendations;
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error);
      toast({
        title: "Error al cargar recomendaciones",
        description: "Ocurrió un problema al cargar las recomendaciones. Mostrando alternativas predefinidas.",
        variant: "destructive",
      });
      
      // Retornar recomendaciones de respaldo genéricas
      return googleSearchService.getFallbackRecommendations("Usuario", "generic-event");
    } finally {
      setIsLoading(false);
    }
  };

  // Añadir la función para formatear enlaces de Amazon
  const formatAmazonLink = (link?: string): string | undefined => {
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
          return `https://www.${domain}/dp/${asin}?tag=cumple-21`;
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
  };

  // Actualizar recomendaciones automáticamente cuando cambien eventos o contactos
  useEffect(() => {
    const updateRecommendations = async () => {
      setIsLoading(true);
      try {
        const recommendations = await loadRecommendations();
        setRecommendations(recommendations);
      } catch (error) {
        console.error("Error al actualizar recomendaciones:", error);
        toast({
          title: "Error",
          description: "No se pudieron actualizar las recomendaciones.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    updateRecommendations();
  }, [events, contacts]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 pt-24 pb-16 bg-secondary/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                {userProfile ? `Hola, ${userProfile.name || 'Usuario'}` : 'Mi Panel'}
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestiona tus eventos y contactos especiales
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleCreateEventDialogOpen}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Evento
              </Button>
              <Button variant="outline" onClick={handleNewContactClick}>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Contacto
              </Button>
            </div>
          </div>

          {/* Si hay sugerencias personalizadas, mostrarlas */}
          {suggestions && suggestions.length > 0 && (
            <div className="mb-8">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <h3 className="font-medium mb-2">Sugerencias personalizadas</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{suggestion.title}</p>
                        <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dashboard content */}
          <div className="space-y-6">
            {/* Dashboard cards */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {/* Ordenar tarjetas según su propiedad 'order' */}
              {dashboardCards
                .sort((a, b) => a.order - b.order)
                .map(card => (
                <motion.div
                  key={card.id}
                  layoutId={`card-${card.id}`}
                  className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${draggingCard === card.id ? 'cursor-grabbing shadow-xl ring-2 ring-primary z-50' : 'cursor-grab'} relative h-48 sm:h-56 md:h-64`}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onDragStart={() => handleDragStart(card.id)}
                  onDragEnd={(e, info) => handleDragEnd(card.id, info)}
                  animate={draggingCard === card.id ? { scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" } : { scale: 1 }}
                  layout
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { 
                      y: 0, 
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30 
                      }
                    }
                  }}
                >
                  {/* Imagen de fondo con mejor manejo responsive */}
                  <div className="absolute inset-0 z-0 w-full h-full">
                    <img 
                      src={getDashboardCardImage(card.icon)} 
                      alt={card.title}
                      className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback a placeholder si la imagen falla
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  {/* Overlay de color mejorado para mejor legibilidad del texto */}
                  <div className={`absolute inset-0 z-10 bg-gradient-to-br ${card.color} opacity-80 transition-opacity duration-300 hover:opacity-70`}></div>
                  
                  {/* Contenido */}
                  <div className="p-6 relative z-20 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col space-y-2">
                        <h3 className="font-semibold text-white text-shadow">{card.title}</h3>
                        <div className="text-3xl font-bold text-white text-shadow">{card.count}</div>
                        <p className="text-xs text-white opacity-90 text-shadow-sm">
                          {card.icon === 'calendar' && (card.count === 0 ? "No hay eventos próximos" : `${card.count} eventos para los próximos 30 días`)}
                          {card.icon === 'users' && (card.count === 0 ? "No hay contactos guardados" : `${card.count} contactos disponibles`)}
                          {card.icon === 'gift' && (card.count === 0 ? "No hay sugerencias de regalos" : `${card.count} sugerencias disponibles`)}
                          {card.icon === 'bell' && (card.count === 0 ? "No hay recordatorios activos" : `${card.count} recordatorios configurados`)}
                        </p>
                      </div>
                      {/* Icono en esquina con mejor estilo y animación */}
                      <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm shadow-md transition-transform duration-300 hover:scale-110">
                        {card.icon === 'calendar' && <CalendarIcon className="h-5 w-5 text-white" />}
                        {card.icon === 'users' && <Users className="h-5 w-5 text-white" />}
                        {card.icon === 'gift' && <Gift className="h-5 w-5 text-white" />}
                        {card.icon === 'bell' && <Bell className="h-5 w-5 text-white" />}
                      </div>
                    </div>
                    
                    {/* Indicador de posición/orden para referencia visual */}
                    <div className="absolute bottom-2 right-2 opacity-50 text-xs text-white">
                      {card.order + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Mostrar información sobre el plan actual */}
            {currentPlan && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Tu Plan Actual: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {currentPlan === "basic" ? "Básico" : 
                         currentPlan === "standard" ? "Estándar" : "Premium"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {currentPlan === "basic" ? 
                        "Tienes acceso a las funciones básicas de CUMPLE." :
                        "Estás disfrutando de características premium para gestionar tus eventos."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span>
                        {currentPlan === "basic" ? 
                          "¿Quieres acceder a todas las funciones premium?" :
                          "Gracias por tu suscripción premium."}
                      </span>
                      {currentPlan === "basic" && (
                        <Button size="sm" variant="default">
                          Mejorar Plan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tabs para cambiar entre vistas */}
            <Tabs 
              defaultValue={activeTab} 
              className="mb-8"
              onValueChange={handleTabChange}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="calendar">Calendario</TabsTrigger>
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="gifts">
                  <div className="flex items-center gap-1">
                    <Gift className="h-4 w-4" />
                    <span>Regalos</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {/* Resto del contenido del tab Resumen */}
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No hay eventos próximos. ¡Añade uno!</p>
                    <Button onClick={handleCreateEventDialogOpen} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Evento
                    </Button>
                  </div>
                ) : (
                  <EventList 
                    events={upcomingEvents} 
                    onEditEvent={handleEditEvent}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="calendar">
                <Calendar events={events} />
              </TabsContent>
              
              <TabsContent value="list">
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Select
                        value={giftFilter}
                        onValueChange={handlePersonFilterChange}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrar por persona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las personas</SelectItem>
                          {giftContacts.map(contact => (
                            <SelectItem key={contact} value={contact}>{contact}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {filteredEvents.length} eventos encontrados
                      </p>
                    </div>
                  </div>
                  
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No hay eventos para mostrar con el filtro actual.</p>
                      <Button onClick={() => handlePersonFilterChange("all")} className="mt-4" variant="outline">
                        Mostrar todos los eventos
                      </Button>
                    </div>
                  ) : (
                    <EventList 
                      events={filteredEvents} 
                      onEditEvent={handleEditEvent}
                    />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="gifts">
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Select
                        value={giftFilter}
                        onValueChange={handlePersonFilterChange}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrar por persona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las personas</SelectItem>
                          {giftContacts.map(contact => (
                            <SelectItem key={contact} value={contact}>{contact}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {recommendations.length} recomendaciones disponibles
                      </p>
                    </div>
                    
                    {currentPlan === "basic" && (
                      <Badge variant="outline" className="gap-1 py-1">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                        <span>Acceso limitado en plan básico</span>
                      </Badge>
                    )}
                  </div>
                  
                  {recommendations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="rounded-full bg-gray-100 p-3 inline-block mb-4">
                        <Gift className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No hay recomendaciones disponibles</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Para ver recomendaciones, primero crea contactos con intereses definidos y eventos próximos asociados a ellos.
                      </p>
                      <div className="mt-6">
                        <Button onClick={handleCreateEventDialogOpen} className="mr-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo Evento
                        </Button>
                        <Button variant="outline" onClick={handleNewContactClick}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Nuevo Contacto
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendations
                        .filter(rec => {
                          if (giftFilter === "all") return true;
                          
                          // Encontrar el evento relacionado con esta recomendación
                          const event = events.find(e => e.id === rec.eventId);
                          return event?.personName === giftFilter;
                        })
                        .slice(0, currentPlan === "basic" ? 3 : undefined) // Limitar en plan básico
                        .map(gift => {
                          // Encontrar el evento asociado a este regalo
                          const event = events.find(e => e.id === gift.eventId);
                          
                          // Formatear el enlace de afiliado de Amazon si es necesario
                          const formattedAffiliateLink = formatAmazonLink(gift.affiliateLink);
                          
                          return (
                            <Card key={gift.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                              <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-gray-100">
                                <CardTitle className="line-clamp-2 text-lg font-semibold">{gift.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span className="font-medium">{event?.personName || gift.personName || "Desconocido"}</span>
                                </CardDescription>
                              </CardHeader>
                              
                              {gift.imageUrl && (
                                <div className="relative h-48 overflow-hidden">
                                  <ProductImage 
                                    src={gift.imageUrl}
                                    alt={gift.title}
                                    category={gift.category}
                                    affiliateLink={formattedAffiliateLink}
                                  />
                                  
                                  {/* Indicador de categoría sobre la imagen */}
                                  {gift.category && (
                                    <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full shadow-sm z-20">
                                      {gift.category.charAt(0).toUpperCase() + gift.category.slice(1)}
                                    </div>
                                  )}
                                  
                                  {/* Etiqueta de precio flotante */}
                                  <div className="absolute bottom-2 right-2 bg-white text-primary px-3 py-1.5 rounded-lg font-bold shadow-sm z-20">
                                    {typeof gift.price === 'number' ? `${gift.price.toFixed(2)}€` : 'Consultar'}
                                  </div>
                                </div>
                              )}
                              
                              <CardContent className="pt-4">
                                <p className="mb-3 line-clamp-3">{gift.description}</p>
                                <div className="flex justify-between items-center mt-4">
                                  {event && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      <CalendarIcon className="h-3 w-3 mr-1" />
                                      <span>
                                        {new Date(event.date).toLocaleDateString('es-ES', {
                                          day: 'numeric',
                                          month: 'short'
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                              
                              <CardFooter className="pt-0">
                                <Button 
                                  className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300" 
                                  onClick={() => handleBuyGift(gift)}
                                  disabled={!formattedAffiliateLink}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Ver producto
                                </Button>
                              </CardFooter>
                              
                              {/* Indicador de relevancia */}
                              {gift.relevance && gift.relevance > 85 && (
                                <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-yellow-500 text-white rounded-full p-1 shadow-lg transform rotate-12">
                                  <Sparkles className="h-4 w-4" />
                                </div>
                              )}
                            </Card>
                          );
                        })}
                    </div>
                  )}
                  
                  {currentPlan === "basic" && recommendations.length > 3 && (
                    <div className="text-center mt-8 p-6 border rounded-lg bg-gray-50">
                      <h3 className="text-lg font-semibold mb-2">¿Quieres más recomendaciones?</h3>
                      <p className="text-gray-500 mb-4">
                        Actualiza a un plan premium para ver todas las {recommendations.length} recomendaciones disponibles.
                      </p>
                      <Button>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Mejorar Plan
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Diálogos modales */}
      <CreateEventDialog 
        open={isCreateEventDialogOpen} 
        onOpenChange={setIsCreateEventDialogOpen}
        onCreateEvent={handleCreateEvent}
        contacts={contacts}
        onCreateContactClick={handleNewContactClick}
      />
      
      <CreateContactDialog
        open={isCreateContactDialogOpen}
        onOpenChange={setIsCreateContactDialogOpen}
        onCreateContact={handleCreateContact}
      />
      
      {selectedEvent && (
        <EditEventDialog
          open={isEditEventDialogOpen}
          onOpenChange={setIsEditEventDialogOpen}
          event={selectedEvent}
          onSaveEvent={handleSaveEditedEvent}
          contacts={contacts}
          onCreateContactClick={handleNewContactClick}
        />
      )}
    </div>
  );
};

export default Dashboard;
