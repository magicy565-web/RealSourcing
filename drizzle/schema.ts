import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Webinars table
export const webinars = mysqlTable("webinars", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "scheduled", "live", "completed", "archived"]).default("draft").notNull(),
  category: varchar("category", { length: 100 }),
  language: varchar("language", { length: 10 }).default("en"),
  scheduledAt: timestamp("scheduledAt"),
  duration: int("duration").default(60),
  createdById: int("createdById").notNull(),
  workSpec: text("workSpec"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Webinar = typeof webinars.$inferSelect;
export type InsertWebinar = typeof webinars.$inferInsert;

// Factories table
export const factories = mysqlTable("factories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  category: varchar("category", { length: 100 }),
  status: mysqlEnum("status", ["pending", "verified", "suspended"]).default("pending").notNull(),
  overallScore: int("overallScore").default(0),
  qualityScore: int("qualityScore").default(0),
  deliveryScore: int("deliveryScore").default(0),
  communicationScore: int("communicationScore").default(0),
  pricingScore: int("pricingScore").default(0),
  complianceScore: int("complianceScore").default(0),
  employees: varchar("employees", { length: 50 }),
  annualRevenue: varchar("annualRevenue", { length: 100 }),
  established: varchar("established", { length: 10 }),
  website: varchar("website", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  certifications: json("certifications").$type<string[]>(),
  specialties: json("specialties").$type<string[]>(),
  aiSummary: text("aiSummary"),
  addedById: int("addedById"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Factory = typeof factories.$inferSelect;
export type InsertFactory = typeof factories.$inferInsert;

// Webinar-Factory relationship (many-to-many)
export const webinarFactories = mysqlTable("webinar_factories", {
  id: int("id").autoincrement().primaryKey(),
  webinarId: int("webinarId").notNull(),
  factoryId: int("factoryId").notNull(),
  role: mysqlEnum("role", ["presenter", "participant"]).default("participant").notNull(),
  status: mysqlEnum("status", ["invited", "accepted", "declined", "joined"]).default("invited").notNull(),
  joinedAt: timestamp("joinedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebinarFactory = typeof webinarFactories.$inferSelect;

// Reports table
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
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// Negotiation events timeline
export const negotiationEvents = mysqlTable("negotiation_events", {
  id: int("id").autoincrement().primaryKey(),
  webinarId: int("webinarId").notNull(),
  type: mysqlEnum("type", ["system", "factory", "presentation", "pricing", "ai_insight", "negotiation", "ai_alert", "agreement"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NegotiationEvent = typeof negotiationEvents.$inferSelect;

// Orders table
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  webinarId: int("webinarId"),
  factoryId: int("factoryId").notNull(),
  buyerId: int("buyerId").notNull(),
  product: varchar("product", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("totalValue", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  terms: text("terms"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

// Webinar resources/assets
export const webinarResources = mysqlTable("webinar_resources", {
  id: int("id").autoincrement().primaryKey(),
  webinarId: int("webinarId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedById: int("uploadedById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebinarResource = typeof webinarResources.$inferSelect;
