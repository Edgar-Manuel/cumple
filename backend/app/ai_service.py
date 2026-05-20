"""Servicio de IA para generación de contenido con OpenAI SDK >= 1.0"""
import json
from typing import Optional

try:
    import openai
    _has_openai = True
except ImportError:
    _has_openai = False

from app.config import settings

client = None
if _has_openai and settings.OPENAI_API_KEY:
    client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


EVENT_TYPE_ES = {
    "birthday": "cumpleaños",
    "anniversary": "aniversario",
    "graduation": "graduación",
    "holiday": "celebración",
    "other": "evento especial",
}


def _es_event(event_type: str) -> str:
    return EVENT_TYPE_ES.get(event_type, event_type)


class AIService:
    """Servicio para generar contenido con OpenAI"""

    @staticmethod
    async def generate_gift_message(
        person_name: str,
        event_type: str,
        relationship: str,
        tone: str = "friendly",
        interests: Optional[str] = None,
    ) -> str:
        """Generar mensaje personalizado para un evento"""
        if not client:
            return f"¡Feliz {_es_event(event_type)}, {person_name}! Pensando en ti y en todos los momentos maravillosos que compartimos. 🎉"

        prompt = (
            f"Genera un mensaje personalizado y emotivo en español para el {_es_event(event_type)} de {person_name}.\n\n"
            f"Relación: {relationship}\n"
            f"Tono: {tone}\n"
            f"Intereses: {interests if interests else 'No especificados'}\n\n"
            "El mensaje debe:\n"
            "- Ser cálido y genuino\n"
            "- Sentirse escrito por una persona real\n"
            "- Incluir un toque personal basado en los intereses\n"
            "- Ser apropiado para el tono indicado\n"
            "- Tener máximo 2-3 oraciones\n\n"
            "Devuelve solo el mensaje, sin comentarios adicionales."
        )

        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=150,
            )
            return response.choices[0].message.content or ""
        except Exception:
            return f"¡Feliz {_es_event(event_type)}, {person_name}! Pensando en ti y en todos los momentos maravillosos que compartimos. 🎉"

    @staticmethod
    async def generate_gift_recommendations(
        person_name: str,
        age: Optional[int] = None,
        interests: Optional[str] = None,
        event_interests: Optional[str] = None,
        previous_gifts: Optional[str] = None,
        affinity: Optional[float] = None,
        event_type: str = "birthday",
        budget: Optional[float] = None,
        relationship: str = "friend",
    ) -> list[dict]:
        """Generar recomendaciones de regalos como lista estructurada."""
        if not client:
            return _fallback_recommendations(event_type, budget)

        # Affinity (1-10) sugiere rango de inversión y profundidad personal
        affinity_hint = ""
        if affinity is not None:
            if affinity >= 8:
                affinity_hint = "Relación muy cercana: regalos personales y significativos."
            elif affinity >= 5:
                affinity_hint = "Relación cercana: regalos atentos pero no íntimos."
            else:
                affinity_hint = "Relación cordial: regalos prácticos o de detalle."

        budget_str = f"Presupuesto: ${budget}" if budget else "Presupuesto: No especificado"

        prompt = (
            f"Genera exactamente 5 recomendaciones de regalo en español para {person_name}.\n\n"
            f"Contexto:\n"
            f"- Evento: {_es_event(event_type)}\n"
            f"- Relación: {relationship}\n"
            f"- Edad: {age if age else 'desconocida'}\n"
            f"- Intereses del contacto: {interests or 'sin datos'}\n"
            f"- Intereses específicos para este evento: {event_interests or 'sin datos'}\n"
            f"- Regalos ya entregados (EVITAR repetir): {previous_gifts or 'ninguno conocido'}\n"
            f"- {affinity_hint}\n"
            f"- {budget_str}\n\n"
            "Devuelve SOLO un JSON array válido (sin markdown, sin texto extra) con esta estructura exacta:\n"
            '[{"title": "Nombre del regalo", "description": "Descripción breve en 1 oración", "price": 29.99, "category": "Categoría"}, ...]\n\n'
            "Las recomendaciones deben ser personalizadas, realistas y diferentes a los regalos ya entregados."
        )

        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=800,
            )
            content = response.choices[0].message.content or ""
            content = content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
            recommendations = json.loads(content)
            if isinstance(recommendations, list):
                return recommendations[:5]
            return _fallback_recommendations(event_type, budget)
        except Exception:
            return _fallback_recommendations(event_type, budget)

    @staticmethod
    async def generate_social_post(
        person_name: str,
        event_type: str,
        platform: str = "instagram",
    ) -> str:
        """Generar publicación para redes sociales"""
        if not client:
            return f"¡Feliz {_es_event(event_type)} a la increíble {person_name}! 🎉"

        platform_guidelines = {
            "instagram": "2-3 líneas, usa emojis, hashtags opcionales",
            "twitter": "Máx 280 caracteres, pegadizo y divertido",
            "facebook": "2-4 líneas, cálido y conmovedor",
            "whatsapp": "1-2 líneas, personal y amigable",
        }
        guidelines = platform_guidelines.get(platform, "")

        prompt = (
            f"Crea una publicación en español para {platform} sobre el {_es_event(event_type)} de {person_name}.\n\n"
            f"Pautas para {platform}: {guidelines}\n\n"
            "Debe ser:\n"
            "- Sincero pero divertido\n"
            "- Personal y cálido\n"
            "- Apropiado para la plataforma\n"
            "- Celebratorio\n\n"
            "Devuelve solo el texto de la publicación, sin comentarios adicionales."
        )

        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=150,
            )
            return response.choices[0].message.content or ""
        except Exception:
            return f"¡Feliz {_es_event(event_type)} a la increíble {person_name}! 🎉"


def _fallback_recommendations(event_type: str, budget: Optional[float]) -> list[dict]:
    """Recomendaciones genéricas cuando no hay OPENAI_API_KEY o la API falla."""
    base_price = budget if budget and budget > 0 else 35.0
    return [
        {
            "title": "Libro personalizado",
            "description": "Un libro elegido a partir de sus intereses, con dedicatoria personal.",
            "price": round(base_price * 0.6, 2),
            "category": "Libros",
        },
        {
            "title": "Experiencia gastronómica",
            "description": "Cena en un restaurante favorito o cata temática para dos.",
            "price": round(base_price * 1.5, 2),
            "category": "Experiencias",
        },
        {
            "title": "Caja sorpresa artesanal",
            "description": "Selección curada de productos locales y artesanos.",
            "price": round(base_price, 2),
            "category": "Detalles",
        },
        {
            "title": "Set de bienestar",
            "description": "Kit con velas aromáticas, té premium y productos de cuidado personal.",
            "price": round(base_price * 0.8, 2),
            "category": "Bienestar",
        },
        {
            "title": "Suscripción mensual",
            "description": "Suscripción de 3 meses a una caja temática alineada con sus intereses.",
            "price": round(base_price * 1.2, 2),
            "category": "Suscripciones",
        },
    ]
