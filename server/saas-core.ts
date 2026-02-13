/**
 * SaaS 核心逻辑
 * 订阅管理、配额检查、使用量追踪
 */

import { getDb } from "./db";
import {
  getUserSubscription,
  getSubscriptionPlanById,
  createSubscription,
  updateSubscription,
  recordUsage,
  getMonthlyUsage,
} from "./db";
import { eq, and, sql, lt } from "drizzle-orm";
import { subscriptions, subscriptionPlans } from "../drizzle/schema";

// ============================================================================
// 类型定义
// ============================================================================

export interface QuotaLimits {
  webinarCreatedMonthly: number;    // 每月创建会议数
  productsMax: number;               // 最大产品数
  inquiriesMonthly: number;          // 每月询价数
  storageGB: number;                 // 存储空间(GB)
  videoRecordingHours: number;       // 录制时长(小时/月)
  aiReportsMonthly: number;          // AI报告数/月
  webinarDurationMinutes?: number;   // 会议时长(分钟)
  priorityListing?: boolean;         // 优先展示
  verifiedBadge?: boolean;           // 认证徽章
  multiFactoryManagement?: boolean;  // 多工厂管理
  apiAccess?: boolean;               // API访问
  dedicatedSupport?: boolean;        // 专属支持
}

export interface QuotaUsage {
  webinarCreated: number;
  products: number;
  inquiries: number;
  storage: number;
  videoRecording: number;
  aiReports: number;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}

// ============================================================================
// 订阅管理
// ============================================================================

/**
 * 初始化用户订阅（免费试用）
 */
export async function initializeUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 检查是否已有订阅
  const existing = await getUserSubscription(userId);
  if (existing) {
    return existing;
  }
  
  // 获取免费试用套餐
  const freeTrialPlan = await getSubscriptionPlanById("free_trial");
  if (!freeTrialPlan) {
    throw new Error("Free trial plan not found");
  }
  
  // 创建试用订阅
  const now = new Date();
  const trialEnd = new Date(now.getTime() + freeTrialPlan.trialDays * 24 * 60 * 60 * 1000);
  
  const subscriptionId = await createSubscription({
    userId,
    planId: "free_trial",
    status: "trial",
    billingCycle: "monthly",
    amount: "0",
    currency: "CNY",
    currentPeriodStart: now,
    currentPeriodEnd: trialEnd,
    trialStart: now,
    trialEnd: trialEnd,
    autoRenew: 0,
  });
  
  return await getUserSubscription(userId);
}

/**
 * 升级订阅
 */
export async function upgradeSubscription(
  userId: number,
  newPlanId: string,
  billingCycle: "monthly" | "yearly"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 获取新套餐信息
  const newPlan = await getSubscriptionPlanById(newPlanId);
  if (!newPlan) {
    throw new Error("Plan not found");
  }
  
  // 获取当前订阅
  const currentSubscription = await getUserSubscription(userId);
  
  const now = new Date();
  const periodEnd = new Date(
    billingCycle === "monthly"
      ? now.getTime() + 30 * 24 * 60 * 60 * 1000
      : now.getTime() + 365 * 24 * 60 * 60 * 1000
  );
  
  const amount = billingCycle === "monthly" ? newPlan.priceMonthly : newPlan.priceYearly;
  
  if (currentSubscription) {
    // 更新现有订阅
    await updateSubscription(currentSubscription.id, {
      planId: newPlanId,
      status: "active",
      billingCycle,
      amount: amount.toString(),
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      renewalDate: periodEnd,
    });
  } else {
    // 创建新订阅
    await createSubscription({
      userId,
      planId: newPlanId,
      status: "active",
      billingCycle,
      amount: amount.toString(),
      currency: newPlan.currency,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      renewalDate: periodEnd,
      autoRenew: 1,
    });
  }
  
  return await getUserSubscription(userId);
}

/**
 * 降级订阅（在当前周期结束时生效）
 */
export async function downgradeSubscription(userId: number, newPlanId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const currentSubscription = await getUserSubscription(userId);
  if (!currentSubscription) {
    throw new Error("No active subscription found");
  }
  
  // 在 metadata 中记录降级计划
  await updateSubscription(currentSubscription.id, {
    metadata: {
      ...currentSubscription.metadata as any,
      pendingDowngrade: newPlanId,
      downgradeAt: currentSubscription.currentPeriodEnd,
    },
  });
  
  return currentSubscription;
}

