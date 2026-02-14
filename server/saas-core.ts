import { getSubscriptionPlanById, getUserSubscription, createSubscription, getDefaultQuotaLimits } from "./db";
import { type QuotaLimits } from "./types";

/**
 * 初始化用户的 SaaS 订阅
 * 如果用户没有订阅，创建一个免费试用订阅
 */
export async function initUserSaaS(userId: number) {
  const existing = await getUserSubscription(userId);
  if (existing) {
    return existing;
  }

  // 获取免费试用计划
  const freeTrialPlan = await getSubscriptionPlanById("free_trial");
  if (!freeTrialPlan) {
    console.error("[SaaS] Free trial plan not found");
    return null;
  }
  
  // 创建试用订阅
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
  };
}

/**
 * 获取用户的配额限制
 */
export async function getUserQuotaLimits(userId: number): Promise<QuotaLimits> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    // 没有订阅，返回免费试用限制
    const freeTrialPlan = await getSubscriptionPlanById("free_trial");
    const limits = freeTrialPlan?.limits as unknown as QuotaLimits;
    return limits || getDefaultQuotaLimits();
  }
  
  const plan = await getSubscriptionPlanById(subscription.planId);
  const limits = plan?.limits as unknown as QuotaLimits;
  return limits || getDefaultQuotaLimits();
}
