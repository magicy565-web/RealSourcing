import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, json, decimal, bigint, tinyint, date, unique, index } from "drizzle-orm/mysql-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// ============================================================================
// RealSourcing 数据库增强方案
// 日期: 2026-02-17
// 目标: 将 RealSourcing 打造成真实可用的 B2B SaaS 平台
// ============================================================================

// ============================================================================
// 1. Webinars 表增强 (30+ 新字段)
// ============================================================================

export const webinarsEnhanced = mysqlTable("webinars", {
  // ===== 现有字段 (保留) =====
  id: int("id").autoincrement().primaryKey(),
  createdById: int("createdById").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  type: mysqlEnum("type", ["one_to_one", "group", "webinar"]).default("one_to_one").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "live", "completed", "cancelled"]).default("draft").notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  scheduledAt: timestamp("scheduledAt"),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  duration: int("duration").default(60),
  actualDuration: int("actualDuration"),
  maxParticipants: int("maxParticipants").default(10),
  currentParticipants: int("currentParticipants").default(0),
  coverImage: varchar("coverImage", { length: 500 }),
  recordingEnabled: tinyint("recordingEnabled").default(1),
  recordingUrl: varchar("recordingUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),

  // ===== 新增字段 - 讲师/主讲人信息 =====
  speaker: varchar("speaker", { length: 255 }),
  speakerTitle: varchar("speakerTitle", { length: 255 }),
  speakerCompany: varchar("speakerCompany", { length: 255 }),
  speakerBio: text("speakerBio"),
  speakerAvatar: varchar("speakerAvatar", { length: 500 }),
  speakerLinkedin: varchar("speakerLinkedin", { length: 500 }),
  speakerEmail: varchar("speakerEmail", { length: 320 }),

  // ===== 新增字段 - 活动组织信息 =====
  organizer: varchar("organizer", { length: 255 }),
  organizerLogo: varchar("organizerLogo", { length: 500 }),
  coOrganizers: json("coOrganizers").$type<string[]>(),
  registrationUrl: varchar("registrationUrl", { length: 500 }), // 外部注册链接
  externalEventId: varchar("externalEventId", { length: 255 }), // 外部活动 ID
  eventSource: varchar("eventSource", { length: 100 }), // 'internal', 'innovation_forum', 'eventbrite', etc.

  // ===== 新增字段 - 内容分类与标签 =====
  industry: varchar("industry", { length: 100 }), // Apparel, Energy, Agriculture, etc.
  topics: json("topics").$type<string[]>(), // ['Supply Chain', 'Sustainability', 'AI']
  targetAudience: text("targetAudience"), // CEO, C-suite, Buyers, etc.
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]),

  // ===== 新增字段 - 营销与展示 =====
  subtitle: varchar("subtitle", { length: 500 }),
  highlights: json("highlights").$type<string[]>(), // 核心亮点
  agenda: json("agenda").$type<Array<{time: string, title: string, description?: string}>>(), // 议程
  learningOutcomes: json("learningOutcomes").$type<string[]>(), // 学习成果
  promoVideoUrl: varchar("promoVideoUrl", { length: 500 }), // 预告视频
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }), // 缩略图
  bannerImage: varchar("bannerImage", { length: 500 }), // 横幅图

  // ===== 新增字段 - 统计与分析 =====
  registrationCount: int("registrationCount").default(0), // 注册人数
  attendanceCount: int("attendanceCount").default(0), // 实际出席人数
  completionRate: decimal("completionRate", { precision: 5, scale: 2 }).default("0"), // 完成率
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0"), // 平均评分
  ratingCount: int("ratingCount").default(0), // 评分人数
  viewCount: int("viewCount").default(0), // 浏览量
  shareCount: int("shareCount").default(0), // 分享次数
  clickCount: int("clickCount").default(0), // 点击次数

  // ===== 新增字段 - 互动数据 =====
  questionCount: int("questionCount").default(0), // 提问数量
  pollCount: int("pollCount").default(0), // 投票数量
  chatMessageCount: int("chatMessageCount").default(0), // 聊天消息数
  productFavoriteCount: int("productFavoriteCount").default(0), // 产品收藏总数
  inquiryCount: int("inquiryCount").default(0), // 询价总数

  // ===== 新增字段 - 时区与国际化 =====
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  translations: json("translations").$type<Record<string, {title: string, description: string}>>(), // 多语言

  // ===== 新增字段 - SEO 与发现 =====
  slug: varchar("slug", { length: 255 }).unique(),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  tags: json("tags").$type<string[]>(), // 搜索标签

  // ===== 新增字段 - 会议设置 =====
  requiresApproval: tinyint("requiresApproval").default(0), // 是否需要审核
  isPublic: tinyint("isPublic").default(1), // 是否公开
  allowRecording: tinyint("allowRecording").default(1), // 是否允许录制
  allowChat: tinyint("allowChat").default(1), // 是否允许聊天
  allowQA: tinyint("allowQA").default(1), // 是否允许问答
  allowProductDisplay: tinyint("allowProductDisplay").default(1), // 是否允许产品展示
  reminderSent: tinyint("reminderSent").default(0), // 提醒是否已发送
  followUpSent: tinyint("followUpSent").default(0), // 跟进邮件是否已发送

  // ===== 新增字段 - 商业数据 =====
  estimatedRevenue: decimal("estimatedRevenue", { precision: 10, scale: 2 }), // 预估收入
  actualRevenue: decimal("actualRevenue", { precision: 10, scale: 2 }), // 实际收入
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }), // 转化率
  roi: decimal("roi", { precision: 5, scale: 2 }), // 投资回报率

}, (table) => ({
  createdByIdIdx: index("idx_createdById").on(table.createdById),
  statusIdx: index("idx_status").on(table.status),
  scheduledAtIdx: index("idx_scheduledAt").on(table.scheduledAt),
  categoryIdx: index("idx_category").on(table.category),
  industryIdx: index("idx_industry").on(table.industry),
  slugIdx: index("idx_slug").on(table.slug),
  eventSourceIdx: index("idx_eventSource").on(table.eventSource),
}));

