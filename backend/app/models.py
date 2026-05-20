"""Modelos de base de datos"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship as rel
from datetime import datetime
from app.database import Base

class User(Base):
    """Modelo de Usuario"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    contacts = rel("Contact", back_populates="user", cascade="all, delete-orphan")
    events = rel("Event", back_populates="user", cascade="all, delete-orphan")

class Contact(Base):
    """Modelo de Contacto"""
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    email = Column(String)
    phone = Column(String)
    relationship = Column(String)  # amigo, familia, pareja, etc.
    interests = Column(Text)  # JSON serializado
    affinity = Column(Float, default=5.0)  # 1-10
    how_we_met = Column(Text)
    notes = Column(Text)
    photo_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    user = rel("User", back_populates="contacts")
    events = rel("Event", back_populates="contact", cascade="all, delete-orphan")

class Event(Base):
    """Modelo de Evento"""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    title = Column(String, nullable=False)
    event_type = Column(String)  # cumpleaños, aniversario, graduación, etc.
    date = Column(DateTime, nullable=False, index=True)
    reminder_days = Column(Integer, default=7)
    notes = Column(Text)
    is_completed = Column(Boolean, default=False)
    google_calendar_id = Column(String)  # ID en Google Calendar
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    user = rel("User", back_populates="events")
    contact = rel("Contact", back_populates="events")
    gifts = rel("Gift", back_populates="event", cascade="all, delete-orphan")
    messages = rel("Message", back_populates="event", cascade="all, delete-orphan")

class Gift(Base):
    """Modelo de Regalo"""
    __tablename__ = "gifts"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float)
    category = Column(String)
    image_url = Column(String)
    affiliate_link = Column(String)
    relevance = Column(Float, default=5.0)  # 1-10
    is_purchased = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    event = rel("Event", back_populates="gifts")

class Message(Base):
    """Modelo de Mensaje Generado"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String)  # birthday, anniversary, graduation, etc.
    tone = Column(String)  # formal, friendly, intimate
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    event = rel("Event", back_populates="messages")
