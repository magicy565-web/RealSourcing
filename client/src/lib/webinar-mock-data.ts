// ─── RealSourcing Webinar Mock Data ───────────────────────────────────────
// 高质量演示数据，用于确保 Demo 100% 真实可信

export type MockWebinarStatus = "live" | "scheduled" | "completed" | "draft";

export interface MockAgendaItem {
  id: string;
  time: string;
  duration: number;
  title: string;
  titleEn: string;
  speaker: string;
  speakerTitle: string;
  description: string;
  type: "intro" | "product" | "factory_tour" | "qa" | "networking" | "break";
}

export interface MockProduct {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  price: string;
  moq: string;
  category: string;
  material: string;
  certification: string[];
  leadTime: string;
  factoryName: string;
  factoryId: string;
  highlight: string;
  rating: number;
  reviewCount: number;
}

export interface MockFactory {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  location: string;
  established: number;
  employees: string;
  annualRevenue: string;
  mainProducts: string[];
  certifications: string[];
  exportCountries: number;
  rating: number;
  responseRate: string;
  description: string;
}

export interface MockChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userCountry: string;
  message: string;
  timestamp: string;
  type: "text" | "question" | "system";
  isPinned?: boolean;
}

export interface MockQAItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userCountry: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  upvotes: number;
  isAnswered: boolean;
  isPinned: boolean;
  timestamp: string;
}

export interface MockWebinar {
  id: number;
  title: string;
  titleEn: string;
  description: string;
  status: MockWebinarStatus;
  category: string;
  coverImage: string;
  scheduledAt: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  registeredCount: number;
  viewCount: number;
  language: string;
  meetingType: string;
  tags: string[];
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostTitle: string;
  hostCompany: string;
  coHosts: Array<{ name: string; title: string; avatar: string }>;
  agenda: MockAgendaItem[];
  products: MockProduct[];
  factories: MockFactory[];
  highlights: string[];
  targetAudience: string[];
  requirements: string[];
}

// ─── 工厂数据 ─────────────────────────────────────────────────────────────
export const MOCK_FACTORIES: MockFactory[] = [
  {
    id: "factory-001",
    name: "深圳华强电子科技有限公司",
    nameEn: "Shenzhen Huaqiang Electronics Technology Co., Ltd.",
    logo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop",
    location: "广东省深圳市福田区",
    established: 2008,
    employees: "500-999人",
    annualRevenue: "$50M - $100M",
    mainProducts: ["智能家居设备", "无线充电器", "蓝牙耳机", "智能手表配件"],
    certifications: ["ISO 9001", "CE", "FCC", "RoHS", "UL"],
    exportCountries: 68,
    rating: 4.8,
    responseRate: "98%",
    description: "专注消费电子研发制造15年，拥有完整的SMT产线和注塑车间，年产能超过500万件。",
  },
  {
    id: "factory-002",
    name: "义乌美家日用品制造有限公司",
    nameEn: "Yiwu Meijia Household Products Manufacturing Co., Ltd.",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
    location: "浙江省义乌市国际商贸城",
    established: 2012,
    employees: "200-499人",
    annualRevenue: "$10M - $50M",
    mainProducts: ["家居收纳", "厨房用品", "浴室配件", "节日装饰"],
    certifications: ["ISO 9001", "BSCI", "SEDEX", "FSC"],
    exportCountries: 120,
    rating: 4.6,
    responseRate: "95%",
    description: "义乌最大的家居日用品出口商之一，产品远销欧美、中东、东南亚120余个国家和地区。",
  },
  {
    id: "factory-003",
    name: "广州时尚服饰集团股份有限公司",
    nameEn: "Guangzhou Fashion Apparel Group Co., Ltd.",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
    location: "广东省广州市白云区",
    established: 2005,
    employees: "1000-4999人",
    annualRevenue: "$100M+",
    mainProducts: ["女装", "男装", "运动服", "内衣", "童装"],
    certifications: ["ISO 9001", "GOTS", "OEKO-TEX", "BSCI", "SA8000"],
    exportCountries: 85,
    rating: 4.9,
    responseRate: "99%",
    description: "广州最具影响力的服装出口企业，拥有自主设计团队和完整供应链，支持OEM/ODM定制。",
  },
  {
    id: "factory-004",
    name: "宁波健康运动器材有限公司",
    nameEn: "Ningbo Health Sports Equipment Co., Ltd.",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    location: "浙江省宁波市鄞州区",
    established: 2010,
    employees: "300-499人",
    annualRevenue: "$20M - $50M",
    mainProducts: ["健身器材", "户外运动装备", "瑜伽用品", "骑行配件"],
    certifications: ["ISO 9001", "CE", "EN71", "ASTM", "TÜV"],
    exportCountries: 55,
    rating: 4.7,
    responseRate: "96%",
    description: "专注运动健身器材研发制造，产品通过欧美多项安全认证，是多个国际知名品牌的OEM供应商。",
  },
];

