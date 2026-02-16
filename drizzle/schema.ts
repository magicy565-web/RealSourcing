import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, json, decimal, bigint, tinyint, date, unique, index } from "drizzle-orm/mysql-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// ============================================================================
// 1. 用户与身份域 (Identity & Access)
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }).unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: varchar("name", { length: 100 }),
  avatar: varchar("avatar", { length: 500 }),
  role: mysqlEnum("role", ["user", "buyer", "factory", "admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "suspended", "deleted"]).default("active").notNull(),
  emailVerified: tinyint("emailVerified").default(0),
  phoneVerified: tinyint("phoneVerified").default(0),
  language: varchar("language", { length: 10 }).default("en"),
  timezone: varchar("timezone", { length: 50 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  lastLoginAt: timestamp("lastLoginAt"),
  lastLoginIp: varchar("lastLoginIp", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  roleIdx: index("idx_role").on(table.role),
  statusIdx: index("idx_status").on(table.status),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  company: varchar("company", { length: 255 }),
  position: varchar("position", { length: 100 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  website: varchar("website", { length: 500 }),
  linkedin: varchar("linkedin", { length: 500 }),
  bio: text("bio"),
  interests: json("interests").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = InferSelectModel<typeof userProfiles>;
export type InsertUserProfile = InferInsertModel<typeof userProfiles>;

// ============================================================================
// 2. 工厂域 (Factory)
// ============================================================================

export const factories = mysqlTable("factories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legalName", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique(),
  logo: varchar("logo", { length: 500 }),
  coverImage: varchar("coverImage", { length: 500 }),
  category: varchar("category", { length: 100 }),
  subCategories: json("subCategories").$type<string[]>(),
  country: varchar("country", { length: 100 }).default("China"),
  province: varchar("province", { length: 100 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  postalCode: varchar("postalCode", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  established: int("established"),
  employees: varchar("employees", { length: 50 }),
  annualRevenue: varchar("annualRevenue", { length: 100 }),
  exportRatio: int("exportRatio"),
  mainMarkets: json("mainMarkets").$type<string[]>(),
  description: text("description"),
  aiSummary: text("aiSummary"),
  status: mysqlEnum("status", ["pending", "verified", "suspended"]).default("pending").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: int("verifiedBy"),
  overallScore: decimal("overallScore", { precision: 3, scale: 2 }).default("0"),
  qualityScore: decimal("qualityScore", { precision: 3, scale: 2 }).default("0"),
  deliveryScore: decimal("deliveryScore", { precision: 3, scale: 2 }).default("0"),
  communicationScore: decimal("communicationScore", { precision: 3, scale: 2 }).default("0"),
  pricingScore: decimal("pricingScore", { precision: 3, scale: 2 }).default("0"),
  complianceScore: decimal("complianceScore", { precision: 3, scale: 2 }).default("0"),
  reviewCount: int("reviewCount").default(0),
  viewCount: int("viewCount").default(0),
  inquiryCount: int("inquiryCount").default(0),
  orderCount: int("orderCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  categoryIdx: index("idx_category").on(table.category),
  statusIdx: index("idx_status").on(table.status),
  overallScoreIdx: index("idx_overallScore").on(table.overallScore),
  cityIdx: index("idx_city").on(table.city),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type Factory = InferSelectModel<typeof factories>;
export type InsertFactory = InferInsertModel<typeof factories>;

export const factoryCertifications = mysqlTable("factory_certifications", {
  id: int("id").autoincrement().primaryKey(),
  factoryId: int("factoryId").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  issuedBy: varchar("issuedBy", { length: 255 }),
  certificateNumber: varchar("certificateNumber", { length: 100 }),
  issuedAt: date("issuedAt"),
  expiresAt: date("expiresAt"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  status: mysqlEnum("status", ["pending", "verified", "expired"]).default("pending").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: int("verifiedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  factoryIdIdx: index("idx_factoryId").on(table.factoryId),
  typeIdx: index("idx_type").on(table.type),
  statusIdx: index("idx_status").on(table.status),
}));

export type FactoryCertification = InferSelectModel<typeof factoryCertifications>;
export type InsertFactoryCertification = InferInsertModel<typeof factoryCertifications>;

export const factoryProducts = mysqlTable("factory_products", {
  id: int("id").autoincrement().primaryKey(),
  factoryId: int("factoryId").notNull(),
  sku: varchar("sku", { length: 100 }),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  specifications: json("specifications").$type<Record<string, unknown>>(),
  features: json("features").$type<string[]>(),
  images: json("images").$type<string[]>(),
  videos: json("videos").$type<string[]>(),
  minOrderQuantity: int("minOrderQuantity"),
  priceRange: varchar("priceRange", { length: 100 }),
  leadTime: varchar("leadTime", { length: 100 }),
  customizable: tinyint("customizable").default(0),
  certifications: json("certifications").$type<string[]>(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  viewCount: int("viewCount").default(0),
  inquiryCount: int("inquiryCount").default(0),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  factoryIdIdx: index("idx_factoryId").on(table.factoryId),
  skuIdx: index("idx_sku").on(table.sku),
  categoryIdx: index("idx_category").on(table.category),
  statusIdx: index("idx_status").on(table.status),
  displayOrderIdx: index("idx_displayOrder").on(table.displayOrder),
}));

export type FactoryProduct = InferSelectModel<typeof factoryProducts>;
export type InsertFactoryProduct = InferInsertModel<typeof factoryProducts>;

export const factoryImages = mysqlTable("factory_images", {
  id: int("id").autoincrement().primaryKey(),
  factoryId: int("factoryId").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["factory", "product", "certification"]).default("factory").notNull(),
  category: varchar("category", { length: 50 }),
  displayOrder: int("displayOrder").default(0),
  isPrimary: tinyint("isPrimary").default(0),
  caption: varchar("caption", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  factoryIdIdx: index("idx_factoryId").on(table.factoryId),
  typeIdx: index("idx_type").on(table.type),
  displayOrderIdx: index("idx_displayOrder").on(table.displayOrder),
}));

export type FactoryImage = InferSelectModel<typeof factoryImages>;
export type InsertFactoryImage = InferInsertModel<typeof factoryImages>;

// ============================================================================
// 3. 采购会议域 (Webinar)
// ============================================================================

export const webinars = mysqlTable("webinars", {
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
  agoraChannelName: varchar("agoraChannelName", { length: 255 }),
  agoraToken: varchar("agoraToken", { length: 500 }),
  recordingEnabled: tinyint("recordingEnabled").default(1),
  recordingStatus: mysqlEnum("recordingStatus", ["none", "recording", "completed", "failed"]),
  recordingUrl: varchar("recordingUrl", { length: 500 }),
  coverImage: varchar("coverImage", { length: 500 }),
  tags: json("tags").$type<string[]>(),
  workSpec: text("workSpec"),
  aiSummary: text("aiSummary"),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  createdByIdIdx: index("idx_createdById").on(table.createdById),
  statusIdx: index("idx_status").on(table.status),
  scheduledAtIdx: index("idx_scheduledAt").on(table.scheduledAt),
  categoryIdx: index("idx_category").on(table.category),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type Webinar = InferSelectModel<typeof webinars>;
export type InsertWebinar = InferInsertModel<typeof webinars>;

export const webinarParticipants = mysqlTable("webinar_participants", {
  id: int("id").autoincrement().primaryKey(),
  webinarId: int("webinarId").notNull(),
  userId: int("userId").notNull(),
  factoryId: int("factoryId"),
  role: mysqlEnum("role", ["host", "presenter", "participant", "observer"]).default("participant").notNull(),
  status: mysqlEnum("status", ["invited", "accepted", "declined", "joined", "left"]).default("invited").notNull(),
  invitedAt: timestamp("invitedAt"),
  joinedAt: timestamp("joinedAt"),
  leftAt: timestamp("leftAt"),
  duration: int("duration"),
  agoraUid: varchar("agoraUid", { length: 100 }),
  hasVideo: tinyint("hasVideo").default(0),
  hasAudio: tinyint("hasAudio").default(0),
  screenSharing: tinyint("screenSharing").default(0),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
  userIdIdx: index("idx_userId").on(table.userId),
  factoryIdIdx: index("idx_factoryId").on(table.factoryId),
  statusIdx: index("idx_status").on(table.status),
  webinarUserUnique: unique("unique_webinar_user").on(table.webinarId, table.userId),
}));

export type WebinarParticipant = InferSelectModel<typeof webinarParticipants>;
export type InsertWebinarParticipant = InferInsertModel<typeof webinarParticipants>;

// ============================================================================
// 4. 询价报价域 (RFQ & Quotation)
// ============================================================================

export const rfqs = mysqlTable("rfqs", {
  id: int("id").autoincrement().primaryKey(),
  rfqNumber: varchar("rfqNumber", { length: 50 }).notNull().unique(),
  buyerId: int("buyerId").notNull(),
  webinarId: int("webinarId"),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  specifications: json("specifications").$type<Record<string, unknown>>(),
  targetPrice: decimal("targetPrice", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  quantity: int("quantity"),
  unit: varchar("unit", { length: 50 }),
  targetDeliveryDate: date("targetDeliveryDate"),
  deliveryTerms: varchar("deliveryTerms", { length: 50 }),
  paymentTerms: varchar("paymentTerms", { length: 100 }),
  attachments: json("attachments").$type<string[]>(),
  status: mysqlEnum("status", ["draft", "published", "closed", "cancelled"]).default("draft").notNull(),
  expiresAt: timestamp("expiresAt"),
  quotationCount: int("quotationCount").default(0),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  buyerIdIdx: index("idx_buyerId").on(table.buyerId),
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
  statusIdx: index("idx_status").on(table.status),
  categoryIdx: index("idx_category").on(table.category),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type RFQ = InferSelectModel<typeof rfqs>;
export type InsertRFQ = InferInsertModel<typeof rfqs>;

export const quotations = mysqlTable("quotations", {
  id: int("id").autoincrement().primaryKey(),
  quotationNumber: varchar("quotationNumber", { length: 50 }).notNull().unique(),
  rfqId: int("rfqId").notNull(),
  factoryId: int("factoryId").notNull(),
  userId: int("userId").notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }),
  leadTime: varchar("leadTime", { length: 100 }),
  deliveryTerms: varchar("deliveryTerms", { length: 50 }),
  paymentTerms: varchar("paymentTerms", { length: 100 }),
  validUntil: date("validUntil"),
  notes: text("notes"),
  attachments: json("attachments").$type<string[]>(),
  status: mysqlEnum("status", ["draft", "submitted", "accepted", "rejected", "expired"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  acceptedAt: timestamp("acceptedAt"),
  rejectedAt: timestamp("rejectedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  rfqIdIdx: index("idx_rfqId").on(table.rfqId),
  factoryIdIdx: index("idx_factoryId").on(table.factoryId),
  userIdIdx: index("idx_userId").on(table.userId),
  statusIdx: index("idx_status").on(table.status),
  submittedAtIdx: index("idx_submittedAt").on(table.submittedAt),
}));

export type Quotation = InferSelectModel<typeof quotations>;
export type InsertQuotation = InferInsertModel<typeof quotations>;

// ============================================================================
// 5. 订单域 (Order)
// ============================================================================

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  buyerId: int("buyerId").notNull(),
  factoryId: int("factoryId").notNull(),
  webinarId: int("webinarId"),
  rfqId: int("rfqId"),
  quotationId: int("quotationId"),
  type: mysqlEnum("type", ["intent", "formal"]).default("intent").notNull(),
  status: mysqlEnum("status", ["draft", "pending", "confirmed", "production", "shipped", "delivered", "cancelled"]).default("draft").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  paymentTerms: varchar("paymentTerms", { length: 100 }),
  deliveryTerms: varchar("deliveryTerms", { length: 50 }),
  deliveryAddress: text("deliveryAddress"),
  targetDeliveryDate: date("targetDeliveryDate"),
  actualDeliveryDate: date("actualDeliveryDate"),
  notes: text("notes"),
  contractUrl: varchar("contractUrl", { length: 500 }),
  confirmedAt: timestamp("confirmedAt"),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  cancelledAt: timestamp("cancelledAt"),
  cancellationReason: text("cancellationReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  buyerIdIdx: index("idx_buyerId").on(table.buyerId),
  factoryIdIdx: index("idx_factoryId").on(table.factoryId),
  statusIdx: index("idx_status").on(table.status),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type Order = InferSelectModel<typeof orders>;
export type InsertOrder = InferInsertModel<typeof orders>;

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  specifications: json("specifications").$type<Record<string, unknown>>(),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orderIdIdx: index("idx_orderId").on(table.orderId),
  productIdIdx: index("idx_productId").on(table.productId),
}));

export type OrderItem = InferSelectModel<typeof orderItems>;
export type InsertOrderItem = InferInsertModel<typeof orderItems>;

// ============================================================================
// 6. 消息通信域 (Messaging)
// ============================================================================

export const rtmMessages = mysqlTable("rtm_messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId"),
  channelName: varchar("channelName", { length: 255 }),
  messageType: mysqlEnum("messageType", ["private", "channel"]).default("private").notNull(),
  contentType: mysqlEnum("contentType", ["text", "image", "file"]).default("text").notNull(),
  content: text("content").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  isRead: tinyint("isRead").default(0),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  senderIdIdx: index("idx_senderId").on(table.senderId),
  receiverIdIdx: index("idx_receiverId").on(table.receiverId),
  channelNameIdx: index("idx_channelName").on(table.channelName),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type RtmMessage = InferSelectModel<typeof rtmMessages>;
export type InsertRtmMessage = InferInsertModel<typeof rtmMessages>;

export const rtmConversations = mysqlTable("rtm_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  targetUserId: int("targetUserId"),
  channelName: varchar("channelName", { length: 255 }),
  conversationType: mysqlEnum("conversationType", ["private", "channel"]).default("private").notNull(),
  lastMessageId: int("lastMessageId"),
  lastMessageContent: text("lastMessageContent"),
  lastMessageAt: timestamp("lastMessageAt"),
  unreadCount: int("unreadCount").default(0),
  isPinned: tinyint("isPinned").default(0),
  isMuted: tinyint("isMuted").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  targetUserIdIdx: index("idx_targetUserId").on(table.targetUserId),
  channelNameIdx: index("idx_channelName").on(table.channelName),
  updatedAtIdx: index("idx_updatedAt").on(table.updatedAt),
  uniqueConversation: unique("unique_conversation").on(table.userId, table.targetUserId, table.channelName),
}));

export type RtmConversation = InferSelectModel<typeof rtmConversations>;
export type InsertRtmConversation = InferInsertModel<typeof rtmConversations>;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  data: json("data").$type<Record<string, unknown>>(),
  isRead: tinyint("isRead").default(0),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  typeIdx: index("idx_type").on(table.type),
  isReadIdx: index("idx_isRead").on(table.isRead),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type Notification = InferSelectModel<typeof notifications>;
export type InsertNotification = InferInsertModel<typeof notifications>;

// ============================================================================
// 7. SaaS 商业化域 (Subscription & Billing)
// ============================================================================

export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }),
  description: text("description"),
  priceMonthly: decimal("priceMonthly", { precision: 10, scale: 2 }).notNull(),
  priceYearly: decimal("priceYearly", { precision: 10, scale: 2 }).notNull(),
  priceMonthlyUSD: decimal("priceMonthlyUSD", { precision: 10, scale: 2 }),
  priceYearlyUSD: decimal("priceYearlyUSD", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("CNY"),
  trialDays: int("trialDays").default(0),
  features: json("features").$type<string[]>().notNull(),
  limits: json("limits").$type<Record<string, number>>().notNull(),
  isActive: tinyint("isActive").default(1),
  isPopular: tinyint("isPopular").default(0),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  isActiveIdx: index("idx_isActive").on(table.isActive),
  displayOrderIdx: index("idx_displayOrder").on(table.displayOrder),
}));

export type SubscriptionPlan = InferSelectModel<typeof subscriptionPlans>;
export type InsertSubscriptionPlan = InferInsertModel<typeof subscriptionPlans>;

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: varchar("planId", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["trial", "active", "expired", "cancelled", "suspended"]).default("trial").notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("CNY"),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  trialStart: timestamp("trialStart"),
  trialEnd: timestamp("trialEnd"),
  autoRenew: tinyint("autoRenew").default(1),
  renewalDate: timestamp("renewalDate"),
  cancelledAt: timestamp("cancelledAt"),
  cancellationReason: text("cancellationReason"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  planIdIdx: index("idx_planId").on(table.planId),
  statusIdx: index("idx_status").on(table.status),
  currentPeriodEndIdx: index("idx_currentPeriodEnd").on(table.currentPeriodEnd),
}));

export type Subscription = InferSelectModel<typeof subscriptions>;
export type InsertSubscription = InferInsertModel<typeof subscriptions>;

export const paymentOrders = mysqlTable("payment_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNo: varchar("orderNo", { length: 64 }).notNull().unique(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  planId: varchar("planId", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["subscription", "recharge", "upgrade"]).default("subscription").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("CNY"),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentId: varchar("paymentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded", "cancelled"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  refundedAt: timestamp("refundedAt"),
  refundAmount: decimal("refundAmount", { precision: 10, scale: 2 }),
  refundReason: text("refundReason"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  subscriptionIdIdx: index("idx_subscriptionId").on(table.subscriptionId),
  statusIdx: index("idx_status").on(table.status),
  paidAtIdx: index("idx_paidAt").on(table.paidAt),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type PaymentOrder = InferSelectModel<typeof paymentOrders>;
export type InsertPaymentOrder = InferInsertModel<typeof paymentOrders>;

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  userId: int("userId").notNull(),
  paymentOrderId: int("paymentOrderId").notNull(),
  type: mysqlEnum("type", ["vat", "receipt"]).default("receipt").notNull(),
  status: mysqlEnum("status", ["pending", "issued", "sent", "cancelled"]).default("pending").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("CNY"),
  companyName: varchar("companyName", { length: 255 }),
  taxNumber: varchar("taxNumber", { length: 100 }),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  bankName: varchar("bankName", { length: 255 }),
  bankAccount: varchar("bankAccount", { length: 100 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  issuedAt: timestamp("issuedAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  paymentOrderIdIdx: index("idx_paymentOrderId").on(table.paymentOrderId),
  statusIdx: index("idx_status").on(table.status),
  issuedAtIdx: index("idx_issuedAt").on(table.issuedAt),
}));

export type Invoice = InferSelectModel<typeof invoices>;
export type InsertInvoice = InferInsertModel<typeof invoices>;

export const usageRecords = mysqlTable("usage_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  resourceType: varchar("resourceType", { length: 50 }).notNull(),
  count: int("count").default(1),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  resourceTypeIdx: index("idx_resourceType").on(table.resourceType),
  periodStartIdx: index("idx_periodStart").on(table.periodStart),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type UsageRecord = InferSelectModel<typeof usageRecords>;
export type InsertUsageRecord = InferInsertModel<typeof usageRecords>;

// ============================================================================
// 8. 评价评分域 (Rating & Review)
// ============================================================================

export const factoryReviews = mysqlTable("factory_reviews", {
  id: int("id").autoincrement().primaryKey(),
  factoryId: int("factoryId").notNull(),
  buyerId: int("buyerId").notNull(),
  orderId: int("orderId"),
  webinarId: int("webinarId"),
  overallScore: decimal("overallScore", { precision: 3, scale: 2 }).notNull(),
  qualityScore: decimal("qualityScore", { precision: 3, scale: 2 }),
  deliveryScore: decimal("deliveryScore", { precision: 3, scale: 2 }),
  communicationScore: decimal("communicationScore", { precision: 3, scale: 2 }),
  pricingScore: decimal("pricingScore", { precision: 3, scale: 2 }),
  complianceScore: decimal("complianceScore", { precision: 3, scale: 2 }),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  pros: text("pros"),
  cons: text("cons"),
  images: json("images").$type<string[]>(),
  isVerified: tinyint("isVerified").default(0),
  isAnonymous: tinyint("isAnonymous").default(0),
  status: mysqlEnum("status", ["pending", "published", "hidden"]).default("pending").notNull(),
  helpfulCount: int("helpfulCount").default(0),
  replyContent: text("replyContent"),
  repliedAt: timestamp("repliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  factoryIdIdx: index("idx_factoryId").on(table.factoryId),
  buyerIdIdx: index("idx_buyerId").on(table.buyerId),
  orderIdIdx: index("idx_orderId").on(table.orderId),
  statusIdx: index("idx_status").on(table.status),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type FactoryReview = InferSelectModel<typeof factoryReviews>;
export type InsertFactoryReview = InferInsertModel<typeof factoryReviews>;

// ============================================================================
// 9. 系统管理域 (System)
// ============================================================================

export const auditLogs = mysqlTable("audit_logs", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  changes: json("changes").$type<Record<string, unknown>>(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_userId").on(table.userId),
  actionIdx: index("idx_action").on(table.action),
  entityTypeIdx: index("idx_entityType").on(table.entityType),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type AuditLog = InferSelectModel<typeof auditLogs>;
export type InsertAuditLog = InferInsertModel<typeof auditLogs>;

export const systemSettings = mysqlTable("system_settings", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  type: mysqlEnum("type", ["string", "number", "boolean", "json"]).default("string").notNull(),
  description: text("description"),
  isPublic: tinyint("isPublic").default(0),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index("idx_category").on(table.category),
  categoryKeyUnique: unique("unique_category_key").on(table.category, table.key),
}));

export type SystemSetting = InferSelectModel<typeof systemSettings>;
export type InsertSystemSetting = InferInsertModel<typeof systemSettings>;

// ============================================================================
// 10. 报告域 (Reports)
// ============================================================================

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["supplier_evaluation", "profit_analysis", "negotiation_summary"]).default("supplier_evaluation").notNull(),
  webinarId: int("webinarId"),
  content: text("content"),
  aiAnalysis: text("aiAnalysis"),
  status: mysqlEnum("status", ["generating", "completed", "failed"]).default("generating").notNull(),
  factoriesAnalyzed: int("factoriesAnalyzed").default(0),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  createdByIdIdx: index("idx_createdById").on(table.createdById),
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
  statusIdx: index("idx_status").on(table.status),
  createdAtIdx: index("idx_createdAt").on(table.createdAt),
}));

export type Report = InferSelectModel<typeof reports>;
export type InsertReport = InferInsertModel<typeof reports>;

export const negotiationEvents = mysqlTable("negotiation_events", {
  id: int("id").autoincrement().primaryKey(),
  webinarId: int("webinarId").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdById: int("createdById"),
}, (table) => ({
  webinarIdIdx: index("idx_webinarId").on(table.webinarId),
  typeIdx: index("idx_type").on(table.type),
  timestampIdx: index("idx_timestamp").on(table.timestamp),
}));

export type NegotiationEvent = InferSelectModel<typeof negotiationEvents>;
export type InsertNegotiationEvent = InferInsertModel<typeof negotiationEvents>;
