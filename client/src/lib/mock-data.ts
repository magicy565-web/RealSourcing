// ============================================================
// RealSourcing Mock Data Store
// Provides complete mock data and state management for demo mode
// When Directus backend is ready, replace with real API calls
// ============================================================

export interface MockWebinar {
  id: number;
  title: string;
  description: string;
  type: 'one_on_one' | 'small_group' | 'medium' | 'large' | 'extra_large';
  scenario: 'general' | 'tiktok_dropshipper' | 'influencer_selection' | 'negotiation' | 'small_batch' | 'product_launch' | 'factory_tour' | 'industry_summit';
  visibility: 'public' | 'semi_public' | 'private';
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  scheduled_at: string;
  duration: number; // minutes
  category: string;
  language: string;
  agora_channel_name: string;
  agora_token?: string;
  cover_image?: string;
  max_participants: number;
  actual_participants: number;
  host_type: 'factory' | 'buyer';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MockFactory {
  id: number;
  name: string;
  location: string;
  category: string;
  description: string;
  score: number;
  certifications: string;
  logo?: string;
  images?: string[]; // Product/factory images (max 4)
  contact_email: string;
  contact_phone: string;
  employee_count: number;
  year_established: number;
  created_at: string;
}

export interface MockRegistration {
  id: number;
  webinar_id: number;
  user_name: string;
  user_email: string;
  company_name: string;
  role: 'factory' | 'buyer';
  status: 'pending' | 'approved' | 'rejected';
  registered_at: string;
  notes?: string;
}

export interface MockCommission {
  id: number;
  webinar_id: number;
  factory_id: number;
  factory_name: string;
  title: string;
  description: string;
  target_buyers: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  created_at: string;
}

// ============ Initial Mock Data ============

export const mockWebinars: MockWebinar[] = [
  {
    id: 1,
    title: "Smart Home Products Showcase 2026",
    description: "Explore the latest smart home innovations from top Chinese manufacturers. This webinar features live product demonstrations, real-time Q&A sessions, and exclusive pricing for international buyers.",
    type: "large",
    scenario: "product_launch",
    visibility: "public",
    status: "live",
    scheduled_at: new Date().toISOString(),
    duration: 90,
    category: "smart-home",
    language: "en",
    agora_channel_name: "webinar_smart_home_001",
    cover_image: "/covers/smarthome-showcase.png",
    max_participants: 50,
    actual_participants: 42,
    host_type: "factory",
    created_by: "admin",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Consumer Electronics Q1 Sourcing Fair",
    description: "Connect with verified electronics manufacturers for Q1 2026 procurement. Categories include mobile accessories, audio equipment, and wearable devices.",
    type: "large",
    scenario: "factory_tour",
    visibility: "public",
    status: "scheduled",
    scheduled_at: new Date(Date.now() + 3 * 86400000).toISOString(),
    duration: 120,
    category: "electronics",
    language: "en",
    agora_channel_name: "webinar_electronics_q1",
    cover_image: "/covers/medical-innovation.png",
    max_participants: 100,
    actual_participants: 0,
    host_type: "factory",
    created_by: "admin",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Sustainable Packaging Solutions",
    description: "Discover eco-friendly packaging alternatives from certified green manufacturers. Topics include biodegradable materials, recycled packaging, and carbon-neutral shipping solutions.",
    type: "medium",
    scenario: "general",
    visibility: "semi_public",
    status: "completed",
    scheduled_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    duration: 60,
    category: "consumer-goods",
    language: "en",
    agora_channel_name: "webinar_packaging_green",
    cover_image: "/covers/sustainable-textiles.png",
    max_participants: 30,
    actual_participants: 28,
    host_type: "factory",
    created_by: "admin",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 5,
    title: "Global Sources Hong Kong Show Tour",
    description: "A comprehensive tour of the Global Sources Hong Kong show, featuring top electronics and lifestyle suppliers.",
    type: "large",
    scenario: "industry_summit",
    visibility: "public",
    status: "completed",
    scheduled_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    duration: 33,
    category: "electronics",
    language: "en",
    agora_channel_name: "webinar_hk_show_tour",
    cover_image: "/global-sources-tour.png",
    max_participants: 200,
    actual_participants: 156,
    host_type: "factory",
    created_by: "admin",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 4,
    title: "LED Lighting Solutions 2026",
    description: "Annual LED lighting sourcing event featuring the newest energy-efficient lighting technologies, smart lighting systems, and commercial lighting solutions.",
    type: "medium",
    scenario: "general",
    visibility: "semi_public",
    status: "scheduled",
    scheduled_at: new Date(Date.now() + 8 * 86400000).toISOString(),
    duration: 90,
    category: "electronics",
    language: "zh",
    agora_channel_name: "webinar_led_2026",
    cover_image: "/led-lighting-solutions.png",
    max_participants: 40,
    actual_participants: 0,
    host_type: "factory",
    created_by: "admin",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  // 小组会议 - TikTok/Dropshipper 产品对接
  {
    id: 6,
    title: "TikTok Hot Products Sourcing Session",
    description: "Fast-track sourcing for TikTok Shop sellers. Connect with 5 verified factories offering low MOQ (100-500 units), fast sampling (7-14 days), and dropshipping support. Perfect for trending products like beauty tools, phone accessories, and home gadgets.",
    type: "small_group",
    scenario: "tiktok_dropshipper",
    visibility: "private",
    status: "scheduled",
    scheduled_at: new Date(Date.now() + 1 * 86400000).toISOString(),
    duration: 60,
    category: "consumer-goods",
    language: "en",
    agora_channel_name: "webinar_tiktok_001",
    cover_image: "/covers/tiktok-sourcing.png",
    max_participants: 8,
    actual_participants: 0,
    host_type: "buyer",
    created_by: "buyer_tiktok_seller",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  // 小组会议 - 网红达人选品对接
  {
    id: 7,
    title: "Influencer Product Selection - Beauty & Personal Care",
    description: "Exclusive product selection session for verified influencers (50K+ followers). 8 beauty manufacturers will showcase their latest products, offer exclusive pricing, and discuss commission structures. Perfect for live streaming and social commerce.",
    type: "small_group",
    scenario: "influencer_selection",
    visibility: "private",
    status: "scheduled",
    scheduled_at: new Date(Date.now() + 2 * 86400000).toISOString(),
    duration: 90,
    category: "beauty",
    language: "zh",
    agora_channel_name: "webinar_influencer_001",
    cover_image: "/covers/influencer-selection.png",
    max_participants: 10,
    actual_participants: 0,
    host_type: "buyer",
    created_by: "influencer_beauty_queen",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const mockFactories: MockFactory[] = [
  {
    id: 1,
    name: "Shenzhen Electronics Co., Ltd.",
    location: "Shenzhen, Guangdong",
    category: "Electronics",
    description: "Leading manufacturer of consumer electronics and smart home devices with 15+ years of export experience.",
    score: 92,
    certifications: "ISO 9001, ISO 14001, CE, FCC",
    logo: "/logos/shenzhen-electronics.png",
    images: [
      "/factory-images/electronics1.jpg",
      "/factory-images/electronics2.webp",
      "/factory-images/workshop2.jpg",
      "/factory-images/workshop1.jpg"
    ],
    contact_email: "export@szelectronics.cn",
    contact_phone: "+86-755-8888-0001",
    employee_count: 2500,
    year_established: 2008,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 2,
    name: "Guangzhou Smart Home Ltd.",
    location: "Guangzhou, Guangdong",
    category: "Smart Home",
    description: "Specializing in IoT-enabled home automation products including smart locks, sensors, and control systems.",
    score: 88,
    certifications: "ISO 9001, CE, UL",
    logo: "/logos/guangzhou-smarthome.png",
    contact_email: "sales@gzsmarthome.cn",
    contact_phone: "+86-20-8888-0002",
    employee_count: 800,
    year_established: 2015,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 3,
    name: "Dongguan Manufacturing Group",
    location: "Dongguan, Guangdong",
    category: "Consumer Goods",
    description: "Full-service OEM/ODM manufacturer for household products, kitchenware, and personal care items.",
    score: 85,
    certifications: "ISO 9001, BSCI, FDA",
    logo: "/logos/dongguan-manufacturing.png",
    contact_email: "inquiry@dgmanufacturing.cn",
    contact_phone: "+86-769-8888-0003",
    employee_count: 3200,
    year_established: 2003,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 4,
    name: "Foshan Furniture Works",
    location: "Foshan, Guangdong",
    category: "Furniture",
    description: "Premium furniture manufacturer specializing in modern office and home furniture with sustainable materials.",
    score: 79,
    certifications: "ISO 9001, FSC, CARB",
    logo: "/logos/foshan-furniture.png",
    contact_email: "export@foshanfurniture.cn",
    contact_phone: "+86-757-8888-0004",
    employee_count: 1500,
    year_established: 2010,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 5,
    name: "Ningbo Textile Corp.",
    location: "Ningbo, Zhejiang",
    category: "Textiles",
    description: "High-quality textile and garment manufacturer with advanced dyeing and printing capabilities.",
    score: 91,
    certifications: "ISO 9001, OEKO-TEX, GOTS",
    logo: "/logos/ningbo-textiles.png",
    images: [
      "/factory-images/workshop1.jpg",
      "/factory-images/workshop2.jpg",
      "/factory-images/electronics1.jpg"
    ],
    contact_email: "trade@nbtextile.cn",
    contact_phone: "+86-574-8888-0005",
    employee_count: 4000,
    year_established: 2001,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 6,
    name: "Shanghai Medical Tech",
    location: "Shanghai, China",
    category: "Medical Devices",
    description: "High-tech medical device manufacturer specializing in diagnostic and surgical equipment.",
    score: 94,
    certifications: "ISO 13485, CE, FDA",
    logo: "/logos/shanghai-medical.png",
    images: [
      "/factory-images/medical1.png",
      "/factory-images/medical2.png",
      "/factory-images/workshop1.jpg",
      "/factory-images/workshop2.jpg"
    ],
    contact_email: "info@shanghaimedical.cn",
    contact_phone: "+86-21-8888-0006",
    employee_count: 1200,
    year_established: 2008,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// User avatars mapping (mix of real photos and virtual avatars)
export const userAvatars: Record<string, string> = {
  "John Smith": "/avatars/john-smith.png",
  "Sarah Chen": "/avatars/sarah-chen.png",
  "Wang Lei": "/avatars/wang-lei.png",
  "Li Ming": "/avatars/li-ming.png",
  "Ahmed Hassan": "/avatars/ahmed-hassan.png",
  "Maria Garcia": "/avatars/maria-garcia.png",
  "Zhang Wei": "/avatars/zhang-wei.png",
  "Emma Wilson": "/avatars/emma-wilson.png",
};

// Fallback avatar placeholders by role
export const getAvatarByRole = (role: 'factory' | 'buyer' | 'admin', name?: string): string => {
  if (name && userAvatars[name]) {
    return userAvatars[name];
  }
  const placeholders = {
    factory: "/avatar-placeholder-factory.png",
    buyer: "/avatar-placeholder-buyer.png",
    admin: "/avatar-placeholder-admin.png",
  };
  return placeholders[role];
};

export const mockRegistrations: MockRegistration[] = [
  { id: 1, webinar_id: 1, user_name: "John Smith", user_email: "john@globalbuyers.com", company_name: "Global Buyers Inc.", role: "buyer", status: "approved", registered_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 2, webinar_id: 1, user_name: "Sarah Chen", user_email: "sarah@techimports.eu", company_name: "Tech Imports EU", role: "buyer", status: "approved", registered_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 3, webinar_id: 1, user_name: "Wang Lei", user_email: "wang@szelectronics.cn", company_name: "Shenzhen Electronics Co.", role: "factory", status: "approved", registered_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 4, webinar_id: 1, user_name: "Li Ming", user_email: "li@gzsmarthome.cn", company_name: "Guangzhou Smart Home Ltd.", role: "factory", status: "approved", registered_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 5, webinar_id: 2, user_name: "Ahmed Hassan", user_email: "ahmed@metrading.ae", company_name: "ME Trading LLC", role: "buyer", status: "pending", registered_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 6, webinar_id: 2, user_name: "Maria Garcia", user_email: "maria@latamgoods.br", company_name: "LatAm Goods", role: "buyer", status: "pending", registered_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 7, webinar_id: 2, user_name: "Zhang Wei", user_email: "zhang@dgmanufacturing.cn", company_name: "Dongguan Manufacturing", role: "factory", status: "approved", registered_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 8, webinar_id: 3, user_name: "Emma Wilson", user_email: "emma@greenpack.uk", company_name: "GreenPack UK", role: "buyer", status: "approved", registered_at: new Date(Date.now() - 10 * 86400000).toISOString() },
];

export const mockCommissions: MockCommission[] = [
  { id: 1, webinar_id: 1, factory_id: 1, factory_name: "Shenzhen Electronics Co.", title: "Smart Switch Series Showcase", description: "Presenting our new WiFi-enabled smart switch series with voice control support.", target_buyers: "Home automation distributors", status: "approved", created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 2, webinar_id: 1, factory_id: 2, factory_name: "Guangzhou Smart Home Ltd.", title: "IoT Sensor Bundle", description: "Complete IoT sensor package for smart home integration.", target_buyers: "Smart home retailers", status: "approved", created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 3, webinar_id: 2, factory_id: 3, factory_name: "Dongguan Manufacturing", title: "Eco-Friendly Phone Cases", description: "Biodegradable phone cases made from plant-based materials.", target_buyers: "Mobile accessories importers", status: "pending", created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
];

// ============ Mock Data Store (In-Memory State Management) ============

class MockDataStore {
  private webinars: MockWebinar[] = [...mockWebinars];
  private factories: MockFactory[] = [...mockFactories];
  private registrations: MockRegistration[] = [...mockRegistrations];
  private commissions: MockCommission[] = [...mockCommissions];
  private nextWebinarId = 5;
  private nextRegistrationId = 9;
  private nextCommissionId = 4;

  // ---- Webinars ----
  getWebinars(status?: string): MockWebinar[] {
    if (status && status !== 'all') {
      return this.webinars.filter(w => w.status === status);
    }
    return [...this.webinars].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getWebinarById(id: number): MockWebinar | undefined {
    return this.webinars.find(w => w.id === id);
  }

  createWebinar(data: Partial<MockWebinar>): MockWebinar {
    const newWebinar: MockWebinar = {
      id: this.nextWebinarId++,
      title: data.title || 'Untitled Webinar',
      description: data.description || '',
      type: data.type || 'public',
      status: data.status || 'scheduled',
      scheduled_at: data.scheduled_at || new Date().toISOString(),
      duration: data.duration || 60,
      category: data.category || 'other',
      language: data.language || 'en',
      agora_channel_name: `webinar_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      max_participants: data.max_participants || 50,
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.webinars.unshift(newWebinar);
    return newWebinar;
  }

  updateWebinar(id: number, data: Partial<MockWebinar>): MockWebinar | undefined {
    const index = this.webinars.findIndex(w => w.id === id);
    if (index === -1) return undefined;
    this.webinars[index] = { ...this.webinars[index], ...data, updated_at: new Date().toISOString() };
    return this.webinars[index];
  }

  deleteWebinar(id: number): boolean {
    const index = this.webinars.findIndex(w => w.id === id);
    if (index === -1) return false;
    this.webinars.splice(index, 1);
    return true;
  }

  // ---- Factories ----
  getFactories(search?: string): MockFactory[] {
    if (search) {
      const q = search.toLowerCase();
      return this.factories.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q)
      );
    }
    return [...this.factories].sort((a, b) => b.score - a.score);
  }

  getFactoryById(id: number): MockFactory | undefined {
    return this.factories.find(f => f.id === id);
  }

  // ---- Registrations ----
  getRegistrations(webinarId?: number): MockRegistration[] {
    if (webinarId) {
      return this.registrations.filter(r => r.webinar_id === webinarId);
    }
    return [...this.registrations];
  }

  getRegistrationsByStatus(webinarId: number, status: string): MockRegistration[] {
    return this.registrations.filter(r => r.webinar_id === webinarId && r.status === status);
  }

  createRegistration(data: Partial<MockRegistration>): MockRegistration {
    const newReg: MockRegistration = {
      id: this.nextRegistrationId++,
      webinar_id: data.webinar_id || 0,
      user_name: data.user_name || '',
      user_email: data.user_email || '',
      company_name: data.company_name || '',
      role: data.role || 'buyer',
      status: 'pending',
      registered_at: new Date().toISOString(),
      notes: data.notes,
    };
    this.registrations.push(newReg);
    return newReg;
  }

  updateRegistrationStatus(id: number, status: 'approved' | 'rejected'): MockRegistration | undefined {
    const reg = this.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = status;
    }
    return reg;
  }

  // ---- Commissions ----
  getCommissions(webinarId?: number): MockCommission[] {
    if (webinarId) {
      return this.commissions.filter(c => c.webinar_id === webinarId);
    }
    return [...this.commissions];
  }

  createCommission(data: Partial<MockCommission>): MockCommission {
    const newComm: MockCommission = {
      id: this.nextCommissionId++,
      webinar_id: data.webinar_id || 0,
      factory_id: data.factory_id || 0,
      factory_name: data.factory_name || '',
      title: data.title || '',
      description: data.description || '',
      target_buyers: data.target_buyers || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.commissions.push(newComm);
    return newComm;
  }

  updateCommissionStatus(id: number, status: 'approved' | 'rejected' | 'active'): MockCommission | undefined {
    const comm = this.commissions.find(c => c.id === id);
    if (comm) {
      comm.status = status;
    }
    return comm;
  }

  // ---- Dashboard Stats ----
  getDashboardStats() {
    return {
      activeWebinars: this.webinars.filter(w => w.status === 'live').length,
      scheduledWebinars: this.webinars.filter(w => w.status === 'scheduled').length,
      totalFactories: this.factories.length,
      totalRegistrations: this.registrations.filter(r => r.status === 'approved').length,
      pendingReviews: this.registrations.filter(r => r.status === 'pending').length + this.commissions.filter(c => c.status === 'pending').length,
    };
  }
}

// Singleton instance
export const mockStore = new MockDataStore();