export type WebinarEnhanced = InferSelectModel<typeof webinarsEnhanced>;
export type InsertWebinarEnhanced = InferInsertModel<typeof webinarsEnhanced>;

// ============================================================================
// 2. Webinar Products 表增强 (15+ 新字段)
// ============================================================================

export const webinarProductsEnhanced = mysqlTable("webinar_products", {
  // ===== 现有字段 (保留) =====
  id: int("id").autoincrement().primaryKey(),
  webinarId: int("webinarId").notNull(),
  productId: int("productId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),

  // ===== 新增字段 - 展示与排序 =====
  displayOrder: int("displayOrder").default(0), // 展示顺序
  highlightText: varchar("highlightText", { length: 255 }), // "爆款推荐", "限时优惠"
  isHighlighted: tinyint("isHighlighted").default(0), // 是否高亮显示
  isPinned: tinyint("isPinned").default(0), // 是否置顶

  // ===== 新增字段 - 产品详情 =====
  sku: varchar("sku", { length: 100 }),
  specifications: json("specifications").$type<Record<string, string>>(), // {size: "30x15cm", material: "ABS"}
  features: json("features").$type<string[]>(), // ["3档调光", "USB充电"]
  images: json("images").$type<string[]>(), // 产品图片数组
  videos: json("videos").$type<string[]>(), // 产品视频数组
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }), // 缩略图

  // ===== 新增字段 - 采购信息 =====
  moq: int("moq"), // 最小起订量 (Minimum Order Quantity)
  priceRange: varchar("priceRange", { length: 100 }), // "$2.50 - $3.00"
  leadTime: varchar("leadTime", { length: 100 }), // "7-10 days"
  stockStatus: mysqlEnum("stockStatus", ["in_stock", "low_stock", "out_of_stock", "pre_order"]).default("in_stock"),
  stockQuantity: int("stockQuantity"),
  customizable: tinyint("customizable").default(0), // 是否可定制
  customizationOptions: json("customizationOptions").$type<string[]>(), // ["Logo定制", "颜色定制"]

  // ===== 新增字段 - 统计数据 =====
  favoriteCount: int("favoriteCount").default(0), // 收藏次数
  inquiryCount: int("inquiryCount").default(0), // 询价次数
  viewCount: int("viewCount").default(0), // 查看次数
  clickCount: int("clickCount").default(0), // 点击次数
  conversionCount: int("conversionCount").default(0), // 转化次数 (下单)
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }).default("0"), // 转化率

  // ===== 新增字段 - 营销信息 =====
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }), // 原价
  discountPercent: int("discountPercent"), // 折扣百分比
  promotionText: varchar("promotionText", { length: 255 }), // "限时8折"
  badges: json("badges").$type<string[]>(), // ["热卖", "新品", "包邮"]

}, (table) => ({
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
  productIdIdx: index("idx_productId").on(table.productId),
  displayOrderIdx: index("idx_displayOrder").on(table.displayOrder),
  isHighlightedIdx: index("idx_isHighlighted").on(table.isHighlighted),
}));