// ─── 产品数据 ─────────────────────────────────────────────────────────────
export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "prod-001",
    name: "智能无线充电桌面支架",
    nameEn: "Smart Wireless Charging Desktop Stand",
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&h=400&fit=crop",
    price: "$8.50 - $12.00",
    moq: "500件",
    category: "消费电子",
    material: "铝合金 + ABS",
    certification: ["CE", "FCC", "Qi认证"],
    leadTime: "15-20天",
    factoryName: "深圳华强电子",
    factoryId: "factory-001",
    highlight: "支持15W快充，兼容所有Qi设备",
    rating: 4.8,
    reviewCount: 328,
  },
  {
    id: "prod-002",
    name: "TWS主动降噪蓝牙耳机",
    nameEn: "TWS Active Noise Cancelling Bluetooth Earbuds",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    price: "$18.00 - $28.00",
    moq: "300件",
    category: "消费电子",
    material: "ABS + 硅胶",
    certification: ["CE", "FCC", "RoHS"],
    leadTime: "20-25天",
    factoryName: "深圳华强电子",
    factoryId: "factory-001",
    highlight: "ANC主动降噪，续航30小时",
    rating: 4.7,
    reviewCount: 512,
  },
  {
    id: "prod-003",
    name: "多功能厨房收纳挂架套装",
    nameEn: "Multi-function Kitchen Storage Rack Set",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    price: "$3.20 - $5.80",
    moq: "1000套",
    category: "家居日用",
    material: "304不锈钢",
    certification: ["LFGB", "FDA", "BSCI"],
    leadTime: "10-15天",
    factoryName: "义乌美家日用品",
    factoryId: "factory-002",
    highlight: "304不锈钢，免打孔安装，承重15kg",
    rating: 4.6,
    reviewCount: 891,
  },
  {
    id: "prod-004",
    name: "环保竹制餐具礼盒套装",
    nameEn: "Eco-friendly Bamboo Cutlery Gift Box Set",
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop",
    price: "$4.50 - $7.20",
    moq: "500套",
    category: "家居日用",
    material: "天然竹材",
    certification: ["FSC", "LFGB", "FDA"],
    leadTime: "12-18天",
    factoryName: "义乌美家日用品",
    factoryId: "factory-002",
    highlight: "100%天然竹材，可降解，FSC认证",
    rating: 4.9,
    reviewCount: 234,
  },
  {
    id: "prod-005",
    name: "女士时尚运动套装",
    nameEn: "Women's Fashion Athletic Set",
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop",
    price: "$12.00 - $18.00",
    moq: "200套",
    category: "服装服饰",
    material: "82%尼龙 + 18%氨纶",
    certification: ["OEKO-TEX", "GOTS"],
    leadTime: "25-35天",
    factoryName: "广州时尚服饰",
    factoryId: "factory-003",
    highlight: "高弹力面料，吸湿排汗，支持定制印花",
    rating: 4.8,
    reviewCount: 456,
  },
  {
    id: "prod-006",
    name: "折叠瑜伽垫专业版",
    nameEn: "Professional Foldable Yoga Mat",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
    price: "$9.80 - $15.50",
    moq: "300件",
    category: "运动户外",
    material: "天然橡胶 + 麂皮绒",
    certification: ["CE", "EN71", "REACH"],
    leadTime: "15-20天",
    factoryName: "宁波健康运动器材",
    factoryId: "factory-004",
    highlight: "6mm厚天然橡胶，防滑纹理，可折叠携带",
    rating: 4.7,
    reviewCount: 678,
  },
];

