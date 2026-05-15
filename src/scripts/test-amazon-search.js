// Script para probar la generación de recomendaciones de productos de Amazon
// Ejecutar con Node.js: node test-amazon-search.js

const https = require('https');
const { parse } = require('node-html-parser');

// Configuración
const AFFILIATE_TAG = 'cumple-21';
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
];

// Ejemplo de evento para pruebas
const sampleEvent = {
  id: 'event-123',
  title: 'Cumpleaños de Gianella',
  type: 'birthday',
  personName: 'Gianella',
  interests: 'tecnología, gadgets, música, ropa, deporte, cocina, lectura, viajes, fotografía, cine, videojuegos, mascotas, salud, belleza, automóviles, etc.'
};

// Función para obtener un User-Agent aleatorio
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Función para realizar búsqueda en Amazon
async function searchAmazonProducts(query, maxResults = 3) {
  return new Promise((resolve, reject) => {
    const searchUrl = `https://www.amazon.es/s?k=${encodeURIComponent(query)}`;
    
    const options = {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    };

    https.get(searchUrl, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const products = [];
          const root = parse(data);
          
          // Buscar elementos de producto
          const productElements = root.querySelectorAll('.s-result-item[data-asin]:not(.AdHolder)');
          
          for (let i = 0; i < Math.min(productElements.length, maxResults); i++) {
            const product = productElements[i];
            const asin = product.getAttribute('data-asin');
            
            if (!asin) continue;
            
            // Extraer título
            const titleElement = product.querySelector('h2 a span');
            const title = titleElement ? titleElement.text.trim() : 'Producto Amazon';
            
            // Extraer precio (simplificado)
            const priceElement = product.querySelector('.a-price .a-offscreen');
            const priceText = priceElement ? priceElement.text.trim() : '0,00 €';
            // Convertir precio de formato europeo a número
            const price = parseFloat(priceText.replace('€', '').replace('.', '').replace(',', '.').trim());
            
            // Extraer imagen
            const imgElement = product.querySelector('img.s-image');
            const imageUrl = imgElement ? imgElement.getAttribute('src') : '';
            
            // Crear enlace de afiliado
            const affiliateLink = `https://amazon.es/dp/${asin}?tag=${AFFILIATE_TAG}`;
            
            products.push({
              asin,
              title,
              price,
              imageUrl,
              affiliateLink
            });
          }
          
          resolve(products);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Función para generar descripciones personalizadas
function generatePersonalizedDescription(product, event) {
  return `Este ${product.title} es perfecto para ${event.personName} y su interés en ${event.interests.split(',')[0].trim()}. Un regalo ideal para celebrar su ${event.type === 'birthday' ? 'cumpleaños' : 'ocasión especial'}.`;
}

// Función para crear recomendaciones de regalo
function createGiftRecommendation(product, event, description = null) {
  const timestamp = Date.now();
  
  if (!description) {
    description = generatePersonalizedDescription(product, event);
  }
  
  return {
    id: `gift-${timestamp}-${product.asin}`,
    title: product.title,
    description: description,
    price: product.price,
    imageUrl: product.imageUrl,
    affiliateLink: product.affiliateLink,
    eventId: event.id,
    personName: event.personName
  };
}

// Función principal
async function main() {
  try {
    console.log('Buscando productos para:', sampleEvent.personName);
    console.log('Intereses:', sampleEvent.interests);
    console.log('-'.repeat(50));
    
    // Buscar productos basados en intereses
    const searchTerm = `${sampleEvent.interests.split(',')[0].trim()} regalo`;
    console.log(`Término de búsqueda: "${searchTerm}"`);
    
    const products = await searchAmazonProducts(searchTerm);
    console.log(`Se encontraron ${products.length} productos.`);
    
    if (products.length > 0) {
      // Crear recomendaciones de regalo
      const recommendations = products.map(product => 
        createGiftRecommendation(product, sampleEvent)
      );
      
      // Mostrar resultados
      console.log('\nRecomendaciones generadas:');
      console.log(JSON.stringify(recommendations, null, 2));
    } else {
      console.log('No se encontraron productos.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar el script
main(); 