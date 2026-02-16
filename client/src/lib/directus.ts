import { createDirectus, rest, authentication } from '@directus/sdk';

// Directus Schema Types
export interface Webinar {
  id: number;
  title: string;
  description?: string;
  type: 'one_on_one' | 'small_group' | 'medium' | 'large' | 'extra_large' | 'webinar' | 'group';
  scenario?: 'general' | 'tiktok_dropshipper' | 'influencer_selection' | 'negotiation' | 'small_batch' | 'product_launch' | 'factory_tour' | 'industry_summit';
  visibility?: 'public' | 'semi_public' | 'private';
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  // TikTok 选品会议相关字段
  meeting_type?: 'standard' | 'sourcing'; // 区分传统会议和选品会议
  size?: 'small' | 'large'; // 小型/大型
  factory_id?: number; // 主办工厂 ID
  product_ids?: number[]; // 选择的产品 ID 列表
  product_count?: number; // 产品数量
  // 支持两种命名风格：camelCase (从 Directus API) 和 snake_case (旧版本)
  scheduledAt?: string;
  scheduled_at?: string;
  duration?: number;
  category?: string;
  language?: string;
  agoraChannelName?: string;
  agora_channel_name?: string;
  agoraToken?: string;
  agora_token?: string;
  coverImage?: string;
  cover_image?: string;
  maxParticipants?: number;
  max_participants?: number;
  currentParticipants?: number;
  actual_participants?: number;
  participants_count?: number;
  hostType?: 'factory' | 'buyer';
  host_type?: 'factory' | 'buyer';
  creatorId?: number;
  creator_id?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  deletedAt?: string | null;
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
  // 产品管理相关
  product_count?: number;
  webinar_count?: number;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
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

// TikTok 选品会议 - 产品相关类型
export interface Product {
  id: number;
  factory_id: number; // 归属工厂 ID
  webinar_id?: number; // 可选，用于会议关联
  name: string;
  price: number;
  currency: string;
  moq: number; // 最小起订量
  lead_time: string; // 交期（如 "7-10 days"）
  images: string[]; // 产品图片 URL 数组
  description?: string;
  specs?: any; // 产品规格（JSON 对象）
  category?: string;
  stock?: number;
  favorite_count: number; // 收藏数
  inquiry_count: number; // 询价数
  view_count: number; // 浏览数
  status: 'active' | 'inactive'; // 状态
  created_at: string;
  updated_at?: string;
  created_by?: string; // 创建者（管理员 ID）
}

// 会议产品关联表
export interface WebinarProduct {
  id: number;
  webinar_id: number;
  product_id: number;
  display_order: number; // 展示顺序
  created_at: string;
}

// 产品互动记录（收藏、询价、浏览）
export interface ProductInteraction {
  id: number;
  webinar_id: number;
  product_id: number;
  user_id: string; // 用户 ID（卖家）
  user_name?: string; // 用户名称
  type: 'view' | 'favorite' | 'inquiry'; // 互动类型
  metadata?: any; // 额外信息（如询价数量、目标价格等）
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
  products: Product[]; // TikTok 选品会议产品
  product_interactions: ProductInteraction[]; // 产品互动记录
  webinar_products: WebinarProduct[]; // 会议产品关联
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
