/**
 * Archivo para exportar recursos de imágenes y otros assets
 * Este archivo centraliza todos los recursos para facilitar su importación
 */

// Rutas de imágenes para tarjetas de tipo eventos
export const EVENT_IMAGES = {
  BIRTHDAY: '/images/cards/events/birthday.jpg',
  ANNIVERSARY: '/images/cards/events/anniversary.jpg',
  GRADUATION: '/images/cards/events/graduation.jpg',
  HOLIDAY: '/images/cards/events/holiday.jpg',
  OTHER: '/images/cards/events/other.jpg',
  PLACEHOLDER: '/images/cards/events/placeholder.svg',
};

// Rutas de imágenes para tarjetas de contactos
export const CONTACT_IMAGES = {
  DEFAULT: '/images/cards/contacts/default.jpg',
  PLACEHOLDER: '/images/cards/contacts/placeholder.svg',
};

// Rutas de imágenes para tarjetas de regalos
export const GIFT_IMAGES = {
  DEFAULT: '/images/cards/gifts/default.jpg',
  PLACEHOLDER: '/images/cards/gifts/placeholder.svg',
};

// Rutas para fondos de tarjetas
export const BACKGROUND_IMAGES = {
  GRADIENT_BLUE: '/images/cards/backgrounds/gradient-blue.jpg',
  GRADIENT_PURPLE: '/images/cards/backgrounds/gradient-purple.jpg',
  GRADIENT_PINK: '/images/cards/backgrounds/gradient-pink.jpg',
  GRADIENT_AMBER: '/images/cards/backgrounds/gradient-amber.jpg',
  PLACEHOLDER: '/placeholder.svg',
};

// Imágenes para las tarjetas del dashboard
export const DASHBOARD_CARD_IMAGES = {
  PROXIMOS_EVENTOS: '/images/cards/backgrounds/proximos-eventos.webp',
  TOTAL_CONTACTOS: '/images/cards/backgrounds/total-contactos.webp',
  REGALOS_SUGERIDOS: '/images/cards/backgrounds/regalos-sugeridos.webp',
  RECORDATORIOS: '/images/cards/backgrounds/recordatorios.webp'
};

// Función para obtener imagen según el tipo de evento
export const getEventImageByType = (type: string) => {
  switch (type) {
    case 'birthday':
      return EVENT_IMAGES.BIRTHDAY;
    case 'anniversary':
      return EVENT_IMAGES.ANNIVERSARY;
    case 'graduation':
      return EVENT_IMAGES.GRADUATION;
    case 'holiday':
      return EVENT_IMAGES.HOLIDAY;
    default:
      return EVENT_IMAGES.OTHER;
  }
};

// Función para obtener la imagen correspondiente al dashboard según el icono
export const getDashboardCardImage = (icon: string) => {
  switch (icon) {
    case 'calendar':
      return DASHBOARD_CARD_IMAGES.PROXIMOS_EVENTOS;
    case 'users':
      return DASHBOARD_CARD_IMAGES.TOTAL_CONTACTOS;
    case 'gift':
      return DASHBOARD_CARD_IMAGES.REGALOS_SUGERIDOS;
    case 'bell':
      return DASHBOARD_CARD_IMAGES.RECORDATORIOS;
    default:
      return '';
  }
}; 