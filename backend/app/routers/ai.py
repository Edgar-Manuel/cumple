"""Router de generación de contenido con IA"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Event, Contact, Message, Gift, User
from app.schemas import Message as MessageSchema, Gift as GiftSchema
from app.auth import get_current_active_user
from app.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])

# ===== REQUEST SCHEMAS =====
class GenerateMessageRequest(BaseModel):
    event_id: int
    tone: Optional[str] = "friendly"
    save: Optional[bool] = True

class GenerateRecommendationsRequest(BaseModel):
    event_id: int
    budget: Optional[float] = None
    save: Optional[bool] = True

class GenerateSocialPostRequest(BaseModel):
    event_id: int
    platform: str = "instagram"

class GeneratedContent(BaseModel):
    content: str

# ===== ENDPOINTS =====
@router.post("/messages/generate", response_model=MessageSchema)
async def generate_message(
    request: GenerateMessageRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Genera un mensaje personalizado para un evento"""
    event = db.query(Event).filter(
        Event.id == request.event_id,
        Event.user_id == current_user.id,
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    contact = db.query(Contact).filter(Contact.id == event.contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    content = await AIService.generate_gift_message(
        person_name=contact.name,
        event_type=event.event_type,
        relationship=contact.relationship or "friend",
        tone=request.tone,
        interests=contact.interests,
    )

    message = Message(
        event_id=event.id,
        content=content,
        message_type=event.event_type,
        tone=request.tone,
    )

    if request.save:
        db.add(message)
        db.commit()
        db.refresh(message)

    return message

@router.post("/gifts/recommendations", response_model=List[GiftSchema])
async def generate_gift_recommendations(
    request: GenerateRecommendationsRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Genera y guarda recomendaciones de regalos para un evento"""
    event = db.query(Event).filter(
        Event.id == request.event_id,
        Event.user_id == current_user.id,
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    contact = db.query(Contact).filter(Contact.id == event.contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    recommendations = await AIService.generate_gift_recommendations(
        person_name=contact.name,
        interests=contact.interests,
        event_interests=event.event_interests,
        previous_gifts=event.previous_gifts,
        affinity=contact.affinity,
        event_type=event.event_type or "birthday",
        budget=request.budget,
        relationship=contact.relationship or "friend",
    )

    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="No se pudieron generar recomendaciones.",
        )

    # Crear regalos en la BD
    created_gifts: list[Gift] = []
    for rec in recommendations:
        gift = Gift(
            event_id=event.id,
            title=rec.get("title", "Sin título"),
            description=rec.get("description"),
            price=rec.get("price"),
            category=rec.get("category"),
        )
        db.add(gift)
        created_gifts.append(gift)

    if request.save:
        db.commit()
        for gift in created_gifts:
            db.refresh(gift)

    return created_gifts

@router.post("/social/generate", response_model=GeneratedContent)
async def generate_social_post(
    request: GenerateSocialPostRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Genera contenido para redes sociales"""
    event = db.query(Event).filter(
        Event.id == request.event_id,
        Event.user_id == current_user.id,
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    contact = db.query(Contact).filter(Contact.id == event.contact_id).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    content = await AIService.generate_social_post(
        person_name=contact.name,
        event_type=event.event_type,
        platform=request.platform,
    )

    return GeneratedContent(content=content)

@router.get("/messages/event/{event_id}", response_model=List[MessageSchema])
async def list_event_messages(
    event_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Lista mensajes generados para un evento"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.user_id == current_user.id,
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return db.query(Message).filter(Message.event_id == event_id).all()
