/**
 * 扩展的数据库操作函数
 * 包含所有新增表的 CRUD 操作
 */

import { eq, desc, sql, and, like, inArray, gte, lte, between } from "drizzle-orm";
import { getDb } from "./db";
import {
  // 用户域
  userProfiles, InsertUserProfile,
  
  // 工厂域
  factoryCertifications, InsertFactoryCertification,
  factoryProducts, InsertFactoryProduct,
  
  // 会议域
  webinarParticipants, InsertWebinarParticipant,
  
  // 询价报价域
  rfqs, InsertRFQ,
  quotations, InsertQuotation,
  
  // 订单域
  orders, InsertOrder,
  orderItems, InsertOrderItem,
  
  // 通知域
  notifications, InsertNotification,
  
  // 发票域
  invoices, InsertInvoice,
  
  // 评价域
  factoryReviews, InsertFactoryReview,
  
  // 系统域
  auditLogs, InsertAuditLog,
  systemSettings, InsertSystemSetting,
} from "../drizzle/schema";

// ============================================================================
// 用户资料域 (User Profile)
// ============================================================================

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserProfile(data: InsertUserProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserProfile(data.userId);
  if (existing) {
    await db.update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, data.userId));
  } else {
    await db.insert(userProfiles).values(data);
  }
}

// ============================================================================
// 工厂认证域 (Factory Certification)
// ============================================================================

export async function getFactoryCertifications(factoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(factoryCertifications)
    .where(eq(factoryCertifications.factoryId, factoryId))
    .orderBy(desc(factoryCertifications.createdAt));
}

export async function createFactoryCertification(data: InsertFactoryCertification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(factoryCertifications).values(data);
  return result[0].insertId;
}

export async function updateFactoryCertification(id: number, data: Partial<InsertFactoryCertification>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(factoryCertifications).set(data).where(eq(factoryCertifications.id, id));
}

export async function deleteFactoryCertification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(factoryCertifications).where(eq(factoryCertifications.id, id));
}

// ============================================================================
// 工厂产品域 (Factory Product)
// ============================================================================

export async function getFactoryProducts(factoryId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(factoryProducts.factoryId, factoryId)];
  if (status) {
    conditions.push(eq(factoryProducts.status, status as any));
  }
  
  return db.select().from(factoryProducts)
    .where(and(...conditions))
    .orderBy(factoryProducts.displayOrder, desc(factoryProducts.createdAt));
}

export async function getFactoryProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(factoryProducts)
    .where(eq(factoryProducts.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFactoryProduct(data: InsertFactoryProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(factoryProducts).values(data);
  return result[0].insertId;
}

export async function updateFactoryProduct(id: number, data: Partial<InsertFactoryProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(factoryProducts).set(data).where(eq(factoryProducts.id, id));
}

export async function deleteFactoryProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(factoryProducts)
    .set({ deletedAt: new Date() })
    .where(eq(factoryProducts.id, id));
}

export async function incrementProductView(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(factoryProducts)
    .set({ viewCount: sql`${factoryProducts.viewCount} + 1` })
    .where(eq(factoryProducts.id, id));
}

// ============================================================================
// 会议参与者域 (Webinar Participant)
// ============================================================================

export async function getWebinarParticipants(webinarId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webinarParticipants)
    .where(eq(webinarParticipants.webinarId, webinarId))
    .orderBy(webinarParticipants.role, desc(webinarParticipants.joinedAt));
}

export async function addWebinarParticipant(data: InsertWebinarParticipant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(webinarParticipants).values(data);
  return result[0].insertId;
}

export async function updateWebinarParticipant(id: number, data: Partial<InsertWebinarParticipant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(webinarParticipants).set(data).where(eq(webinarParticipants.id, id));
}

export async function updateParticipantStatus(
  webinarId: number,
  userId: number,
  status: "invited" | "accepted" | "declined" | "joined" | "left"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (status === "joined") {
    updateData.joinedAt = new Date();
  } else if (status === "left") {
    updateData.leftAt = new Date();
  }
  
  await db.update(webinarParticipants)
    .set(updateData)
    .where(and(
      eq(webinarParticipants.webinarId, webinarId),
      eq(webinarParticipants.userId, userId)
    ));
}

// ============================================================================
// 询价单域 (RFQ)
// ============================================================================

