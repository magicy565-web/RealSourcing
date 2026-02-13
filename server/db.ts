import { eq, desc, sql, and, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  webinars, InsertWebinar, Webinar,
  factories, InsertFactory, Factory,
  webinarFactories,
  reports, InsertReport,
  negotiationEvents,
  orders,
  webinarResources,
  subscriptionPlans, InsertSubscriptionPlan, SubscriptionPlan,
  subscriptions, InsertSubscription, Subscription,
  paymentOrders, InsertPaymentOrder, PaymentOrder,
  usageRecords, InsertUsageRecord, UsageRecord,
  rtmMessages, InsertRtmMessage, RtmMessage,
  rtmConversations, InsertRtmConversation, RtmConversation,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ WEBINAR QUERIES ============

export async function createWebinar(data: InsertWebinar) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(webinars).values(data);
  return result[0].insertId;
}

export async function getWebinars(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status && status !== "all") {
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
  if (!db) throw new Error("Database not available");
  await db.update(webinars).set(data).where(eq(webinars.id, id));
}

export async function deleteWebinar(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(webinars).where(eq(webinars.id, id));
}

// ============ FACTORY QUERIES ============

export async function createFactory(data: InsertFactory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(factories).values(data);
  return result[0].insertId;
}

export async function getFactories(search?: string) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    return db.select().from(factories)
      .where(like(factories.name, `%${search}%`))
      .orderBy(desc(factories.overallScore));
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
  if (!db) throw new Error("Database not available");
  await db.update(factories).set(data).where(eq(factories.id, id));
}

// ============ WEBINAR-FACTORY RELATIONSHIP ============

export async function addFactoryToWebinar(webinarId: number, factoryId: number, role: "presenter" | "participant" = "participant") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(webinarFactories).values({ webinarId, factoryId, role });
}

export async function getWebinarFactories(webinarId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: webinarFactories.id,
    factoryId: webinarFactories.factoryId,
    role: webinarFactories.role,
    status: webinarFactories.status,
    joinedAt: webinarFactories.joinedAt,
    factoryName: factories.name,
    factoryLocation: factories.location,
    factoryScore: factories.overallScore,
  })
    .from(webinarFactories)
    .innerJoin(factories, eq(webinarFactories.factoryId, factories.id))
    .where(eq(webinarFactories.webinarId, webinarId));
}

// ============ REPORT QUERIES ============

export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
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

export async function addNegotiationEvent(data: {
  webinarId: number;
  type: "system" | "factory" | "presentation" | "pricing" | "ai_insight" | "negotiation" | "ai_alert" | "agreement";
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(negotiationEvents).values(data);
  return result[0].insertId;
}

export async function getWebinarTimeline(webinarId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(negotiationEvents)
    .where(eq(negotiationEvents.webinarId, webinarId))
    .orderBy(negotiationEvents.createdAt);
}

// ============ ORDER QUERIES ============

export async function getFactoryOrders(factoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.factoryId, factoryId))
    .orderBy(desc(orders.createdAt));
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { activeWebinars: 0, totalFactories: 0, closedOrders: 0, activeNegotiations: 0 };

  const [webinarCount] = await db.select({ count: sql<number>`count(*)` }).from(webinars)
    .where(eq(webinars.status, "live"));
  const [factoryCount] = await db.select({ count: sql<number>`count(*)` }).from(factories);
  const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders)
    .where(eq(orders.status, "delivered"));
  const [negotiationCount] = await db.select({ count: sql<number>`count(*)` }).from(webinars)
    .where(eq(webinars.status, "scheduled"));

  return {
    activeWebinars: webinarCount?.count ?? 0,
    totalFactories: factoryCount?.count ?? 0,
    closedOrders: orderCount?.count ?? 0,
    activeNegotiations: negotiationCount?.count ?? 0,
  };
}

// ============ SUBSCRIPTION PLAN QUERIES ============

export async function getSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, 1))
    .orderBy(subscriptionPlans.displayOrder);
}

export async function getSubscriptionPlanById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscriptionPlan(data: InsertSubscriptionPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subscriptionPlans).values(data);
  return data.id;
}

// ============ SUBSCRIPTION QUERIES ============

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, "active")
    ))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(data);
  return result[0].insertId;
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function cancelSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, "active")
    ));
}

// ============ PAYMENT ORDER QUERIES ============

export async function createPaymentOrder(data: InsertPaymentOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(paymentOrders).values(data);
  return result[0].insertId;
}

export async function getPaymentOrderByNo(orderNo: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(paymentOrders)
    .where(eq(paymentOrders.orderNo, orderNo))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentOrder(orderNo: string, data: Partial<InsertPaymentOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(paymentOrders).set(data).where(eq(paymentOrders.orderNo, orderNo));
}

export async function getUserPaymentOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentOrders)
    .where(eq(paymentOrders.userId, userId))
    .orderBy(desc(paymentOrders.createdAt));
}