// ─── 聊天记录 ─────────────────────────────────────────────────────────────
export const MOCK_CHAT_MESSAGES: MockChatMessage[] = [
  {
    id: "msg-001",
    userId: "user-001",
    userName: "Sarah Johnson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    userCountry: "🇺🇸",
    message: "这款无线充电器支持iPhone 15吗？",
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    type: "text",
  },
  {
    id: "msg-002",
    userId: "host-001",
    userName: "李明 (主持人)",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=liming",
    userCountry: "🇨🇳",
    message: "是的！支持所有Qi 2.0设备，包括iPhone 12及以上型号，最高15W快充。",
    timestamp: new Date(Date.now() - 7 * 60000).toISOString(),
    type: "text",
  },
  {
    id: "msg-003",
    userId: "user-002",
    userName: "Ahmed Al-Rashid",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
    userCountry: "🇦🇪",
    message: "MOQ可以再低一些吗？我们是小型零售商",
    timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
    type: "text",
  },
  {
    id: "msg-004",
    userId: "user-003",
    userName: "Emma Müller",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    userCountry: "🇩🇪",
    message: "CE认证文件可以提供吗？我们需要进入欧盟市场",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    type: "text",
  },
  {
    id: "msg-005",
    userId: "host-001",
    userName: "李明 (主持人)",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=liming",
    userCountry: "🇨🇳",
    message: "Emma，所有认证文件都可以提供，包括CE、FCC、RoHS完整报告。请在直播结束后联系我们的销售团队。",
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    type: "text",
  },
  {
    id: "msg-006",
    userId: "user-004",
    userName: "Carlos Rivera",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    userCountry: "🇲🇽",
    message: "交货期15天是正常订单吗？旺季会延长吗？",
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    type: "text",
  },
  {
    id: "msg-007",
    userId: "user-005",
    userName: "Yuki Tanaka",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yuki",
    userCountry: "🇯🇵",
    message: "产品可以做定制包装和品牌LOGO吗？",
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    type: "text",
  },
  {
    id: "msg-008",
    userId: "host-001",
    userName: "李明 (主持人)",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=liming",
    userCountry: "🇨🇳",
    message: "Yuki，完全支持！OEM/ODM定制，最低500件起可做定制包装，1000件起可做定制颜色和LOGO。",
    timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
    type: "text",
  },
  {
    id: "msg-009",
    userId: "user-006",
    userName: "Sophie Laurent",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophie",
    userCountry: "🇫🇷",
    message: "刚才展示的那款竹制餐具，有没有更多颜色选择？",
    timestamp: new Date(Date.now() - 30000).toISOString(),
    type: "text",
  },
  {
    id: "msg-010",
    userId: "system",
    userName: "系统",
    userAvatar: "",
    userCountry: "",
    message: "🎉 已有 342 人报名参加本场 Webinar",
    timestamp: new Date(Date.now() - 20000).toISOString(),
    type: "system",
  },
];

