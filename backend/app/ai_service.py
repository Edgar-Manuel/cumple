"""Servicio de IA para generación de contenido con OpenAI SDK >= 1.0"""
import json
import openai
from app.config import settings
from typing import Optional

# Cliente asíncrono de OpenAI (SDK moderno >= 1.0)
client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None


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
            return f"¡Feliz {event_type}, {person_name}! Pensando en ti y en todos los momentos maravillosos que compartimos. 🎉"

        prompt = (
            f"Generate a heartfelt and personalized message for {person_name}'s {event_type}.\n\n"
            f"Relationship: {relationship}\n"
            f"Tone: {tone}\n"
            f"Interests: {interests if interests else 'Not specified'}\n\n"
            "The message should:\n"
            "- Be warm and genuine\n"
            "- Feel written by a real person, not a machine\n"
            "- Include a personal touch based on their interests\n"
            "- Be appropriate for the specified tone\n"
            "- Be 2-3 sentences max\n\n"
            "Just provide the message, nothing else."
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
            return f"¡Feliz {event_type}, {person_name}! Pensando en ti y en todos los momentos maravillosos que compartimos. 🎉"

    @staticmethod
    async def generate_gift_recommendations(
        person_name: str,
        age: Optional[int] = None,
        interests: Optional[str] = None,
        budget: Optional[float] = None,
        relationship: str = "friend",
    ) -> list[dict]:
        """Generar recomendaciones de regalos como lista estructurada"""
        if not client:
            return []

        budget_str = f"Budget: ${budget}" if budget else "Budget: Not specified"

        prompt = (
            f"Generate exactly 5 gift recommendations for {person_name}.\n\n"
            f"Person Details:\n"
            f"- Name: {person_name}\n"
            f"- Age: {age if age else 'Unknown'}\n"
            f"- Interests: {interests if interests else 'General'}\n"
            f"- Relationship: {relationship}\n"
            f"- {budget_str}\n\n"
            "Return ONLY a valid JSON array (no markdown, no explanation) with this exact structure:\n"
            '[{"title": "Gift name", "description": "Brief 1-sentence description", "price": 29.99, "category": "Category name"}, ...]\n\n'
            "Make recommendations personalized and realistic."
        )

        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=800,
            )
            content = response.choices[0].message.content or ""
            # Limpiar markdown si viene envuelto en ```json ... ```
            content = content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
            recommendations = json.loads(content)
            if isinstance(recommendations, list):
                return recommendations[:5]
            return []
        except Exception:
            return []

    @staticmethod
    async def generate_social_post(
        person_name: str,
        event_type: str,
        platform: str = "instagram",
    ) -> str:
        """Generar publicación para redes sociales"""
        if not client:
            return f"¡Feliz {event_type} a la increíble {person_name}! 🎉"

        platform_guidelines = {
            "instagram": "2-3 lines, use emojis, hashtags optional",
            "twitter": "Max 280 chars, catchy and fun",
            "facebook": "2-4 lines, warm and engaging",
            "whatsapp": "1-2 lines, personal and friendly",
        }
        guidelines = platform_guidelines.get(platform, "")

        prompt = (
            f"Create a {platform} post for {person_name}'s {event_type}.\n\n"
            f"Guidelines for {platform}: {guidelines}\n\n"
            "Make it:\n"
            "- Sincere but fun\n"
            "- Personal and warm\n"
            "- Appropriate for the platform\n"
            "- Celebratory\n\n"
            "Just provide the post text, nothing else."
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
            return f"¡Feliz {event_type} a la increíble {person_name}! 🎉"
