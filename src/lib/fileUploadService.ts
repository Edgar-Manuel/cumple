/**
 * Servicio para manejar la carga de imágenes a las carpetas definidas
 * Este servicio simula un backend para guardar archivos con URLs locales
 */

// Función para simular la subida de un archivo y generar una URL
export const uploadImage = async (
  file: File, 
  folder: 'events' | 'contacts' | 'gifts' | 'backgrounds'
): Promise<string> => {
  // En un entorno real, aquí subiríamos el archivo a un servidor
  // Pero en este caso, simulamos una carga exitosa

  // Validar el tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño del archivo (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no debe superar los 5MB');
  }

  // En una aplicación real, aquí subiríamos el archivo a un servidor
  // y obtendríamos la URL. Como estamos trabajando localmente,
  // generamos una URL del objeto Blob
  
  // Creamos URL local para el archivo
  const fileUrl = URL.createObjectURL(file);
  
  // En producción, construiríamos una ruta real al archivo guardado
  const productionUrl = `/images/cards/${folder}/${file.name}`;
  
  // Simulamos una demora de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Guardamos la url en localStorage para persistencia
  const savedUrls = JSON.parse(localStorage.getItem('savedImageUrls') || '{}');
  savedUrls[productionUrl] = fileUrl;
  localStorage.setItem('savedImageUrls', JSON.stringify(savedUrls));
  
  // Devolvemos la URL que se usaría en producción
  return productionUrl;
};

// Función para obtener una URL de una imagen guardada
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // Si la ruta ya es una URL completa, la devolvemos
  if (path.startsWith('http') || path.startsWith('blob:')) {
    return path;
  }
  
  // Si tenemos una versión local guardada, la usamos
  const savedUrls = JSON.parse(localStorage.getItem('savedImageUrls') || '{}');
  if (savedUrls[path]) {
    return savedUrls[path];
  }
  
  // Si no, devolvemos la ruta original (asumiendo que existe)
  return path;
};

// Función para borrar una imagen
export const deleteImage = (path: string): boolean => {
  if (!path) return false;
  
  // Borrar la entrada en localStorage
  const savedUrls = JSON.parse(localStorage.getItem('savedImageUrls') || '{}');
  
  if (savedUrls[path]) {
    // Revocar la URL del objeto para liberar memoria
    URL.revokeObjectURL(savedUrls[path]);
    
    // Eliminar la entrada
    delete savedUrls[path];
    localStorage.setItem('savedImageUrls', JSON.stringify(savedUrls));
    return true;
  }
  
  return false;
}; 