// ─── Q&A 数据 ─────────────────────────────────────────────────────────────
export const MOCK_QA_ITEMS: MockQAItem[] = [
  {
    id: "qa-001",
    userId: "user-001",
    userName: "Sarah Johnson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    userCountry: "🇺🇸",
    question: "贵司的最小起订量是多少？对于新客户有没有试单政策？",
    answer: "我们对新客户提供试单服务，最低100件起，价格按正常MOQ价格计算。首次合作成功后，后续订单享受5%折扣优惠。",
    answeredBy: "李明 (主持人)",
    upvotes: 28,
    isAnswered: true,
    isPinned: true,
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "qa-002",
    userId: "user-002",
    userName: "Ahmed Al-Rashid",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
    userCountry: "🇦🇪",
    question: "产品是否支持亚马逊FBA直发？可以贴亚马逊条码吗？",
    answer: "完全支持！我们有专门的FBA备货服务，可以按照亚马逊要求贴条码、打包，直接发往亚马逊仓库。",
    answeredBy: "张华 (销售经理)",
    upvotes: 45,
    isAnswered: true,
    isPinned: true,
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: "qa-003",
    userId: "user-003",
    userName: "Emma Müller",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    userCountry: "🇩🇪",
    question: "产品的保修政策是什么？如果出现质量问题如何处理？",
    upvotes: 19,
    isAnswered: false,
    isPinned: false,
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: "qa-004",
    userId: "user-007",
    userName: "Michael Chen",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    userCountry: "🇨🇦",
    question: "贵工厂有没有通过BSCI或者Sedex社会责任审计？",
    answer: "是的，我们已通过BSCI 2022年度审计，评级为A级。Sedex认证也在进行中，预计今年Q3完成。",
    answeredBy: "李明 (主持人)",
    upvotes: 12,
    isAnswered: true,
    isPinned: false,
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "qa-005",
    userId: "user-008",
    userName: "Priya Sharma",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    userCountry: "🇮🇳",
    question: "支持哪些付款方式？T/T之外有没有其他选项？",
    upvotes: 8,
    isAnswered: false,
    isPinned: false,
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: "qa-006",
    userId: "user-009",
    userName: "Lars Andersen",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lars",
    userCountry: "🇩🇰",
    question: "产品包装是否符合欧盟包装废弃物指令？",
    upvotes: 6,
    isAnswered: false,
    isPinned: false,
    timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
  },
];

