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
