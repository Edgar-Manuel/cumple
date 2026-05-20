"""Esquemas Pydantic para validación"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ===== USER SCHEMAS =====
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ===== CONTACT SCHEMAS =====
class ContactBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None
    interests: Optional[str] = None
    affinity: Optional[float] = 5.0
    how_we_met: Optional[str] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None
    interests: Optional[str] = None
    affinity: Optional[float] = None
    how_we_met: Optional[str] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None

class Contact(ContactBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ===== EVENT SCHEMAS =====
class EventBase(BaseModel):
    title: str
    event_type: str
    date: datetime
    reminder_days: Optional[int] = 7
    notes: Optional[str] = None

class EventCreate(EventBase):
    contact_id: int

class EventUpdate(BaseModel):
    title: Optional[str] = None
    event_type: Optional[str] = None
    date: Optional[datetime] = None
    reminder_days: Optional[int] = None
    notes: Optional[str] = None
    is_completed: Optional[bool] = None

class Event(EventBase):
    id: int
    user_id: int
    contact_id: int
    is_completed: bool
    google_calendar_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ===== GIFT SCHEMAS =====
class GiftBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    affiliate_link: Optional[str] = None
    relevance: Optional[float] = 5.0

class GiftCreate(GiftBase):
    event_id: int

class Gift(GiftBase):
    id: int
    event_id: int
    is_purchased: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ===== MESSAGE SCHEMAS =====
class MessageBase(BaseModel):
    content: str
    message_type: str
    tone: Optional[str] = "friendly"

class MessageCreate(MessageBase):
    event_id: int

class Message(MessageBase):
    id: int
    event_id: int
    is_sent: bool
    sent_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ===== TOKEN SCHEMAS =====
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
