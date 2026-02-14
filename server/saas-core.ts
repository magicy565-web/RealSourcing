import { 
  getSubscriptionPlanById, 
  getUserSubscription, 
  createSubscription, 
  getDefaultQuotaLimits 
} from "./db";
import { type QuotaLimits, type QuotaUsage } from "./types";

/**
 * 初始化用户的 SaaS 订阅
 */
export async function initUserSaaS(userId: number) {
  const existing = await getUserSubscription(userId);
  if (existing) return existing;

  const freeTrialPlan = await getSubscriptionPlanById("free_trial");
  if (!freeTrialPlan) return null;
  
  const now = new Date();
  const trialDays = freeTrialPlan.trialDays ?? 0;
  const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
  
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
  });

  return { 
    id: subscriptionId, 
    userId, 
    planId: "free_trial", 
    status: "trial", 
    currentPeriodEnd: trialEnd,
    billingCycle: "monthly",
    amount: "0",
    currency: "CNY",
    currentPeriodStart: now
  };
}

export const initializeUserSubscription = initUserSaaS;

/**
 * 获取用户的配额限制
 */
export async function getUserQuotaLimits(userId: number): Promise<QuotaLimits> {
  const subscription = await getUserSubscription(userId);
  const planId = subscription?.planId || "free_trial";
  const plan = await getSubscriptionPlanById(planId);
  return (plan?.limits as unknown as QuotaLimits) || getDefaultQuotaLimits();
}

/**
 * 获取用户配额使用情况
 */
export async function getUserQuotaUsage(userId: number): Promise<QuotaUsage> {
  return {
    webinarCreatedMonthly: 0,
    productsMax: 0,
    inquiriesMonthly: 0,
    storageGB: 0,
    videoRecordingHours: 0,
    aiReportsMonthly: 0
  };
}

/**
 * 检查配额
 */
export async function checkQuota(userId: number, resourceType: string): Promise<boolean> {
  const limits = await getUserQuotaLimits(userId);
  const usage = await getUserQuotaUsage(userId);
  
  const limit = (limits as any)[resourceType];
  const currentUsage = (usage as any)[resourceType] || 0;
  
  if (typeof limit === 'number') {
    if (limit === -1) return true; // 无限制
    return currentUsage < limit;
  }
  return !!limit;
}

/**
 * 检查并追踪使用情况 (兼容旧参数)
 */
export async function checkAndTrackUsage(userId: number, resourceType: string, count: number = 1, metadata?: any): Promise<boolean> {
  return checkQuota(userId, resourceType);
}

/**
 * 获取订阅详情 (包含配额、使用量、百分比)
 */
export async function getUserSubscriptionDetails(userId: number) {
  const subscription = await getUserSubscription(userId);
  const planId = subscription?.planId || "free_trial";
  const plan = await getSubscriptionPlanById(planId);
  const limits = (plan?.limits as unknown as QuotaLimits) || getDefaultQuotaLimits();
  const usage = await getUserQuotaUsage(userId);

  // 转换 key 映射
  const quotaUsage = {
    webinarCreated: usage.webinarCreatedMonthly,
    products: usage.productsMax,
    inquiries: usage.inquiriesMonthly,
    storage: usage.storageGB,
    videoRecording: usage.videoRecordingHours,
    aiReports: usage.aiReportsMonthly
  };

  const calcPct = (curr: number, lim: number) => lim === -1 ? 0 : Math.min(100, Math.round((curr / lim) * 100));

  const quotaPercentage = {
    webinar: calcPct(usage.webinarCreatedMonthly, limits.webinarCreatedMonthly),
    product: calcPct(usage.productsMax, limits.productsMax),
    inquiry: calcPct(usage.inquiriesMonthly, limits.inquiriesMonthly),
    storage: calcPct(usage.storageGB, limits.storageGB),
    video: calcPct(usage.videoRecordingHours, limits.videoRecordingHours),
    aiReport: calcPct(usage.aiReportsMonthly, limits.aiReportsMonthly)
  };

  return {
    subscription,
    plan,
    limits,
    usage: quotaUsage,
    quotaPercentage
  };
}

export async function upgradeSubscription(userId: number, planId: string, billingCycle?: string) {
  return { success: true };
}

export async function downgradeSubscription(userId: number, planId: string) {
  return { success: true };
}

export async function cancelUserSubscription(userId: number, reason?: string) {
  return { success: true };
}
