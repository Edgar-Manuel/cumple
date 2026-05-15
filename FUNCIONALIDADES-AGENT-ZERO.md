# Funcionalidades Detalladas de Agent-Zero en CUMPLE

Este documento explica en detalle cómo Agent-Zero implementa y gestiona cada una de las funcionalidades principales de CUMPLE.

## 1. Gestión de Eventos

**Componentes implicados:**
- **Instrumentos**: `calendar_analyzer.py`, `event_scheduler.py`
- **Prompts**: `event_analysis.md`, `date_reminder.md`

**Funcionalidad:**
- Agent-Zero analiza el calendario del usuario para identificar eventos próximos
- Ordena los eventos por prioridad y proximidad
- Genera recordatorios automáticos
- Recomienda fechas óptimas para planificar nuevos eventos

**Endpoints clave:**
- `GET /review_calendar` - Analiza eventos próximos
- `POST /schedule_event` - Crea un nuevo evento con metadatos enriquecidos

## 2. Mensajes con IA (Premium)

**Componentes implicados:**
- **Instrumentos**: `message_generator.py`, `personality_analyzer.py`
- **Prompts**: `personalized_messages.md`, `writing_styles.md`

**Funcionalidad:**
- Analiza el perfil del destinatario (intereses, personalidad, historial)
- Genera mensajes personalizados adaptados al tipo de evento
- Incluye referencias personales basadas en la relación
- Ofrece diferentes estilos (formal, informal, humorístico, emocional)

**Endpoints clave:**
- `POST /generate_message` - Crea un mensaje personalizado para una ocasión
- `GET /message_styles` - Obtiene estilos disponibles para mensajes

## 3. Recomendaciones de Regalos

**Componentes implicados:**
- **Instrumentos**: `gift_recommender.py`, `interest_analyzer.py`
- **Prompts**: `gift_recommendations.md`, `interest_matching.md`

**Funcionalidad:**
- Analiza los intereses del contacto
- Identifica categorías de productos adecuados
- Genera recomendaciones personalizadas
- Incluye opciones en diferentes rangos de precio

**Endpoints clave:**
- `POST /generate_gift_recommendations` - Crea una lista de regalos recomendados
- `GET /recommendation_categories` - Obtiene categorías disponibles

## 4. Descuentos Exclusivos (Premium)

**Componentes implicados:**
- **Instrumentos**: `discount_finder.py`, `affiliate_manager.py`
- **Prompts**: `discount_search.md`

**Funcionalidad:**
- Conecta con APIs de tiendas asociadas
- Busca descuentos relevantes para las recomendaciones
- Genera códigos promocionales exclusivos
- Realiza seguimiento de conversiones para optimizar ofertas

**Endpoints clave:**
- `GET /available_discounts` - Obtiene descuentos disponibles
- `POST /apply_discount` - Aplica un descuento a una recomendación

## 5. Notificaciones Multicanal

**Componentes implicados:**
- **Instrumentos**: `notification_manager.py`, `channel_optimizer.py`
- **Prompts**: `notification_templates.md`

**Funcionalidad:**
- Gestiona envío de notificaciones por email
- Integra con la API de WhatsApp Business
- Determina el mejor momento para enviar cada notificación
- Personaliza el contenido según el canal

**Endpoints clave:**
- `POST /send_notification` - Envía una notificación a través de un canal específico
- `POST /schedule_notification` - Programa una notificación para el futuro

## 6. Análisis Predictivo (Premium)

**Componentes implicados:**
- **Instrumentos**: `behavior_analyzer.py`, `pattern_recognition.py`
- **Prompts**: `behavior_analysis.md`

**Funcionalidad:**
- Analiza patrones de respuesta de los contactos
- Predice las mejores fechas para enviar mensajes o regalos
- Sugiere momentos óptimos basados en comportamiento previo
- Identifica preferencias no explícitas

**Endpoints clave:**
- `GET /optimal_timing` - Obtiene el momento óptimo para una acción
- `POST /analyze_behavior` - Analiza el comportamiento de un contacto

## 7. Plantillas Premium (Premium)

**Componentes implicados:**
- **Instrumentos**: `template_manager.py`, `template_generator.py`
- **Prompts**: `premium_templates.md`

**Funcionalidad:**
- Ofrece una biblioteca de plantillas de alta calidad
- Permite personalización de plantillas existentes
- Genera nuevas plantillas basadas en tendencias
- Organiza plantillas por ocasión y estilo

**Endpoints clave:**
- `GET /available_templates` - Obtiene plantillas disponibles
- `POST /customize_template` - Personaliza una plantilla existente

## 8. Automatización Social (Premium)

**Componentes implicados:**
- **Instrumentos**: `social_publisher.py`, `content_adapter.py`
- **Prompts**: `social_post_templates.md`

**Funcionalidad:**
- Genera contenido optimizado para cada red social
- Programa publicaciones en momentos óptimos
- Adapta el mensaje al formato de cada plataforma
- Proporciona estadísticas de engagement

**Endpoints clave:**
- `POST /schedule_social_post` - Programa una publicación en redes sociales
- `GET /platform_formats` - Obtiene formatos optimizados para cada plataforma

## 9. Seguridad y Privacidad

**Componentes implicados:**
- **Instrumentos**: `data_protector.py`, `privacy_enforcer.py`
- **Configuración**: Políticas de cifrado y retención de datos

**Funcionalidad:**
- Cifrado de datos sensibles
- Anonimización de datos para el análisis
- Cumplimiento con regulaciones GDPR
- Gestión de consentimientos y preferencias

**Endpoints clave:**
- `GET /privacy_settings` - Obtiene configuración de privacidad actual
- `POST /update_consent` - Actualiza preferencias de consentimiento

## Integración con el Frontend

Agent-Zero expone todas estas funcionalidades a través de una API REST que el frontend de CUMPLE consume. Cada característica se activa según el plan del usuario, con verificaciones de permisos en cada endpoint.

La comunicación entre el frontend y Agent-Zero está configurada a través de la variable de entorno `VITE_AGENT_ZERO_URL` en el contenedor del frontend, que apunta al servicio `agent-zero` en la red de Docker. 