export type WebinarProductEnhanced = InferSelectModel<typeof webinarProductsEnhanced>;
export type InsertWebinarProductEnhanced = InferInsertModel<typeof webinarProductsEnhanced>;

// ============================================================================
// 3. 买家画像表 (Buyer Profiles) - 新建
// ============================================================================

export const buyerProfiles = mysqlTable("buyer_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),

  // ===== 店铺信息 =====
  shopType: varchar("shopType", { length: 100 }), // 'TikTok Shop', 'Shopify', 'Amazon', 'Independent'
  shopName: varchar("shopName", { length: 255 }),
  shopUrl: varchar("shopUrl", { length: 500 }),
  shopCountry: varchar("shopCountry", { length: 100 }),

  // ===== 经营特征 =====
  mainCategories: json("mainCategories").$type<string[]>(), // ["Home & Garden", "Electronics"]
  priceRangeMin: decimal("priceRangeMin", { precision: 10, scale: 2 }),
  priceRangeMax: decimal("priceRangeMax", { precision: 10, scale: 2 }),
  monthlySalesVolume: int("monthlySalesVolume"), // 月销量
  averageOrderValue: decimal("averageOrderValue", { precision: 10, scale: 2 }), // 平均客单价

  // ===== 采购偏好 =====
  preferredMoqMin: int("preferredMoqMin"), // 偏好最小起订量
  preferredMoqMax: int("preferredMoqMax"), // 偏好最大起订量
  preferredLeadTime: varchar("preferredLeadTime", { length: 50 }), // "7-14 days"
  targetMarkets: json("targetMarkets").$type<string[]>(), // ["US", "UK", "EU"]
  purchaseFrequency: varchar("purchaseFrequency", { length: 50 }), // "weekly", "monthly", "quarterly"

  // ===== 采购历史 =====
  totalOrders: int("totalOrders").default(0),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0"),
  totalProducts: int("totalProducts").default(0), // 采购过的产品种类数
  favoriteSuppliers: json("favoriteSuppliers").$type<number[]>(), // 收藏的供应商 ID 数组
  lastPurchaseAt: timestamp("lastPurchaseAt"),

  // ===== 产品偏好 (AI 分析) =====
  productPreferences: json("productPreferences").$type<{
    categories: string[],
    priceRange: {min: number, max: number},
    features: string[],
    styles: string[]
  }>(),
  searchKeywords: json("searchKeywords").$type<string[]>(), // 常搜索的关键词
  favoriteColors: json("favoriteColors").$type<string[]>(),
  favoriteMaterials: json("favoriteMaterials").$type<string[]>(),

  // ===== 行为特征 =====
  webinarsAttended: int("webinarsAttended").default(0),
  productsViewed: int("productsViewed").default(0),
  productsFavorited: int("productsFavorited").default(0),
  inquiriesSent: int("inquiriesSent").default(0),
  inquiryResponseRate: decimal("inquiryResponseRate", { precision: 5, scale: 2 }).default("0"), // 询价响应率
  averageDecisionTime: int("averageDecisionTime"), // 平均决策时间 (天)

  // ===== 信用与评级 =====
  creditScore: int("creditScore").default(0), // 信用分数
  reliabilityScore: decimal("reliabilityScore", { precision: 3, scale: 2 }).default("0"), // 可靠性评分
  paymentOnTimeRate: decimal("paymentOnTimeRate", { precision: 5, scale: 2 }).default("0"), // 按时付款率

  // ===== 时间戳 =====
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  shopTypeIdx: index("idx_shopType").on(table.shopType),
  totalOrdersIdx: index("idx_totalOrders").on(table.totalOrders),
}));