// ─── Webinar 数据 ─────────────────────────────────────────────────────────
export const MOCK_WEBINARS: MockWebinar[] = [
  // ── 1. 正在直播：智能家居产品展示 ──────────────────────────────────────
  {
    id: 8,
    title: "2026 智能家居新品发布直播 | 深圳华强电子",
    titleEn: "2026 Smart Home New Product Launch | Shenzhen Huaqiang Electronics",
    description: "深圳华强电子携最新智能家居产品线亮相，包括无线充电系列、TWS耳机、智能家居控制器等20余款新品。现场工厂直播参观，实时解答采购问题。",
    status: "live",
    category: "electronics",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    scheduledAt: new Date(Date.now() - 45 * 60000).toISOString(),
    duration: 120,
    maxParticipants: 500,
    currentParticipants: 342,
    registeredCount: 428,
    viewCount: 1256,
    language: "中文 / English",
    meetingType: "webinar",
    tags: ["智能家居", "无线充电", "蓝牙耳机", "深圳制造", "OEM/ODM"],
    hostId: "host-001",
    hostName: "李明",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=liming",
    hostTitle: "国际销售总监",
    hostCompany: "深圳华强电子科技有限公司",
    coHosts: [
      { name: "张华", title: "产品经理", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhanghua" },
      { name: "王芳", title: "技术工程师", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangfang" },
    ],
    agenda: [
      {
        id: "a1", time: "14:00", duration: 10, title: "开场介绍 & 公司概览",
        titleEn: "Opening & Company Overview", speaker: "李明", speakerTitle: "国际销售总监",
        description: "介绍深圳华强电子的发展历程、生产能力和主要客户群体。",
        type: "intro",
      },
      {
        id: "a2", time: "14:10", duration: 25, title: "2026 新品发布：无线充电系列",
        titleEn: "2026 New Products: Wireless Charging Series", speaker: "张华", speakerTitle: "产品经理",
        description: "重点展示15W快充桌面支架、车载无线充电器、多设备充电板三款核心新品。",
        type: "product",
      },
      {
        id: "a3", time: "14:35", duration: 20, title: "工厂直播参观：SMT产线",
        titleEn: "Factory Live Tour: SMT Production Line", speaker: "王芳", speakerTitle: "技术工程师",
        description: "实时参观全自动SMT贴片生产线，了解质量管控流程和检测标准。",
        type: "factory_tour",
      },
      {
        id: "a4", time: "14:55", duration: 20, title: "TWS耳机系列展示",
        titleEn: "TWS Earbuds Series Showcase", speaker: "张华", speakerTitle: "产品经理",
        description: "展示主动降噪、骨传导、运动防水三个系列共8款TWS耳机产品。",
        type: "product",
      },
      {
        id: "a5", time: "15:15", duration: 30, title: "Q&A 互动环节",
        titleEn: "Q&A Interactive Session", speaker: "李明", speakerTitle: "国际销售总监",
        description: "解答买家关于产品规格、认证、MOQ、定制化等各类问题。",
        type: "qa",
      },
      {
        id: "a6", time: "15:45", duration: 15, title: "一对一洽谈预约",
        titleEn: "One-on-One Meeting Booking", speaker: "李明", speakerTitle: "国际销售总监",
        description: "为有意向的买家安排后续一对一深度洽谈，提供专属报价。",
        type: "networking",
      },
    ],
    products: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]],
    factories: [MOCK_FACTORIES[0]],
    highlights: [
      "20余款2026年全新产品首发",
      "工厂实时直播，透明化生产流程",
      "现场提供专属采购报价",
      "支持样品快递，3-5天到货",
    ],
    targetAudience: ["亚马逊卖家", "独立站品牌", "零售商", "分销商"],
    requirements: ["注册账号", "填写公司信息"],
  },

  // ── 2. 正在直播：家居日用品展示 ────────────────────────────────────────
  {
    id: 12,
    title: "义乌爆款家居选品直播 | 2026春季新品",
    titleEn: "Yiwu Hot-selling Home Products | 2026 Spring New Arrivals",
    description: "义乌美家日用品制造商带来2026春季最新家居产品，包括厨房收纳、浴室配件、节日装饰等300余款SKU，全程中英文双语讲解。",
    status: "live",
    category: "home",
    coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    scheduledAt: new Date(Date.now() - 30 * 60000).toISOString(),
    duration: 90,
    maxParticipants: 300,
    currentParticipants: 198,
    registeredCount: 267,
    viewCount: 834,
    language: "中文 / English",
    meetingType: "webinar",
    tags: ["家居收纳", "厨房用品", "义乌", "不锈钢", "环保材料"],
    hostId: "host-002",
    hostName: "陈美丽",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chenmeili",
    hostTitle: "外贸销售经理",
    hostCompany: "义乌美家日用品制造有限公司",
    coHosts: [
      { name: "刘强", title: "产品开发总监", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=liuqiang" },
    ],
    agenda: [
      {
        id: "b1", time: "10:00", duration: 5, title: "开场 & 公司介绍",
        titleEn: "Opening & Company Introduction", speaker: "陈美丽", speakerTitle: "外贸销售经理",
        description: "简介义乌美家的发展历程和出口优势。",
        type: "intro",
      },
      {
        id: "b2", time: "10:05", duration: 30, title: "2026春季爆款产品展示",
        titleEn: "2026 Spring Hot Products Showcase", speaker: "刘强", speakerTitle: "产品开发总监",
        description: "重点展示厨房收纳、浴室配件、节日装饰三大品类的春季新品。",
        type: "product",
      },
      {
        id: "b3", time: "10:35", duration: 20, title: "仓库实地参观",
        titleEn: "Warehouse Live Tour", speaker: "陈美丽", speakerTitle: "外贸销售经理",
        description: "实时参观成品仓库，展示库存量和发货能力。",
        type: "factory_tour",
      },
      {
        id: "b4", time: "10:55", duration: 25, title: "Q&A & 报价环节",
        titleEn: "Q&A & Quotation Session", speaker: "陈美丽", speakerTitle: "外贸销售经理",
        description: "解答采购问题，提供现场报价。",
        type: "qa",
      },
    ],
    products: [MOCK_PRODUCTS[2], MOCK_PRODUCTS[3]],
    factories: [MOCK_FACTORIES[1]],
    highlights: [
      "300+ SKU春季新品一次性展示",
      "库存充足，支持快速发货",
      "FSC认证环保材料",
      "支持混批，最低500件起",
    ],
    targetAudience: ["亚马逊卖家", "Etsy卖家", "家居零售商", "礼品采购商"],
    requirements: ["注册账号"],
  },

  // ── 3. 正在直播：服装展示 ───────────────────────────────────────────────
  {
    id: 15,
    title: "广州女装新品发布 | 春夏2026 OEM/ODM专场",
    titleEn: "Guangzhou Women's Fashion Launch | Spring/Summer 2026 OEM/ODM",
    description: "广州时尚服饰集团2026春夏系列发布，100余款女装新品，支持OEM/ODM定制，最低200件起订，30天内交货。",
    status: "live",
    category: "fashion",
    coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    scheduledAt: new Date(Date.now() - 15 * 60000).toISOString(),
    duration: 90,
    maxParticipants: 400,
    currentParticipants: 276,
    registeredCount: 356,
    viewCount: 1089,
    language: "中文 / English",
    meetingType: "webinar",
    tags: ["女装", "OEM/ODM", "广州服装", "春夏新品", "定制服务"],
    hostId: "host-003",
    hostName: "王晓燕",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangxiaoyan",
    hostTitle: "国际业务总监",
    hostCompany: "广州时尚服饰集团股份有限公司",
    coHosts: [
      { name: "林设计师", title: "首席设计师", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lindesigner" },
    ],
    agenda: [
      {
        id: "c1", time: "15:00", duration: 10, title: "品牌故事 & 设计理念",
        titleEn: "Brand Story & Design Philosophy", speaker: "王晓燕", speakerTitle: "国际业务总监",
        description: "介绍广州时尚服饰的品牌定位和2026春夏系列设计灵感。",
        type: "intro",
      },
      {
        id: "c2", time: "15:10", duration: 35, title: "2026春夏系列走秀展示",
        titleEn: "2026 Spring/Summer Collection Runway", speaker: "林设计师", speakerTitle: "首席设计师",
        description: "模特展示100余款春夏新品，包括连衣裙、套装、休闲系列。",
        type: "product",
      },
      {
        id: "c3", time: "15:45", duration: 15, title: "OEM/ODM定制流程介绍",
        titleEn: "OEM/ODM Customization Process", speaker: "王晓燕", speakerTitle: "国际业务总监",
        description: "详细介绍定制流程、打样周期、最低起订量和交货期。",
        type: "product",
      },
      {
        id: "c4", time: "16:00", duration: 30, title: "Q&A & 样品申请",
        titleEn: "Q&A & Sample Request", speaker: "王晓燕", speakerTitle: "国际业务总监",
        description: "解答定制问题，接受样品申请。",
        type: "qa",
      },
    ],
    products: [MOCK_PRODUCTS[4]],
    factories: [MOCK_FACTORIES[2]],
    highlights: [
      "100+ 款春夏新品首发",
      "OEKO-TEX认证环保面料",
      "支持品牌定制，最低200件",
      "30天内交货保证",
    ],
    targetAudience: ["服装品牌商", "独立站卖家", "零售买手", "批发商"],
    requirements: ["注册账号", "填写采购需求"],
  },

  // ── 4. 即将开始：运动器材展示 ───────────────────────────────────────────
  {
    id: 21,
    title: "2026健身器材采购直播 | 宁波健康运动器材",
    titleEn: "2026 Fitness Equipment Sourcing Webinar | Ningbo Health Sports",
    description: "宁波健康运动器材有限公司携2026年度新品亮相，涵盖家用健身器材、户外运动装备、瑜伽用品三大品类，全程工厂直播，提供专属采购报价。",
    status: "scheduled",
    category: "sports",
    coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    scheduledAt: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
    duration: 90,
    maxParticipants: 300,
    currentParticipants: 0,
    registeredCount: 187,
    viewCount: 0,
    language: "中文 / English",
    meetingType: "webinar",
    tags: ["健身器材", "瑜伽", "户外运动", "宁波制造", "CE认证"],
    hostId: "host-004",
    hostName: "赵建国",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhaojg",
    hostTitle: "出口销售总监",
    hostCompany: "宁波健康运动器材有限公司",
    coHosts: [],
    agenda: [
      {
        id: "d1", time: "10:00", duration: 10, title: "公司介绍 & 认证展示",
        titleEn: "Company Introduction & Certifications", speaker: "赵建国", speakerTitle: "出口销售总监",
        description: "介绍公司背景、生产能力和主要认证资质。",
        type: "intro",
      },
      {
        id: "d2", time: "10:10", duration: 30, title: "2026新品展示：家用健身系列",
        titleEn: "2026 New Products: Home Fitness Series", speaker: "赵建国", speakerTitle: "出口销售总监",
        description: "展示哑铃套装、瑜伽垫、弹力带、跳绳等家用健身产品。",
        type: "product",
      },
      {
        id: "d3", time: "10:40", duration: 20, title: "工厂参观：检测实验室",
        titleEn: "Factory Tour: Testing Laboratory", speaker: "赵建国", speakerTitle: "出口销售总监",
        description: "参观产品安全检测实验室，了解CE/EN71认证流程。",
        type: "factory_tour",
      },
      {
        id: "d4", time: "11:00", duration: 20, title: "户外运动装备展示",
        titleEn: "Outdoor Sports Equipment Showcase", speaker: "赵建国", speakerTitle: "出口销售总监",
        description: "展示骑行配件、登山装备、水上运动用品。",
        type: "product",
      },
      {
        id: "d5", time: "11:20", duration: 20, title: "Q&A & 报价",
        titleEn: "Q&A & Quotation", speaker: "赵建国", speakerTitle: "出口销售总监",
        description: "现场解答并提供报价。",
        type: "qa",
      },
    ],
    products: [MOCK_PRODUCTS[5]],
    factories: [MOCK_FACTORIES[3]],
    highlights: [
      "全系列通过CE/EN71/ASTM认证",
      "工厂直播，透明化生产",
      "支持Amazon FBA备货",
      "样品5-7天到货",
    ],
    targetAudience: ["运动品牌商", "亚马逊卖家", "健身房采购", "户外零售商"],
    requirements: ["注册账号"],
  },

  // ── 5. 即将开始：美妆护肤 ───────────────────────────────────────────────
  {
    id: 28,
    title: "广州美妆ODM专场 | 私标护肤品定制直播",
    titleEn: "Guangzhou Beauty ODM Special | Private Label Skincare Customization",
    description: "专注私标护肤品定制10年，提供配方研发、包装设计、生产制造一站式服务。本场直播展示100+热销配方，支持小批量定制。",
    status: "scheduled",
    category: "beauty",
    coverImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60000).toISOString(),
    duration: 90,
    maxParticipants: 200,
    currentParticipants: 0,
    registeredCount: 134,
    viewCount: 0,
    language: "中文 / English",
    meetingType: "webinar",
    tags: ["美妆ODM", "私标护肤", "配方定制", "广州美妆", "小批量"],
    hostId: "host-005",
    hostName: "林美华",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=linmeihua",
    hostTitle: "研发总监",
    hostCompany: "广州靓肤生物科技有限公司",
    coHosts: [],
    agenda: [
      {
        id: "e1", time: "14:00", duration: 15, title: "公司介绍 & 资质展示",
        titleEn: "Company Introduction & Qualifications", speaker: "林美华", speakerTitle: "研发总监",
        description: "介绍公司研发实力、GMP认证和主要合作品牌。",
        type: "intro",
      },
      {
        id: "e2", time: "14:15", duration: 40, title: "热销配方产品展示",
        titleEn: "Best-selling Formula Products Showcase", speaker: "林美华", speakerTitle: "研发总监",
        description: "展示面霜、精华、面膜、洁面等100+热销配方产品。",
        type: "product",
      },
      {
        id: "e3", time: "14:55", duration: 20, title: "定制流程 & 打样说明",
        titleEn: "Customization Process & Sampling", speaker: "林美华", speakerTitle: "研发总监",
        description: "详细介绍私标定制流程、打样费用和周期。",
        type: "product",
      },
      {
        id: "e4", time: "15:15", duration: 15, title: "Q&A",
        titleEn: "Q&A", speaker: "林美华", speakerTitle: "研发总监",
        description: "解答定制问题。",
        type: "qa",
      },
    ],
    products: [],
    factories: [],
    highlights: [
      "GMP认证生产基地",
      "100+成熟配方可直接选用",
      "最低500件起订",
      "支持全球法规合规咨询",
    ],
    targetAudience: ["美妆品牌商", "独立站卖家", "美容院采购", "零售商"],
    requirements: ["注册账号", "填写品牌信息"],
  },

  // ── 6. 已结束：电商选品回放 ─────────────────────────────────────────────
  {
    id: 5,
    title: "2026亚马逊爆款选品直播 | 跨境电商专场",
    titleEn: "2026 Amazon Best-seller Product Selection | Cross-border E-commerce",
    description: "本场直播已结束，回放可免费观看。深度解析2026年亚马逊各品类爆款趋势，50+工厂现场展示，助力跨境卖家精准选品。",
    status: "completed",
    category: "ecommerce",
    coverImage: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&q=80",
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
    duration: 180,
    maxParticipants: 1000,
    currentParticipants: 0,
    registeredCount: 892,
    viewCount: 3456,
    language: "中文",
    meetingType: "webinar",
    tags: ["亚马逊选品", "跨境电商", "爆款趋势", "2026选品", "FBA"],
    hostId: "host-006",
    hostName: "周明",
    hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhouming",
    hostTitle: "跨境电商专家",
    hostCompany: "RealSourcing",
    coHosts: [],
    agenda: [],
    products: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[2], MOCK_PRODUCTS[5]],
    factories: [MOCK_FACTORIES[0], MOCK_FACTORIES[1], MOCK_FACTORIES[3]],
    highlights: [
      "50+ 工厂现场展示",
      "3小时深度选品分析",
      "892位买家参与",
      "回放永久免费",
    ],
    targetAudience: ["亚马逊卖家", "跨境电商从业者"],
    requirements: [],
  },
];

// ─── 工具函数 ─────────────────────────────────────────────────────────────
export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    electronics: "消费电子",
    home: "家居日用",
    fashion: "服装服饰",
    sports: "运动户外",
    beauty: "美妆护肤",
    toys: "玩具礼品",
    ecommerce: "电商选品",
    other: "其他",
  };
  return map[category] || category;
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    electronics: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    home: "bg-green-500/10 text-green-400 border-green-500/20",
    fashion: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    sports: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    beauty: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    toys: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    ecommerce: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  return map[category] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
}

export function getAgendaTypeIcon(type: MockAgendaItem["type"]): string {
  const map = {
    intro: "🎯",
    product: "📦",
    factory_tour: "🏭",
    qa: "💬",
    networking: "🤝",
    break: "☕",
  };
  return map[type] || "📌";
}
