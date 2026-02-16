import { eq, desc, sql, and, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.js';

let _db: any = null;
let _pool: any = null;

export async function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[Database] ERROR: DATABASE_URL environment variable is missing!');
      return null;
    }

    try {
      const isProd = process.env.NODE_ENV === 'production';
      console.log('[Database] Connecting to database...', { 
        urlLength: dbUrl.length,
        isProd 
      });
      
      _pool = mysql.createPool({
        uri: dbUrl,
        ssl: false,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 30000, // 30s timeout
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
      
      _db = drizzle(_pool, { schema, mode: 'default' });
      
      // Test connection immediately
      await _pool.query('SELECT 1');
      console.log('[Database] Connection test successful');
    } catch (error: any) {
      console.error('[Database] Connection failed:', {
        message: error.message,
        code: error.code,
        errno: error.errno
      });
      _db = null;
      throw error; // Re-throw to be caught by the route handler
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: any) {
  if (!user.openId) throw new Error('User openId is required');
  const db = await getDb();
  if (!db) throw new Error('Database connection not initialized');
  
  try {
    console.log('[Database] Upserting user:', user.email);
    await db.insert(schema.users).values(user).onDuplicateKeyUpdate({ set: user });
    return await getUserByOpenId(user.openId);
  } catch (error: any) {
    console.error('[Database] Upsert user failed:', error.message);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.users).where(eq(schema.users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ WEBINAR QUERIES ============

export async function createWebinar(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(schema.webinars).values(data);
  return result[0].insertId;
}

export async function getWebinars(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status && status !== 'all') {
    return db.select().from(schema.webinars).where(eq(schema.webinars.status, status as any)).orderBy(desc(schema.webinars.createdAt));
  }
  return db.select().from(schema.webinars).orderBy(desc(schema.webinars.createdAt));
}

export async function getWebinarById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.webinars).where(eq(schema.webinars.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWebinar(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(schema.webinars).set(data).where(eq(schema.webinars.id, id));
}

export async function deleteWebinar(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(schema.webinars).where(eq(schema.webinars.id, id));
}

// ============ FACTORY QUERIES ============

export async function createFactory(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(schema.factories).values(data);
  return result[0].insertId;
}

export async function getFactories(search?: string) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    return db.select().from(schema.factories).where(like(schema.factories.name, `%${search}%`)).orderBy(desc(schema.factories.overallScore));
  }
  return db.select().from(schema.factories).orderBy(desc(schema.factories.overallScore));
}

export async function getFactoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.factories).where(eq(schema.factories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFactory(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(schema.factories).set(data).where(eq(schema.factories.id, id));
}

export async function addFactoryToWebinar(webinarId: number, factoryId: number, role: 'presenter' | 'participant' = 'participant') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(schema.webinarParticipants).values({ webinarId, factoryId, role, userId: 0 });
}

export async function getWebinarFactories(webinarId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: schema.webinarParticipants.id,
    factoryId: schema.webinarParticipants.factoryId,
    role: schema.webinarParticipants.role,
    factoryName: schema.factories.name,
    factoryCity: schema.factories.city,
    factoryScore: schema.factories.overallScore,
  })
  .from(schema.webinarParticipants)
  .innerJoin(schema.factories, eq(schema.webinarParticipants.factoryId, schema.factories.id))
  .where(eq(schema.webinarParticipants.webinarId, webinarId));
}

// ============ REPORT QUERIES ============

export async function createReport(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(schema.reports).values(data);
  return result[0].insertId;
}

export async function getReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.reports).orderBy(desc(schema.reports.createdAt));
}

export async function getReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.reports).where(eq(schema.reports.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ NEGOTIATION EVENTS ============

export async function addNegotiationEvent(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(schema.negotiationEvents).values(data);
  return result[0].insertId;
}

export async function getWebinarTimeline(webinarId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.negotiationEvents).where(eq(schema.negotiationEvents.webinarId, webinarId)).orderBy(desc(schema.negotiationEvents.timestamp));
}

// ============ ORDER QUERIES ============

export async function getFactoryOrders(factoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.orders).where(eq(schema.orders.factoryId, factoryId)).orderBy(desc(schema.orders.createdAt));
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { activeWebinars: 0, totalFactories: 0, closedOrders: 0, activeNegotiations: 0 };
  const webinarCountRes = await db.select({ count: sql`count(*)` }).from(schema.webinars).where(eq(schema.webinars.status, 'live'));
  const factoryCountRes = await db.select({ count: sql`count(*)` }).from(schema.factories);
  const orderCountRes = await db.select({ count: sql`count(*)` }).from(schema.orders).where(eq(schema.orders.status, 'delivered'));
  const negotiationCountRes = await db.select({ count: sql`count(*)` }).from(schema.webinars).where(eq(schema.webinars.status, 'scheduled'));
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
  return db.select().from(schema.subscriptionPlans).where(eq(schema.subscriptionPlans.isActive, 1)).orderBy(schema.subscriptionPlans.displayOrder);
}