export type BuyerProfile = InferSelectModel<typeof buyerProfiles>;
export type InsertBuyerProfile = InferInsertModel<typeof buyerProfiles>;

// ============================================================================
// 4. 实时互动表 (Live Interactions) - 新建
// ============================================================================

export const liveInteractions = mysqlTable("live_interactions", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  webinarId: int("webinarId").notNull(),
  userId: int("userId").notNull(),
  interactionType: mysqlEnum("interactionType", [
    "join", "leave", "product_view", "product_favorite", "inquiry", 
    "chat", "question", "poll_vote", "share", "download"
  ]).notNull(),
  productId: int("productId"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
  userIdIdx: index("idx_userId").on(table.userId),
  interactionTypeIdx: index("idx_interactionType").on(table.interactionType),
  timestampIdx: index("idx_timestamp").on(table.timestamp),
  productIdIdx: index("idx_productId").on(table.productId),
}));

export type LiveInteraction = InferSelectModel<typeof liveInteractions>;
export type InsertLiveInteraction = InferInsertModel<typeof liveInteractions>;

// ============================================================================
// 5. 会议报告表 (Webinar Reports) - 新建
// ============================================================================

export const webinarReports = mysqlTable("webinar_reports", {
  id: int("id").autoincrement().primaryKey(),
  webinarId: int("webinarId").notNull().unique(),

  // ===== 基础统计 =====
  totalParticipants: int("totalParticipants").default(0),
  totalProducts: int("totalProducts").default(0),
  totalFavorites: int("totalFavorites").default(0),
  totalInquiries: int("totalInquiries").default(0),
  totalChatMessages: int("totalChatMessages").default(0),
  totalQuestions: int("totalQuestions").default(0),

  // ===== 参与度统计 =====
  averageStayTime: int("averageStayTime"), // 平均停留时间 (分钟)
  completionRate: decimal("completionRate", { precision: 5, scale: 2 }), // 完成率
  engagementScore: decimal("engagementScore", { precision: 5, scale: 2 }), // 参与度评分

  // ===== 热门产品 =====
  hotProducts: json("hotProducts").$type<Array<{
    productId: number,
    productName: string,
    favoriteCount: number,
    inquiryCount: number,
    viewCount: number
  }>>(),

  // ===== 高意向买家 =====
  highIntentBuyers: json("highIntentBuyers").$type<Array<{
    userId: number,
    userName: string,
    intentScore: number,
    favoritedProducts: number[],
    inquiredProducts: number[],
    estimatedOrderValue: number
  }>>(),

  // ===== AI 分析 =====
  aiInsights: text("aiInsights"), // AI 生成的洞察
  aiRecommendations: text("aiRecommendations"), // AI 生成的跟进建议
  aiSummary: text("aiSummary"), // AI 生成的会议总结

  // ===== 商业数据 =====
  estimatedRevenue: decimal("estimatedRevenue", { precision: 10, scale: 2 }), // 预估收入
  actualRevenue: decimal("actualRevenue", { precision: 10, scale: 2 }), // 实际收入
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }), // 转化率
  roi: decimal("roi", { precision: 5, scale: 2 }), // 投资回报率

  // ===== 时间戳 =====
  generatedAt: timestamp("generatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
}));

