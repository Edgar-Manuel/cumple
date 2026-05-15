// Claves de almacenamiento
const STORAGE_KEYS = {
  EVENTS: 'cumple_events',
  CONTACTS: 'cumple_contacts',
  GIFTS: 'cumple_gifts',
  REMINDERS: 'cumple_reminders'
};

// Reviser para JSON.parse para reconocer fechas
const dateTimeReviver = (key: string, value: any): any => {
  // Verificar si el valor es un string con formato de fecha ISO
  if (typeof value === 'string' && 
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
    const date = new Date(value);
    // Solo devolver la fecha si es válida
    return isNaN(date.getTime()) ? value : date;
  }
  return value;
};

// Funciones genéricas para guardar y leer datos
const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error al guardar datos para ${key}:`, error);
  }
};

const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    // Usar el reviver para parsear fechas
    return data ? JSON.parse(data, dateTimeReviver) : defaultValue;
  } catch (error) {
    console.error(`Error al cargar datos para ${key}:`, error);
    return defaultValue;
  }
};

// Función para limpiar todos los datos de ejemplo
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.GIFTS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    console.log("Todos los datos de ejemplo han sido eliminados.");
  } catch (error) {
    console.error("Error al limpiar los datos:", error);
  }
};

// Función para deserializar fechas en los eventos cargados desde localStorage
const parseEventDates = (events: any[]): any[] => {
  try {
    return events.map(event => {
      // Verificar si el evento tiene una propiedad date y es una string
      if (event && event.date && typeof event.date === 'string') {
        // Intentar convertir la fecha de string a objeto Date
        const dateObj = new Date(event.date);
        // Verificar si la fecha es válida
        if (!isNaN(dateObj.getTime())) {
          return {
            ...event,
            date: dateObj
          };
        }
      }
      return event;
    });
  } catch (error) {
    console.error("Error al parsear fechas de eventos:", error);
    return events;
  }
};

// Funciones específicas para cada tipo de dato
export const saveEvents = <T>(events: T[]): void => {
  saveData(STORAGE_KEYS.EVENTS, events);
};

export const loadEvents = <T>(defaultValue: T[] = []): T[] => {
  try {
    const events = loadData(STORAGE_KEYS.EVENTS, defaultValue);
    // Deserializar fechas antes de devolver los eventos
    return parseEventDates(events) as T[];
  } catch (error) {
    console.error("Error al cargar eventos:", error);
    return defaultValue;
  }
};

export const saveContacts = <T>(contacts: T[]): void => {
  saveData(STORAGE_KEYS.CONTACTS, contacts);
};

export const loadContacts = <T>(defaultValue: T[] = []): T[] => {
  return loadData(STORAGE_KEYS.CONTACTS, defaultValue);
};

export const saveGifts = <T>(gifts: T[]): void => {
  saveData(STORAGE_KEYS.GIFTS, gifts);
};

export const loadGifts = <T>(defaultValue: T[] = []): T[] => {
  return loadData(STORAGE_KEYS.GIFTS, defaultValue);
};

export const saveReminders = <T>(reminders: T[]): void => {
  saveData(STORAGE_KEYS.REMINDERS, reminders);
};

export const loadReminders = <T>(defaultValue: T[] = []): T[] => {
  return loadData(STORAGE_KEYS.REMINDERS, defaultValue);
}; 