/**
 * Tipos TypeScript compartidos con el Backend API
 * Sincronizados con backend/app/schemas.py
 */

// ===== USER =====
export interface ApiUser {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserRegister {
  email: string;
  username: string;
  full_name?: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

// ===== CONTACT =====
export interface ApiContact {
  id: number;
  user_id: number;
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  interests?: string;
  affinity?: number;
  how_we_met?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactCreate {
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  interests?: string;
  affinity?: number;
  how_we_met?: string;
  notes?: string;
  photo_url?: string;
}

export type ContactUpdate = Partial<ContactCreate>;

// ===== EVENT =====
export type EventType = "birthday" | "anniversary" | "graduation" | "holiday" | "other";

export interface ApiEvent {
  id: number;
  user_id: number;
  contact_id: number;
  title: string;
  event_type: string;
  date: string;
  reminder_days: number;
  notes?: string;
  is_completed: boolean;
  google_calendar_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  contact_id: number;
  title: string;
  event_type: string;
  date: string;
  reminder_days?: number;
  notes?: string;
}

export interface EventUpdate {
  title?: string;
  event_type?: string;
  date?: string;
  reminder_days?: number;
  notes?: string;
  is_completed?: boolean;
}

// ===== GIFT =====
export interface ApiGift {
  id: number;
  event_id: number;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  affiliate_link?: string;
  relevance?: number;
  is_purchased: boolean;
  created_at: string;
}

export interface GiftCreate {
  event_id: number;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  affiliate_link?: string;
  relevance?: number;
}

// ===== MESSAGE =====
export interface ApiMessage {
  id: number;
  event_id: number;
  content: string;
  message_type: string;
  tone?: string;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
}

// ===== ERROR =====
export interface ApiError {
  detail: string;
  status_code?: number;
}