/**
 * 取消订阅（在当前周期结束时生效）
 */
export async function cancelUserSubscription(userId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error("No active subscription found");
  }
  
  await updateSubscription(subscription.id, {
    autoRenew: 0,
    cancellationReason: reason,
    metadata: {
      ...subscription.metadata as any,
      willCancelAt: subscription.currentPeriodEnd,
    },
  });
  
  return subscription;
}

/**
 * 检查并更新过期订阅
 */
export async function checkExpiredSubscriptions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  
  // 查找所有过期的订阅
  const expiredSubscriptions = await db.select().from(subscriptions)
    .where(and(
      eq(subscriptions.status, "active"),
      lt(subscriptions.currentPeriodEnd, now)
    ));
  
  for (const subscription of expiredSubscriptions) {
    if (subscription.autoRenew) {
      // 自动续费
      const plan = await getSubscriptionPlanById(subscription.planId);
      if (plan) {
        const periodEnd = new Date(
          subscription.billingCycle === "monthly"
            ? now.getTime() + 30 * 24 * 60 * 60 * 1000
            : now.getTime() + 365 * 24 * 60 * 60 * 1000
        );
        
        await updateSubscription(subscription.id, {
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          renewalDate: periodEnd,
        });
      }
    } else {
      // 标记为过期
      await updateSubscription(subscription.id, {
        status: "expired",
      });
      
      // 降级到免费试用
      await initializeUserSubscription(subscription.userId);
    }
  }
}

// ============================================================================
// 配额管理
// ============================================================================

/**
 * 获取用户的配额限制
 */
export async function getUserQuotaLimits(userId: number): Promise<QuotaLimits> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    // 没有订阅，返回免费试用限制
    const freeTrialPlan = await getSubscriptionPlanById("free_trial");
    return (freeTrialPlan?.limits as QuotaLimits) || getDefaultQuotaLimits();
  }
  
  const plan = await getSubscriptionPlanById(subscription.planId);
  return (plan?.limits as QuotaLimits) || getDefaultQuotaLimits();
}

/**
 * 获取用户的配额使用情况
 */
export async function getUserQuotaUsage(userId: number): Promise<QuotaUsage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return {
    webinarCreated: await getMonthlyUsage(userId, "webinar_created"),
    products: await getMonthlyUsage(userId, "product_uploaded"),
    inquiries: await getMonthlyUsage(userId, "inquiry_received"),
    storage: await getMonthlyUsage(userId, "storage_used"),
    videoRecording: await getMonthlyUsage(userId, "video_recording"),
    aiReports: await getMonthlyUsage(userId, "ai_report_generated"),
  };
}

/**
 * 检查配额是否允许
 */
export async function checkQuota(
  userId: number,
  resourceType: "webinar" | "product" | "inquiry" | "storage" | "video" | "ai_report"
): Promise<QuotaCheckResult> {
  const limits = await getUserQuotaLimits(userId);
  const usage = await getUserQuotaUsage(userId);
  
  switch (resourceType) {
    case "webinar":
      if (limits.webinarCreatedMonthly === -1) {
        return { allowed: true };
      }
      if (usage.webinarCreated >= limits.webinarCreatedMonthly) {
        return {
          allowed: false,
          reason: "已达到本月会议创建数量上限",
          current: usage.webinarCreated,
          limit: limits.webinarCreatedMonthly,
        };
      }
      break;
      
    case "product":
      if (limits.productsMax === -1) {
        return { allowed: true };
      }
      if (usage.products >= limits.productsMax) {
        return {
          allowed: false,
          reason: "已达到产品数量上限",
          current: usage.products,
          limit: limits.productsMax,
        };
      }
      break;
      
    case "inquiry":
      if (limits.inquiriesMonthly === -1) {
        return { allowed: true };
      }
      if (usage.inquiries >= limits.inquiriesMonthly) {
        return {
          allowed: false,
          reason: "已达到本月询价数量上限",
          current: usage.inquiries,
          limit: limits.inquiriesMonthly,
        };
      }
      break;
      
    case "storage":
      if (limits.storageGB === -1) {
        return { allowed: true };
      }
      if (usage.storage >= limits.storageGB) {
        return {
          allowed: false,
          reason: "存储空间已满",
          current: usage.storage,
          limit: limits.storageGB,
        };
      }
      break;
      
    case "video":
      if (limits.videoRecordingHours === -1) {
        return { allowed: true };
      }
      if (usage.videoRecording >= limits.videoRecordingHours) {
        return {
          allowed: false,
          reason: "已达到本月视频录制时长上限",
          current: usage.videoRecording,
          limit: limits.videoRecordingHours,
        };
      }
      break;
      
    case "ai_report":
      if (limits.aiReportsMonthly === -1) {
        return { allowed: true };
      }
      if (usage.aiReports >= limits.aiReportsMonthly) {
        return {
          allowed: false,
          reason: "已达到本月AI报告生成数量上限",
          current: usage.aiReports,
          limit: limits.aiReportsMonthly,
        };
      }
      break;
  }
  
  return { allowed: true };
}