export async function getRFQs(buyerId?: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (buyerId) conditions.push(eq(rfqs.buyerId, buyerId));
  if (status) conditions.push(eq(rfqs.status, status as any));
  
  return db.select().from(rfqs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(rfqs.createdAt));
}

export async function getRFQById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(rfqs)
    .where(eq(rfqs.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createRFQ(data: InsertRFQ) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 生成 RFQ 编号
  if (!data.rfqNumber) {
    const timestamp = Date.now();
    data.rfqNumber = `RFQ${timestamp}`;
  }
  
  const result = await db.insert(rfqs).values(data);
  return result[0].insertId;
}

export async function updateRFQ(id: number, data: Partial<InsertRFQ>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(rfqs).set(data).where(eq(rfqs.id, id));
}

export async function incrementRFQView(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(rfqs)
    .set({ viewCount: sql`${rfqs.viewCount} + 1` })
    .where(eq(rfqs.id, id));
}

// ============================================================================
// 报价单域 (Quotation)
// ============================================================================

export async function getQuotations(rfqId?: number, factoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (rfqId) conditions.push(eq(quotations.rfqId, rfqId));
  if (factoryId) conditions.push(eq(quotations.factoryId, factoryId));
  
  return db.select().from(quotations)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(quotations.submittedAt));
}

export async function getQuotationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quotations)
    .where(eq(quotations.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createQuotation(data: InsertQuotation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 生成报价编号
  if (!data.quotationNumber) {
    const timestamp = Date.now();
    data.quotationNumber = `QT${timestamp}`;
  }
  
  const result = await db.insert(quotations).values(data);
  
  // 更新 RFQ 的报价数量
  await db.update(rfqs)
    .set({ quotationCount: sql`${rfqs.quotationCount} + 1` })
    .where(eq(rfqs.id, data.rfqId));
  
  return result[0].insertId;
}

export async function updateQuotation(id: number, data: Partial<InsertQuotation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotations).set(data).where(eq(quotations.id, id));
}

export async function acceptQuotation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotations)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(eq(quotations.id, id));
}

export async function rejectQuotation(id: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotations)
    .set({ status: "rejected", rejectedAt: new Date(), rejectionReason: reason })
    .where(eq(quotations.id, id));
}

// ============================================================================
// 订单域 (Order)
// ============================================================================

export async function getOrders(buyerId?: number, factoryId?: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (buyerId) conditions.push(eq(orders.buyerId, buyerId));
  if (factoryId) conditions.push(eq(orders.factoryId, factoryId));
  if (status) conditions.push(eq(orders.status, status as any));
  
  return db.select().from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 生成订单编号
  if (!data.orderNumber) {
    const timestamp = Date.now();
    data.orderNumber = `ORD${timestamp}`;
  }
  
  const result = await db.insert(orders).values(data);
  
  // 更新工厂订单数量
  await db.update(factories)
    .set({ orderCount: sql`${factories.orderCount} + 1` })
    .where(eq(factories.id, data.factoryId));
  
  return result[0].insertId;
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(data).where(eq(orders.id, id));
}

export async function updateOrderStatus(
  id: number,
  status: "draft" | "pending" | "confirmed" | "production" | "shipped" | "delivered" | "cancelled"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (status === "confirmed") {
    updateData.confirmedAt = new Date();
  } else if (status === "shipped") {
    updateData.shippedAt = new Date();
  } else if (status === "delivered") {
    updateData.deliveredAt = new Date();
  } else if (status === "cancelled") {
    updateData.cancelledAt = new Date();
  }
  
  await db.update(orders).set(updateData).where(eq(orders.id, id));
}

// ============================================================================
// 订单项域 (Order Item)
// ============================================================================

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(orderItems.id);
}

export async function createOrderItem(data: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderItems).values(data);
  return result[0].insertId;
}

export async function updateOrderItem(id: number, data: Partial<InsertOrderItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orderItems).set(data).where(eq(orderItems.id, id));
}

export async function deleteOrderItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orderItems).where(eq(orderItems.id, id));
}

// ============================================================================
// 通知域 (Notification)
// ============================================================================

export async function getUserNotifications(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, 0)
    ));
  return result[0]?.count ?? 0;
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications)
    .set({ isRead: 1, readAt: new Date() })
    .where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications)
    .set({ isRead: 1, readAt: new Date() })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, 0)
    ));
}