export async function getSubscriptionPlanById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.subscriptionPlans).where(eq(schema.subscriptionPlans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.subscriptions).where(and(eq(schema.subscriptions.userId, userId), eq(schema.subscriptions.status, 'active'))).orderBy(desc(schema.subscriptions.createdAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(schema.subscriptions).values(data);
  return result[0].insertId;
}

export async function updateSubscription(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(schema.subscriptions).set(data).where(eq(schema.subscriptions.id, id));
}

export async function cancelSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(schema.subscriptions).set({ status: 'cancelled', updatedAt: new Date() }).where(eq(schema.subscriptions.userId, userId));
}

// ============ PAYMENT QUERIES ============

export async function createPaymentOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(schema.paymentOrders).values(data);
  return result[0].insertId;
}

export async function getPaymentOrderByNo(orderNo: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schema.paymentOrders).where(eq(schema.paymentOrders.orderNo, orderNo)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentOrder(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(schema.paymentOrders).set(data).where(eq(schema.paymentOrders.id, id));
}

export async function getUserPaymentOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.paymentOrders).where(eq(schema.paymentOrders.userId, userId)).orderBy(desc(schema.paymentOrders.createdAt));
}

// ============ USAGE RECORD QUERIES ============

export async function recordUsage(userId: number, resourceType: string, count: number = 1, metadata?: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  await db.insert(schema.usageRecords).values({ userId, resourceType, count, periodStart, periodEnd, metadata });
}

export async function getMonthlyUsage(userId: number, resourceType: string) {
  const db = await getDb();
  if (!db) return 0;
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const result = await db.select({ total: sql`sum(count)` }).from(schema.usageRecords).where(and(eq(schema.usageRecords.userId, userId), eq(schema.usageRecords.resourceType, resourceType), sql`periodStart >= ${periodStart}`));
  return Number(result[0]?.total ?? 0);
}

// ============ RTM MESSAGE OPERATIONS ============

export async function saveRtmMessage(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(schema.rtmMessages).values(data);
  return result[0].insertId;
}

export async function getPrivateMessages(userId1: number, userId2: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.rtmMessages)
    .where(and(
      eq(schema.rtmMessages.messageType, 'private'),
      or(
        and(eq(schema.rtmMessages.senderId, userId1), eq(schema.rtmMessages.receiverId, userId2)),
        and(eq(schema.rtmMessages.senderId, userId2), eq(schema.rtmMessages.receiverId, userId1))
      )
    ))
    .orderBy(desc(schema.rtmMessages.createdAt))
    .limit(limit);
}

export async function getChannelMessages(channelName: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.rtmMessages)
    .where(and(
      eq(schema.rtmMessages.messageType, 'channel'),
      eq(schema.rtmMessages.channelName, channelName)
    ))
    .orderBy(desc(schema.rtmMessages.createdAt))
    .limit(limit);
}

export async function markMessagesAsRead(userId: number, senderId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(schema.rtmMessages).set({ isRead: 1, readAt: new Date() })
    .where(and(
      eq(schema.rtmMessages.receiverId, userId),
      eq(schema.rtmMessages.senderId, senderId),
      eq(schema.rtmMessages.isRead, 0)
    ));
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(schema.rtmMessages)
    .where(and(eq(schema.rtmMessages.receiverId, userId), eq(schema.rtmMessages.isRead, 0)));
  return result[0]?.count || 0;
}

export async function upsertConversation(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(schema.rtmConversations).values(data)
    .onDuplicateKeyUpdate({ set: data });
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schema.rtmConversations)
    .where(eq(schema.rtmConversations.userId, userId))
    .orderBy(desc(schema.rtmConversations.updatedAt));
}

export async function clearConversationUnread(userId: number, targetUserId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(schema.rtmConversations).set({ unreadCount: 0 })
    .where(and(
      eq(schema.rtmConversations.userId, userId),
      eq(schema.rtmConversations.targetUserId, targetUserId)
    ));
}

export async function toggleConversationPin(userId: number, targetUserId: number) {
  const db = await getDb();
  if (!db) return;
  await db.execute(sql`UPDATE rtm_conversations SET isPinned = NOT isPinned WHERE userId = ${userId} AND targetUserId = ${targetUserId}`);
}

export async function toggleConversationMute(userId: number, targetUserId: number) {
  const db = await getDb();
  if (!db) return;
  await db.execute(sql`UPDATE rtm_conversations SET isMuted = NOT isMuted WHERE userId = ${userId} AND targetUserId = ${targetUserId}`);
}

// ============ SAAS / QUOTA OPERATIONS ============

export async function getDefaultQuotaLimits() {
  return {
    webinar_created: 3,
    factory_invited: 10,
    report_generated: 5,
    storage_mb: 100,
  };
}

export async function createSubscriptionPlan(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(schema.subscriptionPlans).values(data);
}
