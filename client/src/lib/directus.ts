import { createDirectus, rest, authentication } from '@directus/sdk';

// Directus Schema Types
export interface Webinar {
  id: number;
  title: string;
  description?: string;
  type: 'public' | 'private';
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  scheduled_at?: string;
  agora_channel_name?: string;
  agora_token?: string;
  creator_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface Factory {
  id: number;
  name: string;
  location?: string;
  category?: string;
  description?: string;
  score?: number;
  certifications?: string;
  created_at: string;
}

export interface Inquiry {
  id: number;
  buyer_id?: number;
  factory_id?: number;
  webinar_id?: number;
  product_name: string;
  quantity?: number;
  specifications?: string;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Quote {
  id: number;
  inquiry_id?: number;
  factory_id?: number;
  unit_price?: number;
  total_price?: number;
  moq?: number;
  lead_time_days?: number;
  notes?: string;
  status: 'sent' | 'accepted' | 'rejected' | 'negotiating';
  created_at: string;
}

export interface Order {
  id: number;
  quote_id?: number;
  buyer_id?: number;
  factory_id?: number;
  webinar_id?: number;
  amount?: number;
  commission_rate?: number;
  status: 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface WebinarParticipant {
  id: number;
  webinar_id?: number;
  user_id?: number;
  role: 'host' | 'presenter' | 'attendee';
  joined_at: string;
  left_at?: string;
}

// Schema definition for Directus SDK
export interface Schema {
  webinars: Webinar[];
  factories: Factory[];
  inquiries: Inquiry[];
  quotes: Quote[];
  orders: Order[];
  webinar_participants: WebinarParticipant[];
}

// Create Directus client
const directusUrl = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.cnsubscribe.xyz';

export const directus = createDirectus<Schema>(directusUrl)
  .with(authentication('json'))
  .with(rest());

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const token = await directus.getToken();
    return !!token;
  } catch {
    return false;
  }
};

// Helper function to login (for demo purposes, using mock credentials)
export const loginDemo = async () => {
  try {
    // For demo, we'll use a mock authentication
    // In production, this would be replaced with actual OAuth or email/password login
    console.log('Demo mode: Skipping authentication');
    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};
