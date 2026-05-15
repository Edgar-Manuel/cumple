import { useState, useEffect } from 'react';
import { Gift, ShoppingBag, Package } from "lucide-react";

interface ProductImageProps {
  src: string;
  alt: string;
  category?: string;
  className?: string;
  affiliateLink?: string;
}

export const ProductImage = ({ src, alt, category, className, affiliateLink }: ProductImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Regex para extraer ASIN (ID de producto Amazon) del enlace o imagen
  const extractAmazonASIN = (url: string): string | null => {
    // Intentar extraer del path de la URL
    const asinMatch = url.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
    if (asinMatch && asinMatch[1]) {
      return asinMatch[1];
    }
    
    // Intentar extraer de la parte del nombre de archivo
    const filenameMatch = url.match(/([A-Z0-9]{10})(?:\.jpg|\.png|_SL|$)/);
    if (filenameMatch && filenameMatch[1]) {
      return filenameMatch[1];
    }
    
    return null;
  };

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(false);

    const attemptToLoadImage = async () => {
      if (!src) {
        if (mounted) {
          setError(true);
          setIsLoading(false);
        }
        return;
      }

      // Intentar cargar la imagen original primero
      try {
        console.log(`Intentando cargar la imagen original: ${src}`);
        const img = new Image();
        
        img.onload = () => {
          if (mounted) {
            console.log('Imagen original cargada correctamente');
            setImageSrc(src);
            setIsLoading(false);
          }
        };
        
        img.onerror = async () => {
          // Si la imagen original falla y es de Amazon, intentar obtener una mejor URL
          if ((src.includes('amazon') || (affiliateLink && affiliateLink.includes('amazon'))) && mounted) {
            console.log('La imagen original falló, intentando opciones alternativas para Amazon');
            
            // Extraer ASIN del enlace o de la imagen
            const asin = extractAmazonASIN(src) || (affiliateLink ? extractAmazonASIN(affiliateLink) : null);
            
            if (asin) {
              console.log(`ASIN encontrado: ${asin}, intentando formatos alternativos`);
              
              // Lista de formatos de URL de Amazon a intentar
              const amazonImageFormats = [
                `https://m.media-amazon.com/images/I/${asin}._AC_SL500_.jpg`,
                `https://m.media-amazon.com/images/I/${asin}.jpg`,
                `https://images-na.ssl-images-amazon.com/images/I/${asin}._AC_SL500_.jpg`,
                `https://images-na.ssl-images-amazon.com/images/I/${asin}.jpg`,
                `https://images-eu.ssl-images-amazon.com/images/I/${asin}._AC_SL500_.jpg`
              ];
              
              // Intentar cada formato de URL hasta que uno funcione
              let imageLoaded = false;
              
              for (const format of amazonImageFormats) {
                if (!mounted) break;
                
                try {
                  const altImg = new Image();
                  
                  // Crear una promesa para esperar a que la imagen cargue o falle
                  await new Promise<void>((resolve) => {
                    altImg.onload = () => {
                      if (mounted && !imageLoaded) {
                        console.log(`Formato alternativo funcionó: ${format}`);
                        setImageSrc(format);
                        setIsLoading(false);
                        imageLoaded = true;
                      }
                      resolve();
                    };
                    
                    altImg.onerror = () => {
                      console.log(`Formato alternativo falló: ${format}`);
                      resolve();
                    };
                    
                    altImg.src = format;
                  });
                  
                  if (imageLoaded) break;
                } catch (err) {
                  console.log(`Error al intentar formato: ${format}`, err);
                }
              }
              
              // Si ningún formato de Amazon funcionó, intentar con una API de imágenes de productos
              if (!imageLoaded && mounted) {
                try {
                  // Probar con servicios que proporcionan imágenes de productos como Serpapi, SERP API, o Rainforest API
                  // Ejemplo con URL pública de ejemplo (reemplazar por una API real en producción)
                  const productAPIUrl = `https://api.uifaces.co/our-content/donated/${asin.toLowerCase()}.jpg`;
                  
                  const apiImg = new Image();
                  
                  await new Promise<void>((resolve) => {
                    apiImg.onload = () => {
                      if (mounted && !imageLoaded) {
                        console.log(`API de imágenes funcionó: ${productAPIUrl}`);
                        setImageSrc(productAPIUrl);
                        setIsLoading(false);
                        imageLoaded = true;
                      }
                      resolve();
                    };
                    
                    apiImg.onerror = () => {
                      console.log(`API de imágenes falló`);
                      resolve();
                    };
                    
                    apiImg.src = productAPIUrl;
                  });
                } catch (err) {
                  console.log('Error al intentar API de imágenes', err);
                }
              }
              
              // Si todavía no se ha cargado ninguna imagen, usar fallback
              if (!imageLoaded && mounted) {
                useFallbackImage();
              }
            } else {
              // No se pudo extraer ASIN, usar fallback
              if (mounted) {
                console.log('No se pudo extraer ASIN, usando fallback');
                useFallbackImage();
              }
            }
          } else {
            // No es una imagen de Amazon o no estamos montados, usar fallback
            if (mounted) {
              console.log('No es una imagen de Amazon o componente desmontado, usando fallback');
              useFallbackImage();
            }
          }
        };
        
        img.src = src;
      } catch (error) {
        // Error general al cargar la imagen, usar fallback
        if (mounted) {
          console.error("Error general al cargar imagen:", error);
          useFallbackImage();
        }
      }
    };

    // Función para utilizar una imagen de fallback basada en la categoría
    const useFallbackImage = () => {
      try {
        // Definir imágenes de fallback por categoría
        const categoryPlaceholders: Record<string, string> = {
          technology: 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=600',
          books: 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&w=600',
          cooking: 'https://images.pexels.com/photos/6401669/pexels-photo-6401669.jpeg?auto=compress&cs=tinysrgb&w=600',
          travel: 'https://images.pexels.com/photos/1051073/pexels-photo-1051073.jpeg?auto=compress&cs=tinysrgb&w=600',
          sports: 'https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=600',
          fashion: 'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg?auto=compress&cs=tinysrgb&w=600',
          home: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=600',
          beauty: 'https://images.pexels.com/photos/2697787/pexels-photo-2697787.jpeg?auto=compress&cs=tinysrgb&w=600',
          music: 'https://images.pexels.com/photos/6966/abstract-music-rock-bw.jpg?auto=compress&cs=tinysrgb&w=600',
          hobby: 'https://images.pexels.com/photos/220067/pexels-photo-220067.jpeg?auto=compress&cs=tinysrgb&w=600',
          general: 'https://images.pexels.com/photos/264771/pexels-photo-264771.jpeg?auto=compress&cs=tinysrgb&w=600',
          premium: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=600',
          trending: 'https://images.pexels.com/photos/3755707/pexels-photo-3755707.jpeg?auto=compress&cs=tinysrgb&w=600'
        };
        
        // Elegir imagen basada en la categoría o usar una genérica
        const placeholderImage = categoryPlaceholders[category?.toLowerCase() || 'general'] || 
                               'https://images.pexels.com/photos/264771/pexels-photo-264771.jpeg?auto=compress&cs=tinysrgb&w=600';
        
        console.log('Usando imagen de fallback de categoría:', category);
        setImageSrc(placeholderImage);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al usar imagen de fallback:", error);
        setError(true);
        setIsLoading(false);
      }
    };

    attemptToLoadImage();

    return () => {
      mounted = false;
    };
  }, [src, affiliateLink, category]);

  // Si hay un error o no se pudo cargar la imagen, mostrar un placeholder basado en la categoría
  if (error || !imageSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        {category?.toLowerCase().includes('ropa') || category?.toLowerCase().includes('moda') ? (
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        ) : category?.toLowerCase().includes('tech') || category?.toLowerCase().includes('electr') ? (
          <Gift className="h-12 w-12 text-gray-400" />
        ) : (
          <Package className="h-12 w-12 text-gray-400" />
        )}
      </div>
    );
  }

  // Si está cargando, mostrar un skeleton
  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-200 animate-pulse"></div>
    );
  }

  // Mostrar la imagen si todo está bien
  return (
        <img 
          src={imageSrc}
          alt={alt}
      className={`w-full h-full object-cover ${className || ''}`}
      onError={(e) => {
        console.error(`Error al cargar la imagen final: ${imageSrc}`);
        setError(true);
      }}
    />
  );
};

export default ProductImage; 