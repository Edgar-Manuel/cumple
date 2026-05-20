"""Servicio de IA para generación de contenido"""
import openai
from app.config import settings
from typing import Optional

# Configurar OpenAI
openai.api_key = settings.OPENAI_API_KEY

class AIService:
    """Servicio para generar contenido con OpenAI"""

    @staticmethod
    async def generate_gift_message(
        person_name: str,
        event_type: str,
        relationship: str,
        tone: str = "friendly",
        interests: Optional[str] = None
    ) -> str:
        """Generar mensaje personalizado para un regalo"""

        prompt = f"""Generate a heartfelt and personalized message for {person_name}'s {event_type}.

Relationship: {relationship}
Tone: {tone}
Interests: {interests if interests else 'Not specified'}

The message should:
- Be warm and genuine
- Feel written by a real person, not a machine
- Include a personal touch based on their interests
- Be appropriate for {tone} tone
- Be 2-3 sentences max

Just provide the message, nothing else."""

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=150
            )
            return response.choices[0].message.content
        except Exception as e:
            # Fallback si hay error
            return f"Happy {event_type}! Thinking of you and all the wonderful moments we share. 🎉"

    @staticmethod
    async def generate_gift_recommendations(
        person_name: str,
        age: Optional[int] = None,
        interests: Optional[str] = None,
        budget: Optional[float] = None,
        relationship: str = "friend"
    ) -> list:
        """Generar recomendaciones de regalos personalizadas"""

        budget_str = f"Budget: ${budget}" if budget else "Budget: Not specified"

        prompt = f"""Generate 3-5 gift recommendations for {person_name}.

Person Details:
- Name: {person_name}
- Age: {age if age else 'Unknown'}
- Interests: {interests if interests else 'General'}
- Relationship: {relationship}
- {budget_str}

For each recommendation, provide:
1. Gift name
2. Brief description (1 sentence)
3. Estimated price
4. Why they'd like it

Format as a numbered list."""

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            return "Unable to generate recommendations at this moment. Please try again later."

    @staticmethod
    async def generate_social_post(
        person_name: str,
        event_type: str,
        platform: str = "instagram"
    ) -> str:
        """Generar publicación para redes sociales"""

        platform_guidelines = {
            "instagram": "2-3 lines, use emojis, hashtags optional",
            "twitter": "Max 280 chars, catchy and fun",
            "facebook": "2-4 lines, warm and engaging",
            "whatsapp": "1-2 lines, personal and friendly"
        }

        guidelines = platform_guidelines.get(platform, "")

        prompt = f"""Create a {platform} post for {person_name}'s {event_type}.

Guidelines for {platform}: {guidelines}

Make it:
- Sincere but fun
- Personal and warm
- Appropriate for the platform
- Celebratory

Just provide the post text, nothing else."""

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=150
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Happy {event_type} to the amazing {person_name}! 🎉"
