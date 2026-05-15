/**
 * Utilidades para manejar las imágenes y fondos de las tarjetas
 */

// Colores para fondos de tarjetas según el tipo de evento
const eventCardColors = {
  birthday: {
    light: 'from-orange-200 to-red-300',
    dark: 'from-orange-700 to-red-800',
    gradient: 'bg-gradient-to-br'
  },
  anniversary: {
    light: 'from-pink-200 to-purple-300',
    dark: 'from-pink-700 to-purple-800',
    gradient: 'bg-gradient-to-br'
  },
  graduation: {
    light: 'from-blue-200 to-indigo-300',
    dark: 'from-blue-700 to-indigo-800',
    gradient: 'bg-gradient-to-br'
  },
  holiday: {
    light: 'from-green-200 to-teal-300',
    dark: 'from-green-700 to-teal-800',
    gradient: 'bg-gradient-to-br'
  },
  other: {
    light: 'from-gray-200 to-gray-300',
    dark: 'from-gray-700 to-gray-800',
    gradient: 'bg-gradient-to-br'
  }
};

// URL de imagen por defecto para eventos sin imagen
export const DEFAULT_EVENT_IMAGES = {
  "birthday": 'https://via.placeholder.com/400x600/FFA726/ffffff?text=Cumpleaños',
  "anniversary": 'https://via.placeholder.com/400x600/EC407A/ffffff?text=Aniversario',
  "graduation": 'https://via.placeholder.com/400x600/42A5F5/ffffff?text=Graduación',
  "holiday": 'https://via.placeholder.com/400x600/66BB6A/ffffff?text=Festividad',
  "other": 'https://via.placeholder.com/400x600/9575CD/ffffff?text=Evento'
};

/**
 * Obtiene las clases CSS para el fondo de una tarjeta según su tipo
 * @param type Tipo de evento
 * @param isDarkMode Si está en modo oscuro
 * @returns Clases para el fondo de la tarjeta
 */
export const getCardBackgroundClasses = (
  type: "birthday" | "anniversary" | "graduation" | "holiday" | "other",
  isDarkMode = false
): string => {
  const colorScheme = eventCardColors[type];
  return `${colorScheme.gradient} ${isDarkMode ? colorScheme.dark : colorScheme.light}`;
};

/**
 * Obtiene la URL de la imagen predeterminada según el tipo de evento
 * @param type Tipo de evento
 * @returns URL de la imagen predeterminada
 */
export const getDefaultEventImage = (
  type: "birthday" | "anniversary" | "graduation" | "holiday" | "other"
): string => {
  return DEFAULT_EVENT_IMAGES[type] || DEFAULT_EVENT_IMAGES.other;
};

/**
 * Genera un color de fondo para una tarjeta según el nombre de una persona
 * Útil para contactos sin imagen, creando un color consistente para cada persona
 * @param name Nombre de la persona
 * @returns Clases de TailwindCSS para el fondo
 */
export const getPersonBackgroundColor = (name: string): string => {
  // Crea un hash simple del nombre para determinar el color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Determina uno de los esquemas de colores predefinidos
  const colorIndex = Math.abs(hash) % 5;
  const colorSchemes = [
    "bg-gradient-to-br from-blue-300 to-blue-500", // Azul
    "bg-gradient-to-br from-green-300 to-green-500", // Verde
    "bg-gradient-to-br from-purple-300 to-purple-500", // Púrpura
    "bg-gradient-to-br from-amber-300 to-amber-500", // Ámbar
    "bg-gradient-to-br from-pink-300 to-pink-500", // Rosa
  ];

  return colorSchemes[colorIndex];
}; 