/**
 * 记录资源使用
 */
export async function trackUsage(
  userId: number,
  resourceType: string,
  count: number = 1,
  metadata?: Record<string, unknown>
) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  await recordUsage({
    userId,
    resourceType,
    count,
    periodStart,
    periodEnd,
    metadata,
  });
}

/**
 * 获取默认配额限制（免费试用）
 */
function getDefaultQuotaLimits(): QuotaLimits {
  return {
    webinarCreatedMonthly: 0,
    productsMax: 5,
    inquiriesMonthly: 3,
    storageGB: 1,
    videoRecordingHours: 0,
    aiReportsMonthly: 0,
  };
}

// ============================================================================
// 配额中间件（用于 tRPC）
// ============================================================================

/**
 * 创建配额检查中间件
 */
export function createQuotaMiddleware(resourceType: "webinar" | "product" | "inquiry" | "storage" | "video" | "ai_report") {
  return async (userId: number) => {
    const result = await checkQuota(userId, resourceType);
    if (!result.allowed) {
      throw new Error(result.reason || "配额不足");
    }
  };
}

/**
 * 检查并追踪使用量
 */
export async function checkAndTrackUsage(
  userId: number,
  resourceType: "webinar" | "product" | "inquiry" | "storage" | "video" | "ai_report",
  count: number = 1,
  metadata?: Record<string, unknown>
) {
  // 检查配额
  const quotaCheck = await checkQuota(userId, resourceType);
  if (!quotaCheck.allowed) {
    throw new Error(quotaCheck.reason || "配额不足");
  }
  
  // 记录使用量
  const resourceTypeMap = {
    webinar: "webinar_created",
    product: "product_uploaded",
    inquiry: "inquiry_received",
    storage: "storage_used",
    video: "video_recording",
    ai_report: "ai_report_generated",
  };
  
  await trackUsage(userId, resourceTypeMap[resourceType], count, metadata);
}

// ============================================================================
// 订阅统计
// ============================================================================

/**
 * 获取订阅统计数据
 */
export async function getSubscriptionStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const stats = await db.select({
    planId: subscriptions.planId,
    count: sql<number>`count(*)`,
    revenue: sql<number>`sum(${subscriptions.amount})`,
  })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))
    .groupBy(subscriptions.planId);
  
  return stats;
}

/**
 * 获取用户订阅详情（包含计划信息）
 */
export async function getUserSubscriptionDetails(userId: number) {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return null;
  }
  
  const plan = await getSubscriptionPlanById(subscription.planId);
  const limits = await getUserQuotaLimits(userId);
  const usage = await getUserQuotaUsage(userId);
  
  return {
    subscription,
    plan,
    limits,
    usage,
    quotaPercentage: {
      webinar: limits.webinarCreatedMonthly === -1 ? 0 : (usage.webinarCreated / limits.webinarCreatedMonthly) * 100,
      product: limits.productsMax === -1 ? 0 : (usage.products / limits.productsMax) * 100,
      inquiry: limits.inquiriesMonthly === -1 ? 0 : (usage.inquiries / limits.inquiriesMonthly) * 100,
      storage: limits.storageGB === -1 ? 0 : (usage.storage / limits.storageGB) * 100,
      video: limits.videoRecordingHours === -1 ? 0 : (usage.videoRecording / limits.videoRecordingHours) * 100,
      aiReport: limits.aiReportsMonthly === -1 ? 0 : (usage.aiReports / limits.aiReportsMonthly) * 100,
    },
  };
}