// ============================================================================
// 发票域 (Invoice)
// ============================================================================

export async function getUserInvoices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices)
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 生成发票编号
  if (!data.invoiceNumber) {
    const timestamp = Date.now();
    data.invoiceNumber = `INV${timestamp}`;
  }
  
  const result = await db.insert(invoices).values(data);
  return result[0].insertId;
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

// ============================================================================
// 工厂评价域 (Factory Review)
// ============================================================================

export async function getFactoryReviews(factoryId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(factoryReviews.factoryId, factoryId)];
  if (status) {
    conditions.push(eq(factoryReviews.status, status as any));
  }
  
  return db.select().from(factoryReviews)
    .where(and(...conditions))
    .orderBy(desc(factoryReviews.createdAt));
}

export async function getReviewById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(factoryReviews)
    .where(eq(factoryReviews.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createFactoryReview(data: InsertFactoryReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(factoryReviews).values(data);
  
  // 更新工厂评分和评价数量
  await updateFactoryScores(data.factoryId);
  
  return result[0].insertId;
}

export async function updateFactoryReview(id: number, data: Partial<InsertFactoryReview>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(factoryReviews).set(data).where(eq(factoryReviews.id, id));
}

export async function replyToReview(id: number, replyContent: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(factoryReviews)
    .set({ replyContent, repliedAt: new Date() })
    .where(eq(factoryReviews.id, id));
}

/**
 * 更新工厂的评分（基于所有已发布的评价）
 */
async function updateFactoryScores(factoryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const reviews = await db.select().from(factoryReviews)
    .where(and(
      eq(factoryReviews.factoryId, factoryId),
      eq(factoryReviews.status, "published")
    ));
  
  if (reviews.length === 0) return;
  
  const scores = {
    overall: 0,
    quality: 0,
    delivery: 0,
    communication: 0,
    pricing: 0,
    compliance: 0,
  };
  
  reviews.forEach(review => {
    scores.overall += parseFloat(review.overallScore?.toString() || "0");
    scores.quality += parseFloat(review.qualityScore?.toString() || "0");
    scores.delivery += parseFloat(review.deliveryScore?.toString() || "0");
    scores.communication += parseFloat(review.communicationScore?.toString() || "0");
    scores.pricing += parseFloat(review.pricingScore?.toString() || "0");
    scores.compliance += parseFloat(review.complianceScore?.toString() || "0");
  });
  
  const count = reviews.length;
  
  await db.update(factories)
    .set({
      overallScore: (scores.overall / count).toFixed(2),
      qualityScore: (scores.quality / count).toFixed(2),
      deliveryScore: (scores.delivery / count).toFixed(2),
      communicationScore: (scores.communication / count).toFixed(2),
      pricingScore: (scores.pricing / count).toFixed(2),
      complianceScore: (scores.compliance / count).toFixed(2),
      reviewCount: count,
    })
    .where(eq(factories.id, factoryId));
}

// ============================================================================
// 审计日志域 (Audit Log)
// ============================================================================

export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(auditLogs).values(data);
  return result[0].insertId;
}

export async function getAuditLogs(
  userId?: number,
  action?: string,
  entityType?: string,
  limit: number = 100
) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (userId) conditions.push(eq(auditLogs.userId, userId));
  if (action) conditions.push(eq(auditLogs.action, action));
  if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
  
  return db.select().from(auditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

// ============================================================================
// 系统设置域 (System Settings)
// ============================================================================

export async function getSystemSettings(category?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (category) {
    return db.select().from(systemSettings)
      .where(eq(systemSettings.category, category))
      .orderBy(systemSettings.key);
  }
  
  return db.select().from(systemSettings).orderBy(systemSettings.category, systemSettings.key);
}

export async function getSystemSetting(category: string, key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(systemSettings)
    .where(and(
      eq(systemSettings.category, category),
      eq(systemSettings.key, key)
    ))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSystemSetting(data: InsertSystemSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSystemSetting(data.category, data.key);
  if (existing) {
    await db.update(systemSettings)
      .set(data)
      .where(and(
        eq(systemSettings.category, data.category),
        eq(systemSettings.key, data.key)
      ));
  } else {
    await db.insert(systemSettings).values(data);
  }
}

// 导入 factories 表
import { factories } from "../drizzle/schema";
