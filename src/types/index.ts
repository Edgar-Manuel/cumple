// Definiciones de tipos para toda la aplicación

export interface Product {
  id: string | number;
  title: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  link: string;
  category?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  plan?: string;
  createdAt?: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isActive: boolean;
  description: string;
} 