// ============ USAGE RECORD QUERIES ============

export async function recordUsage(data: InsertUsageRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(usageRecords).values(data);
  return result[0].insertId;
}

export async function getUserUsage(userId: number, resourceType: string, periodStart: Date, periodEnd: Date) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: sql<number>`SUM(count)` })
    .from(usageRecords)
    .where(and(
      eq(usageRecords.userId, userId),
      eq(usageRecords.resourceType, resourceType),
      sql`${usageRecords.periodStart} >= ${periodStart}`,
      sql`${usageRecords.periodEnd} <= ${periodEnd}`
    ));
  return result[0]?.total ?? 0;
}

export async function getMonthlyUsage(userId: number, resourceType: string) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return getUserUsage(userId, resourceType, periodStart, periodEnd);
}

// ============ RTM MESSAGE QUERIES ============

/**
 * 保存 RTM 消息到数据库
 */
export async function saveRtmMessage(data: InsertRtmMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(rtmMessages).values(data);
  return result[0].insertId;
}

/**
 * 获取两个用户之间的私聊消息历史
 */
export async function getPrivateMessages(userId1: number, userId2: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(rtmMessages)
    .where(
      and(
        eq(rtmMessages.messageType, "private"),
        sql`(
          (${rtmMessages.senderId} = ${userId1} AND ${rtmMessages.receiverId} = ${userId2}) OR
          (${rtmMessages.senderId} = ${userId2} AND ${rtmMessages.receiverId} = ${userId1})
        )`
      )
    )
    .orderBy(desc(rtmMessages.createdAt))
    .limit(limit);
}

/**
 * 获取频道消息历史
 */
export async function getChannelMessages(channelName: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(rtmMessages)
    .where(
      and(
        eq(rtmMessages.messageType, "channel"),
        eq(rtmMessages.channelName, channelName)
      )
    )
    .orderBy(desc(rtmMessages.createdAt))
    .limit(limit);
}

/**
 * 标记消息为已读
 */
export async function markMessagesAsRead(userId: number, senderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(rtmMessages)
    .set({ isRead: 1, readAt: new Date() })
    .where(
      and(
        eq(rtmMessages.receiverId, userId),
        eq(rtmMessages.senderId, senderId),
        eq(rtmMessages.isRead, 0)
      )
    );
}

/**
 * 获取未读消息数量
 */
export async function getUnreadMessageCount(userId: number, senderId?: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const conditions = [
    eq(rtmMessages.receiverId, userId),
    eq(rtmMessages.isRead, 0)
  ];
  
  if (senderId) {
    conditions.push(eq(rtmMessages.senderId, senderId));
  }
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(rtmMessages)
    .where(and(...conditions));
  
  return result[0]?.count ?? 0;
}

// ============ RTM CONVERSATION QUERIES ============

/**
 * 创建或更新会话
 */
export async function upsertConversation(data: InsertRtmConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(rtmConversations)
    .where(
      and(
        eq(rtmConversations.userId, data.userId),
        data.targetUserId 
          ? eq(rtmConversations.targetUserId, data.targetUserId)
          : eq(rtmConversations.channelName, data.channelName!)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    // 更新现有会话
    await db.update(rtmConversations)
      .set({
        lastMessageId: data.lastMessageId,
        lastMessageContent: data.lastMessageContent,
        lastMessageAt: data.lastMessageAt,
        unreadCount: sql`${rtmConversations.unreadCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(rtmConversations.id, existing[0].id));
    
    return existing[0].id;
  } else {
    // 创建新会话
    const result = await db.insert(rtmConversations).values(data);
    return result[0].insertId;
  }
}

/**
 * 获取用户的所有会话列表
 */
export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(rtmConversations)
    .where(eq(rtmConversations.userId, userId))
    .orderBy(
      desc(rtmConversations.isPinned),
      desc(rtmConversations.lastMessageAt)
    );
}

/**
 * 清空会话的未读计数
 */
export async function clearConversationUnread(userId: number, targetUserId?: number, channelName?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [eq(rtmConversations.userId, userId)];
  
  if (targetUserId) {
    conditions.push(eq(rtmConversations.targetUserId, targetUserId));
  } else if (channelName) {
    conditions.push(eq(rtmConversations.channelName, channelName));
  }
  
  await db.update(rtmConversations)
    .set({ unreadCount: 0 })
    .where(and(...conditions));
}

/**
 * 切换会话置顶状态
 */
export async function toggleConversationPin(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(rtmConversations)
    .set({ isPinned: sql`1 - ${rtmConversations.isPinned}` })
    .where(eq(rtmConversations.id, conversationId));
}

/**
 * 切换会话免打扰状态
 */
export async function toggleConversationMute(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(rtmConversations)
    .set({ isMuted: sql`1 - ${rtmConversations.isMuted}` })
    .where(eq(rtmConversations.id, conversationId));
}
