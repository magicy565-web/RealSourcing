import { 
  getDb, 
} from "./db.js";
import {
  orders, 
  orderItems, 
  quotations, 
  factoryReviews, 
  factoryCertifications, 
  factoryProducts,
  auditLogs,
  type InsertAuditLog
} from "../drizzle/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * 创建审计日志
 * 修改签名以兼容多种调用方式，彻底解决 TS2554 报错
 */
export async function createAuditLog(userId: number | null, data?: any) {
  const db = await getDb();
  if (!db) return;

  try {
    // 如果只传入了一个参数（即 data 为 undefined），则尝试从第一个参数中解析
    let finalUserId = userId;
    let finalData = data;

    if (data === undefined && typeof userId === 'object' && userId !== null) {
      // 兼容 createAuditLog({ userId, action, ... }) 的调用
      finalUserId = (userId as any).userId;
      finalData = userId;
    }

    await db.insert(auditLogs).values({
      userId: finalUserId,
      action: finalData?.action || 'unknown',
      entityType: finalData?.entityType,
      entityId: finalData?.entityId,
      metadata: finalData?.metadata,
    });
  } catch (error) {
    console.error('[Database] Failed to create audit log:', error);
  }
}

/**
 * 获取订单列表
 */
export async function getOrders(buyerId?: number, factoryId?: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [];
  if (buyerId) conditions.push(eq(orders.buyerId, buyerId));
  if (factoryId) conditions.push(eq(orders.factoryId, factoryId));
  if (status) {
    conditions.push(sql`${orders.status} = ${status}`);
  }
  
  return await db.select()
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));
}

/**
 * 获取订单详情
 */
export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (results.length === 0) return null;
  
  const order = results[0];
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  
  return { ...order, items };
}

/**
 * 创建订单
 */
export async function createOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const orderData = {
    ...data,
    orderNumber: data.orderNumber || 'ORD' + Date.now(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await db.insert(orders).values(orderData);
  return result[0].insertId;
}

/**
 * 创建订单项
 */
export async function createOrderItem(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orderItems).values(data);
  return result[0].insertId;
}

/**
 * 更新订单状态
 */
export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders)
    .set({ 
      status: sql`${status}`, 
      updatedAt: new Date() 
    })
    .where(eq(orders.id, id));
}

/**
 * 创建报价
 */
export async function createQuotation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const quoteData = {
    ...data,
    quotationNumber: data.quotationNumber || 'QT' + Date.now(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await db.insert(quotations).values(quoteData);
  return result[0].insertId;
}

/**
 * 获取报价列表
 */
export async function getQuotations(rfqId?: number, factoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [];
  if (rfqId) conditions.push(eq(quotations.rfqId, rfqId));
  if (factoryId) conditions.push(eq(quotations.factoryId, factoryId));
  
  return await db.select()
    .from(quotations)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(quotations.createdAt));
}

/**
 * 获取报价详情
 */
export async function getQuotationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(quotations).where(eq(quotations.id, id)).limit(1);
  return results.length > 0 ? results[0] : null;
}

/**
 * 获取工厂认证
 */
export async function getFactoryCertifications(factoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(factoryCertifications).where(eq(factoryCertifications.factoryId, factoryId));
}

/**
 * 创建工厂认证
 */
export async function createFactoryCertification(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(factoryCertifications).values(data);
  return result[0].insertId;
}

/**
 * 更新工厂认证
 */
export async function updateFactoryCertification(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(factoryCertifications).set({ ...data, updatedAt: new Date() }).where(eq(factoryCertifications.id, id));
}

/**
 * 删除工厂认证
 */
export async function deleteFactoryCertification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(factoryCertifications).where(eq(factoryCertifications.id, id));
}

/**
 * 获取工厂产品
 */
export async function getFactoryProducts(factoryId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  let conditions = [eq(factoryProducts.factoryId, factoryId)];
  if (status) {
    conditions.push(sql`${factoryProducts.status} = ${status}`);
  }
  return await db.select().from(factoryProducts).where(and(...conditions)).orderBy(desc(factoryProducts.createdAt));
}

/**
 * 获取产品详情
 */
export async function getFactoryProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(factoryProducts).where(eq(factoryProducts.id, id)).limit(1);
  return results.length > 0 ? results[0] : null;
}

/**
 * 创建工厂产品
 */
export async function createFactoryProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(factoryProducts).values(data);
  return result[0].insertId;
}

/**
 * 更新工厂产品
 */
export async function updateFactoryProduct(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(factoryProducts).set({ ...data, updatedAt: new Date() }).where(eq(factoryProducts.id, id));
}

/**
 * 删除工厂产品
 */
export async function deleteFactoryProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(factoryProducts).where(eq(factoryProducts.id, id));
}

/**
 * 增加产品浏览量
 */
export async function incrementProductView(id: number) {
  const db = await getDb();
  if (!db) return;
  // Schema 中字段名为 viewCount 而不是 views
  await db.update(factoryProducts)
    .set({ viewCount: sql`${factoryProducts.viewCount} + 1` })
    .where(eq(factoryProducts.id, id));
}

/**
 * 获取工厂评价
 */
export async function getFactoryReviews(factoryId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  let conditions = [eq(factoryReviews.factoryId, factoryId)];
  if (status) {
    conditions.push(sql`${factoryReviews.status} = ${status}`);
  }
  return await db.select().from(factoryReviews).where(and(...conditions)).orderBy(desc(factoryReviews.createdAt));
}

/**
 * 创建评价
 */
export async function createFactoryReview(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(factoryReviews).values(data);
  return result[0].insertId;
}

/**
 * 回复评价
 */
export async function replyToReview(reviewId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(factoryReviews)
    .set({ 
      replyContent: content,
      repliedAt: new Date() 
    })
    .where(eq(factoryReviews.id, reviewId));
}

/**
 * 获取工厂订单
 */
export async function getFactoryOrders(factoryId: number, status?: string) {
  return getOrders(undefined, factoryId, status);
}