export type WebinarReport = InferSelectModel<typeof webinarReports>;
export type InsertWebinarReport = InferInsertModel<typeof webinarReports>;

// ============================================================================
// 6. AI 推荐表 (AI Recommendations) - 新建
// ============================================================================

export const aiRecommendations = mysqlTable("ai_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  webinarId: int("webinarId").notNull(),
  productId: int("productId").notNull(),
  recommendationType: mysqlEnum("recommendationType", [
    "high_match", "medium_match", "similar", "trending", "complementary"
  ]).notNull(),
  matchScore: decimal("matchScore", { precision: 3, scale: 2 }), // 0.00-1.00
  matchReasons: json("matchReasons").$type<string[]>(), // ["店铺类别匹配", "价格区间匹配"]
  
  // ===== 行为追踪 =====
  isShown: tinyint("isShown").default(0), // 是否已展示
  shownAt: timestamp("shownAt"),
  isClicked: tinyint("isClicked").default(0), // 是否已点击
  clickedAt: timestamp("clickedAt"),
  isConverted: tinyint("isConverted").default(0), // 是否已转化 (收藏/询价/下单)
  convertedAt: timestamp("convertedAt"),
  conversionType: varchar("conversionType", { length: 50 }), // 'favorite', 'inquiry', 'order'

  // ===== 模型信息 =====
  modelVersion: varchar("modelVersion", { length: 50 }),
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }),

  // ===== 时间戳 =====
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
  productIdIdx: index("idx_productId").on(table.productId),
  recommendationTypeIdx: index("idx_recommendationType").on(table.recommendationType),
}));

export type AIRecommendation = InferSelectModel<typeof aiRecommendations>;
export type InsertAIRecommendation = InferInsertModel<typeof aiRecommendations>;

// ============================================================================
// 7. 外部活动表 (External Events) - 新建
// ============================================================================

export const externalEvents = mysqlTable("external_events", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 100 }).notNull(), // 'Innovation Forum', 'Eventbrite', 'LinkedIn'
  externalId: varchar("externalId", { length: 255 }),
  
  // ===== 基础信息 =====
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subtitle: varchar("subtitle", { length: 500 }),

  // ===== 讲师信息 =====
  speaker: varchar("speaker", { length: 255 }),
  speakerTitle: varchar("speakerTitle", { length: 255 }),
  speakerCompany: varchar("speakerCompany", { length: 255 }),
  speakerBio: text("speakerBio"),
  speakerAvatar: varchar("speakerAvatar", { length: 500 }),
  speakerLinkedin: varchar("speakerLinkedin", { length: 500 }),

  // ===== 组织信息 =====
  organizer: varchar("organizer", { length: 255 }),
  organizerLogo: varchar("organizerLogo", { length: 500 }),
  coOrganizers: json("coOrganizers").$type<string[]>(),

  // ===== 活动信息 =====
  registrationUrl: varchar("registrationUrl", { length: 500 }),
  eventUrl: varchar("eventUrl", { length: 500 }),
  scheduledAt: timestamp("scheduledAt"),
  duration: int("duration"),
  timezone: varchar("timezone", { length: 50 }),
  language: varchar("language", { length: 10 }),

  // ===== 分类信息 =====
  industry: varchar("industry", { length: 100 }),
  topics: json("topics").$type<string[]>(),
  targetAudience: text("targetAudience"),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]),

  // ===== 媒体资源 =====
  coverImage: varchar("coverImage", { length: 500 }),
  promoVideoUrl: varchar("promoVideoUrl", { length: 500 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),

  // ===== 状态 =====
  status: mysqlEnum("status", ["upcoming", "live", "completed", "cancelled"]).default("upcoming").notNull(),
  isSyncedToWebinars: tinyint("isSyncedToWebinars").default(0),
  syncedWebinarId: int("syncedWebinarId"),

  // ===== 数据收集 =====
  collectedAt: timestamp("collectedAt"),
  collectedBy: int("collectedBy"),
  dataQuality: mysqlEnum("dataQuality", ["high", "medium", "low"]),
  notes: text("notes"),

  // ===== 时间戳 =====
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sourceIdx: index("idx_source").on(table.source),
  scheduledAtIdx: index("idx_scheduled_at").on(table.scheduledAt),
  statusIdx: index("idx_status").on(table.status),
  industryIdx: index("idx_industry").on(table.industry),
}));

