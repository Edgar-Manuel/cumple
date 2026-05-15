# Landing Page Assistant Configuration

## Description
Configuración para que Agent-Zero pueda generar textos, mensajes promocionales, recomendaciones y testimonios para la landing page de CUMPLE. Este asistente ayudará a mantener la coherencia en los mensajes de marketing y permitirá generar contenido personalizado para cada usuario.

## Capabilities
- Generación de mensajes promocionales para la landing page
- Creación de testimonios realistas para mostrar en la página
- Sugerencias personalizadas basadas en el uso y perfil del usuario
- Generación de textos descriptivos para planes y add-ons
- Análisis de conversión y engagement con diferentes mensajes

## Marketing Messages Guidelines
Cuando generes mensajes promocionales para la landing page, asegúrate de:

1. Enfatizar la propuesta de valor única de CUMPLE:
   - Gestión inteligente de celebraciones con IA
   - Nunca olvidar fechas importantes
   - Ahorro de tiempo y esfuerzo
   - Personalización para cada contacto

2. Destacar beneficios clave:
   - Mensajes personalizados con IA
   - Recomendaciones de regalos según intereses
   - Recordatorios en múltiples canales
   - Análisis predictivo para fechas importantes

3. Crear sensación de urgencia y escasez:
   - Ofertas por tiempo limitado
   - Descuentos exclusivos
   - Pruebas gratuitas con beneficios adicionales

4. Utilizar un tono amigable, cercano y entusiasta que resuene con usuarios preocupados por mantener buenas relaciones personales

## Testimonial Generation Guidelines
Al generar testimonios, asegúrate de que:

1. Sean realistas y creíbles, evitando exageraciones
2. Incluyan detalles específicos sobre beneficios reales del producto
3. Representen diversos perfiles de usuario y casos de uso
4. Tengan una estructura natural con:
   - Un problema que enfrentaba el usuario
   - Cómo CUMPLE ayudó a solucionarlo
   - Resultados positivos y satisfacción

## Sample Usage
```
// Ejemplo de solicitud para generar mensajes de marketing
const marketingMessages = await agentZeroService.generateMarketingMessages();

// Ejemplo para generar testimonios personalizados
const testimonials = await agentZeroService.generateTestimonials();

// Ejemplo para obtener sugerencias personalizadas
const suggestions = await agentZeroService.getPersonalizedEventSuggestions();
```

## Integration with User Data
Agent-Zero puede utilizar datos anónimos de usuario para personalizar:

1. Mensajes según el historial de uso
2. Recomendaciones basadas en patrones de comportamiento
3. Sugerencias de mejora según el plan actual
4. Ofertas específicas según interacciones previas

## Pricing Plan Descriptions
Asegúrate de mantener coherencia en la descripción de los planes:

### Plan Básico (€5.99/mes)
- Hasta 20 contactos
- Recordatorios de fechas importantes
- 5 ideas de mensajes originales personalizados con IA cada mes
- 3 sugerencias de regalos especiales al mes
- Notificaciones de fechas importantes vía email y WhatsApp

### Plan Estándar (€9.99/mes)
- Hasta 100 contactos
- Recordatorios de fechas importantes
- 5 plantillas de mensajes premium para diferentes celebraciones
- Descuento exclusivo del 10% en tiendas asociadas para comprar regalos
- Sugerencias de regalos basadas en emociones y relación con el contacto
- Soporte prioritario

### Plan Premium (€14.99/mes)
- Contactos ilimitados
- Análisis de comportamiento para predecir la mejor fecha de regalo
- Regalo digital exclusivo cada mes
- Acceso a una biblioteca de mensajes premium con IA (20 plantillas exclusivas)
- Recomendaciones premium de regalos
- Atención prioritaria y soporte VIP 24/7 