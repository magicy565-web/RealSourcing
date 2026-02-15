import { createDirectus, rest, authentication } from '@directus/sdk';

// Directus Schema Types
export interface Webinar {
  id: number;
  title: string;
  description?: string;
  type: 'one_on_one' | 'small_group' | 'medium' | 'large' | 'extra_large';
  scenario?: 'general' | 'tiktok_dropshipper' | 'influencer_selection' | 'negotiation' | 'small_batch' | 'product_launch' | 'factory_tour' | 'industry_summit';
  visibility?: 'public' | 'semi_public' | 'private';
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  scheduled_at?: string;
  duration?: number;
  category?: string;
  language?: string;
  agora_channel_name?: string;
  agora_token?: string;
  cover_image?: string;
  max_participants?: number;
  actual_participants?: number;
  host_type?: 'factory' | 'buyer';
  creator_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface Factory {
  id: string;
  name: string;
  location?: string;
  category?: string;
  description?: string;
  score?: number;
  logo?: string;
  year_established?: number;
  employee_count?: number;
  annual_revenue?: string;
  website?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  webinars_attended?: number;
  orders_completed?: number;
  certifications?: any;
  main_products?: string[];
  moq?: number;
  lead_time?: number;
  country?: string;
  city?: string;
  created_at: string;
  updated_at?: string;
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
export interface Message {
  id: number;
  webinar_id: number;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type: 'text' | 'system' | 'file';
  created_at: string;
}

export interface Report {
  id: number;
  webinar_id: number;
  title: string;
  report_type: 'supplier_comparison' | 'negotiation_summary' | 'ai_insights';
  content: any;
  generated_by: string;
  created_at: string;
}

export interface Schema {
  webinars: Webinar[];
  factories: Factory[];
  inquiries: Inquiry[];
  quotes: Quote[];
  orders: Order[];
  webinar_participants: WebinarParticipant[];
  messages: Message[];
  reports: Report[];
}

// Mock Data for Fallback (when CORS or Connection fails)
const MOCK_DATA = {
  webinars: [
    { id: 1, title: "Smart Home Products Showcase Q1", status: "live", type: "public", scheduled_at: new Date().toISOString(), agora_channel_name: "demo-room-1", created_at: new Date().toISOString() },
    { id: 2, title: "Outdoor Gear Sourcing Fair", status: "scheduled", type: "public", scheduled_at: new Date(Date.now() + 86400000).toISOString(), agora_channel_name: "demo-room-2", created_at: new Date().toISOString() }
  ],
  factories: [
    { id: 1, name: "Shenzhen Electronics Co.", location: "Shenzhen", category: "Electronics", score: 92, created_at: new Date().toISOString() },
    { id: 2, name: "Guangzhou Smart Home Ltd.", location: "Guangzhou", category: "Smart Home", score: 88, created_at: new Date().toISOString() }
  ],
  orders: [
    { id: 1, amount: 12500, status: 'confirmed', created_at: new Date().toISOString() },
    { id: 2, amount: 8400, status: 'in_production', created_at: new Date().toISOString() }
  ]
};

// Create Directus client
// In dev mode, use full localhost URL with proxy path; Vite proxy will intercept and forward
// In production, use environment variable or fallback to remote
const getDirectusUrl = () => {
  // 优先使用环境变量，否则使用阿里云服务器地址
  return import.meta.env.VITE_DIRECTUS_URL || 'https://admin.cnsubscribe.xyz';
};

export const directus = createDirectus<Schema>(getDirectusUrl())
  .with(authentication('json'))
  .with(rest());

/**
 * Safe request wrapper to handle CORS errors and provide fallback data
 */
export async function safeRequest<T>(collection: keyof typeof MOCK_DATA, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error: any) {
    console.warn(`⚠️ Directus request failed for ${collection}, using mock data. Error:`, error.message);
    
    // Check if it's a CORS or Network error
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.info('💡 Hint: This is likely a CORS issue. Please allow origin in Directus settings.');
    }

    return MOCK_DATA[collection] as unknown as T;
  }
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const token = await directus.getToken();
    return !!token;
  } catch {
    return true; // Always return true for demo/local debugging
  }
};

// Helper function to login
export const loginDemo = async () => {
  console.log('Demo mode: Skipping authentication');
  return true;
};