export type ExternalEvent = InferSelectModel<typeof externalEvents>;
export type InsertExternalEvent = InferInsertModel<typeof externalEvents>;

// ============================================================================
// 8. AI 分析结果表 (AI Analysis Results) - 新建
// ============================================================================

export const aiAnalysisResults = mysqlTable("ai_analysis_results", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["webinar", "product", "buyer", "factory"]).notNull(),
  entityId: int("entityId").notNull(),
  analysisType: varchar("analysisType", { length: 100 }).notNull(), // 'product_recommendation', 'buyer_intent', etc.
  result: json("result").$type<Record<string, unknown>>().notNull(),
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }),
  modelVersion: varchar("modelVersion", { length: 50 }),
  processingTime: int("processingTime"), // 毫秒
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  entityIdx: index("idx_entity").on(table.entityType, table.entityId),
  analysisTypeIdx: index("idx_analysisType").on(table.analysisType),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type AIAnalysisResult = InferSelectModel<typeof aiAnalysisResults>;
export type InsertAIAnalysisResult = InferInsertModel<typeof aiAnalysisResults>;

// ============================================================================
// 9. 用户行为事件表 (User Behavior Events) - 新建
// ============================================================================

export const userBehaviorEvents = mysqlTable("user_behavior_events", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 255 }),
  
  // ===== 事件信息 =====
  eventType: varchar("eventType", { length: 100 }).notNull(), // 'page_view', 'click', 'search', etc.
  eventCategory: varchar("eventCategory", { length: 100 }),
  eventAction: varchar("eventAction", { length: 100 }),
  eventLabel: varchar("eventLabel", { length: 255 }),
  
  // ===== 页面信息 =====
  pageUrl: varchar("pageUrl", { length: 500 }),
  referrerUrl: varchar("referrerUrl", { length: 500 }),
  
  // ===== 实体关联 =====
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  
  // ===== 元数据 =====
  metadata: json("metadata").$type<Record<string, unknown>>(),
  
  // ===== 设备信息 =====
  deviceType: varchar("deviceType", { length: 50 }), // 'desktop', 'mobile', 'tablet'
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  screenResolution: varchar("screenResolution", { length: 50 }),
  
  // ===== 地理信息 =====
  ipAddress: varchar("ipAddress", { length: 45 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  
  // ===== 时间戳 =====
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  eventTypeIdx: index("idx_eventType").on(table.eventType),
  timestampIdx: index("idx_timestamp").on(table.timestamp),
  sessionIdIdx: index("idx_sessionId").on(table.sessionId),
  entityIdx: index("idx_entity").on(table.entityType, table.entityId),
}));

export type UserBehaviorEvent = InferSelectModel<typeof userBehaviorEvents>;
export type InsertUserBehaviorEvent = InferInsertModel<typeof userBehaviorEvents>;

// ============================================================================
// 10. Product Favorites 表增强 (7+ 新字段)
// ============================================================================

