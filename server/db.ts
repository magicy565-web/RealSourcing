import { eq, desc, sql, and, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import {
  InsertUser, users,
  webinars, InsertWebinar,
  factories, InsertFactory,
  webinarParticipants,
  reports, InsertReport,
  negotiationEvents,
  orders,
  subscriptionPlans,
  subscriptions, InsertSubscription,
  paymentOrders, InsertPaymentOrder,
  usageRecords,
} from '../drizzle/schema.js';

let _db: any = null;
let _pool: mysql.Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = mysql.createPool(process.env.DATABASE_URL);
      _db = drizzle(_pool);
      console.log('[Database] Connection pool initialized');
    } catch (error) {
      console.error('[Database] Failed to connect:', error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser) {
  if (!user.openId) throw new Error('User openId is required');
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(users).values(user).onDuplicateKeyUpdate({ set: user });
  return await getUserByOpenId(user.openId);
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ WEBINAR QUERIES ============

export async function createWebinar(data: InsertWebinar) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(webinars).values(data);
  return result[0].insertId;
}

export async function getWebinars(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status && status !== 'all') {
    return db.select().from(webinars).where(eq(webinars.status, status as any)).orderBy(desc(webinars.createdAt));
  }
  return db.select().from(webinars).orderBy(desc(webinars.createdAt));
}

export async function getWebinarById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(webinars).where(eq(webinars.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWebinar(id: number, data: Partial<InsertWebinar>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(webinars).set(data).where(eq(webinars.id, id));
}

export async function deleteWebinar(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(webinars).where(eq(webinars.id, id));
}

// ============ FACTORY QUERIES ============

export async function createFactory(data: InsertFactory) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(factories).values(data);
  return result[0].insertId;
}

export async function getFactories(search?: string) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    return db.select().from(factories).where(like(factories.name, `%${search}%`)).orderBy(desc(factories.overallScore));
  }
  return db.select().from(factories).orderBy(desc(factories.overallScore));
}

export async function getFactoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(factories).where(eq(factories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFactory(id: number, data: Partial<InsertFactory>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(factories).set(data).where(eq(factories.id, id));
}

export async function addFactoryToWebinar(webinarId: number, factoryId: number, role: 'presenter' | 'participant' = 'participant') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(webinarParticipants).values({ webinarId, factoryId, role, userId: 0 });
}

export async function getWebinarFactories(webinarId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: webinarParticipants.id,
    factoryId: webinarParticipants.factoryId,
    role: webinarParticipants.role,
    factoryName: factories.name,
    factoryCity: factories.city,
    factoryScore: factories.overallScore,
  })
  .from(webinarParticipants)
  .innerJoin(factories, eq(webinarParticipants.factoryId, factories.id))
  .where(eq(webinarParticipants.webinarId, webinarId));
}

// ============ REPORT QUERIES ============

export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(reports).values(data);
  return result[0].insertId;
}

export async function getReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).orderBy(desc(reports.createdAt));
}

export async function getReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ NEGOTIATION EVENTS ============

export async function addNegotiationEvent(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(negotiationEvents).values(data);
  return result[0].insertId;
}

export async function getWebinarTimeline(webinarId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(negotiationEvents).where(eq(negotiationEvents.webinarId, webinarId)).orderBy(desc(negotiationEvents.timestamp));
}

// ============ ORDER QUERIES ============

export async function getFactoryOrders(factoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.factoryId, factoryId)).orderBy(desc(orders.createdAt));
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { activeWebinars: 0, totalFactories: 0, closedOrders: 0, activeNegotiations: 0 };
  const webinarCountRes = await db.select({ count: sql`count(*)` }).from(webinars).where(eq(webinars.status, 'live'));
  const factoryCountRes = await db.select({ count: sql`count(*)` }).from(factories);
  const orderCountRes = await db.select({ count: sql`count(*)` }).from(orders).where(eq(orders.status, 'delivered'));
  const negotiationCountRes = await db.select({ count: sql`count(*)` }).from(webinars).where(eq(webinars.status, 'scheduled'));
  return {
    activeWebinars: Number(webinarCountRes[0]?.count ?? 0),
    totalFactories: Number(factoryCountRes[0]?.count ?? 0),
    closedOrders: Number(orderCountRes[0]?.count ?? 0),
    activeNegotiations: Number(negotiationCountRes[0]?.count ?? 0),
  };
}

// ============ SUBSCRIPTION QUERIES ============

export async function getSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, 1)).orderBy(subscriptionPlans.displayOrder);
}

export async function getSubscriptionPlanById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active'))).orderBy(desc(subscriptions.createdAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(subscriptions).values(data);
  return result[0].insertId;
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function cancelSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(subscriptions).set({ status: 'cancelled', updatedAt: new Date() }).where(eq(subscriptions.userId, userId));
}

// ============ PAYMENT QUERIES ============

export async function createPaymentOrder(data: InsertPaymentOrder) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(paymentOrders).values(data);
  return result[0].insertId;
}

export async function getPaymentOrderByNo(orderNo: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(paymentOrders).where(eq(paymentOrders.orderNo, orderNo)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentOrder(id: number, data: Partial<InsertPaymentOrder>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(paymentOrders).set(data).where(eq(paymentOrders.id, id));
}

export async function getUserPaymentOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentOrders).where(eq(paymentOrders.userId, userId)).orderBy(desc(paymentOrders.createdAt));
}

// ============ USAGE RECORD QUERIES ============

export async function recordUsage(userId: number, resourceType: string, count: number = 1, metadata?: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  await db.insert(usageRecords).values({ userId, resourceType, count, periodStart, periodEnd, metadata });
}

export async function getMonthlyUsage(userId: number, resourceType: string) {
  const db = await getDb();
  if (!db) return 0;
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const result = await db.select({ total: sql`sum(count)` }).from(usageRecords).where(and(eq(usageRecords.userId, userId), eq(usageRecords.resourceType, resourceType), sql`periodStart >= ${periodStart}`));
  return Number(result[0]?.total ?? 0);
}
