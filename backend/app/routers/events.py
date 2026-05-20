"""Router de eventos"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Event, User, Contact
from app.schemas import Event as EventSchema, EventCreate, EventUpdate
from app.auth import get_current_active_user

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/", response_model=EventSchema)
def create_event(
    event: EventCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crear nuevo evento"""
    # Validar que el contacto existe y pertenece al usuario
    contact = db.query(Contact).filter(
        Contact.id == event.contact_id,
        Contact.user_id == current_user.id
    ).first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )

    db_event = Event(
        user_id=current_user.id,
        **event.dict()
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/", response_model=List[EventSchema])
def get_events(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    upcoming: bool = False,
    days: int = 7
):
    """Obtener eventos del usuario"""
    query = db.query(Event).filter(Event.user_id == current_user.id)

    if upcoming:
        now = datetime.utcnow()
        future = now + timedelta(days=days)
        query = query.filter(
            Event.date >= now,
            Event.date <= future,
            Event.is_completed == False
        )

    events = query.order_by(Event.date).all()
    return events

@router.get("/{event_id}", response_model=EventSchema)
def get_event(
    event_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtener evento específico"""
    db_event = db.query(Event).filter(
        Event.id == event_id,
        Event.user_id == current_user.id
    ).first()

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return db_event

@router.put("/{event_id}", response_model=EventSchema)
def update_event(
    event_id: int,
    event: EventUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualizar evento"""
    db_event = db.query(Event).filter(
        Event.id == event_id,
        Event.user_id == current_user.id
    ).first()

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    update_data = event.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)

    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Eliminar evento"""
    db_event = db.query(Event).filter(
        Event.id == event_id,
        Event.user_id == current_user.id
    ).first()

    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    db.delete(db_event)
    db.commit()
    return {"message": "Event deleted"}