export const productFavoritesEnhanced = mysqlTable("product_favorites", {
  // ===== 现有字段 (保留) =====
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),

  // ===== 新增字段 =====
  webinarId: int("webinarId"), // 从哪个会议收藏的
  notes: text("notes"), // 买家备注
  targetPrice: decimal("targetPrice", { precision: 10, scale: 2 }), // 目标价格
  targetQuantity: int("targetQuantity"), // 目标数量
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium"), // 优先级
  status: mysqlEnum("status", ["interested", "contacted", "negotiating", "ordered", "abandoned"]).default("interested"), // 状态
  followUpDate: date("followUpDate"), // 跟进日期
  lastViewedAt: timestamp("lastViewedAt"), // 最后查看时间
  viewCount: int("viewCount").default(1), // 查看次数
  
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  productIdIdx: index("idx_productId").on(table.productId),
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
  statusIdx: index("idx_status").on(table.status),
  priorityIdx: index("idx_priority").on(table.priority),
}));

export type ProductFavoriteEnhanced = InferSelectModel<typeof productFavoritesEnhanced>;
export type InsertProductFavoriteEnhanced = InferInsertModel<typeof productFavoritesEnhanced>;

// ============================================================================
// 11. Product Inquiries 表增强 (10+ 新字段)
// ============================================================================

export const productInquiriesEnhanced = mysqlTable("product_inquiries", {
  // ===== 现有字段 (保留) =====
  id: int("id").autoincrement().primaryKey(),
  buyerId: int("buyerId").notNull(),
  factoryId: int("factoryId").notNull(),
  productId: int("productId"),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "replied", "closed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),

  // ===== 新增字段 =====
  webinarId: int("webinarId"), // 从哪个会议询价的
  quantity: int("quantity"), // 询价数量
  targetPrice: decimal("targetPrice", { precision: 10, scale: 2 }), // 目标价格
  urgency: mysqlEnum("urgency", ["urgent", "normal", "low"]).default("normal"), // 紧急程度
  requirements: json("requirements").$type<{
    customization?: string,
    packaging?: string,
    shipping?: string,
    payment?: string,
    other?: string
  }>(), // 特殊要求
  
  // ===== 响应信息 =====
  responseTime: int("responseTime"), // 响应时间 (分钟)
  responseContent: text("responseContent"), // 回复内容
  quotedPrice: decimal("quotedPrice", { precision: 10, scale: 2 }), // 报价
  quotedMoq: int("quotedMoq"), // 报价 MOQ
  quotedLeadTime: varchar("quotedLeadTime", { length: 100 }), // 报价交期
  respondedBy: int("respondedBy"), // 回复人 ID
  respondedAt: timestamp("respondedAt"), // 回复时间
  
  // ===== 跟进信息 =====
  followUpCount: int("followUpCount").default(0), // 跟进次数
  lastFollowUpAt: timestamp("lastFollowUpAt"), // 最后跟进时间
  nextFollowUpAt: timestamp("nextFollowUpAt"), // 下次跟进时间
  
  // ===== 转化信息 =====
  conversionStatus: mysqlEnum("conversionStatus", [
    "pending", "quoted", "negotiating", "ordered", "lost"
  ]).default("pending"), // 转化状态
  conversionReason: text("conversionReason"), // 转化/流失原因
  orderId: int("orderId"), // 关联订单 ID
  orderValue: decimal("orderValue", { precision: 10, scale: 2 }), // 订单金额
  convertedAt: timestamp("convertedAt"), // 转化时间

}, (table) => ({
  buyerIdIdx: index("idx_buyerId").on(table.buyerId),
  factoryIdIdx: index("idx_factoryId").on(table.factoryId),
  productIdIdx: index("idx_productId").on(table.productId),
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
  statusIdx: index("idx_status").on(table.status),
  urgencyIdx: index("idx_urgency").on(table.urgency),
  conversionStatusIdx: index("idx_conversionStatus").on(table.conversionStatus),
}));

export type ProductInquiryEnhanced = InferSelectModel<typeof productInquiriesEnhanced>;
export type InsertProductInquiryEnhanced = InferInsertModel<typeof productInquiriesEnhanced>;
