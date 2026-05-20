"""Router de regalos"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Gift, Event, User
from app.schemas import Gift as GiftSchema, GiftCreate
from app.auth import get_current_active_user

router = APIRouter(prefix="/gifts", tags=["gifts"])

@router.post("/", response_model=GiftSchema)
def create_gift(
    gift: GiftCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crear nueva recomendación de regalo"""
    # Validar que el evento existe y pertenece al usuario
    event = db.query(Event).filter(
        Event.id == gift.event_id,
        Event.user_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    db_gift = Gift(**gift.dict())
    db.add(db_gift)
    db.commit()
    db.refresh(db_gift)
    return db_gift

@router.get("/event/{event_id}", response_model=List[GiftSchema])
def get_event_gifts(
    event_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtener regalos recomendados para un evento"""
    # Validar que el evento pertenece al usuario
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.user_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    gifts = db.query(Gift).filter(Gift.event_id == event_id).all()
    return gifts

@router.get("/{gift_id}", response_model=GiftSchema)
def get_gift(
    gift_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtener regalo específico"""
    db_gift = db.query(Gift).join(Event).filter(
        Gift.id == gift_id,
        Event.user_id == current_user.id
    ).first()

    if not db_gift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift not found"
        )
    return db_gift

@router.put("/{gift_id}")
def mark_gift_purchased(
    gift_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Marcar regalo como comprado"""
    db_gift = db.query(Gift).join(Event).filter(
        Gift.id == gift_id,
        Event.user_id == current_user.id
    ).first()

    if not db_gift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift not found"
        )

    db_gift.is_purchased = True
    db.commit()
    db.refresh(db_gift)
    return db_gift

@router.delete("/{gift_id}")
def delete_gift(
    gift_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Eliminar recomendación de regalo"""
    db_gift = db.query(Gift).join(Event).filter(
        Gift.id == gift_id,
        Event.user_id == current_user.id
    ).first()

    if not db_gift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift not found"
        )

    db.delete(db_gift)
    db.commit()
    return {"message": "Gift deleted"}
