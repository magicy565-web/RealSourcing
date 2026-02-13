/**
 * Quota Management Middleware
 * 
 * This module provides middleware for checking and enforcing usage quotas
 * based on user subscription plans.
 */

import { TRPCError } from "@trpc/server";
import {
  getUserSubscription,
  getSubscriptionPlanById,
  getMonthlyUsage,
  recordUsage,
} from "../db";

export type ResourceType = "webinar_created" | "product_uploaded" | "inquiry_received";

/**
 * Check if user has quota for a specific resource type
 * 
 * @param userId User ID
 * @param resourceType Resource type to check
 * @returns Object with canProceed flag and usage/limit info
 */
export async function checkQuota(
  userId: number,
  userRole: string,
  resourceType: ResourceType
): Promise<{
  canProceed: boolean;
  usage: number;
  limit: number;
  reason?: string;
}> {
  // Buyers have unlimited access
  if (userRole === "buyer") {
    return {
      canProceed: true,
      usage: 0,
      limit: Infinity,
    };
  }

  // Get user's subscription
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return {
      canProceed: false,
      usage: 0,
      limit: 0,
      reason: "No active subscription. Please subscribe to a plan to continue.",
    };
  }

  // Check if subscription is expired
  const now = new Date();
  if (subscription.currentPeriodEnd < now) {
    return {
      canProceed: false,
      usage: 0,
      limit: 0,
      reason: "Subscription expired. Please renew your subscription to continue.",
    };
  }

  // Get plan limits
  const plan = await getSubscriptionPlanById(subscription.planId);
  if (!plan || !plan.limits) {
    return {
      canProceed: false,
      usage: 0,
      limit: 0,
      reason: "Invalid subscription plan.",
    };
  }

  // Get current usage
  const usage = await getMonthlyUsage(userId, resourceType);

  // Determine limit based on resource type
  let limit = 0;
  if (resourceType === "webinar_created") {
    limit = plan.limits.webinarCreatedMonthly;
  } else if (resourceType === "product_uploaded") {
    limit = plan.limits.productsMax;
  } else if (resourceType === "inquiry_received") {
    limit = plan.limits.inquiriesMonthly;
  }

  // Check if quota is exceeded
  const canProceed = limit === -1 || usage < limit; // -1 means unlimited

  if (!canProceed) {
    return {
      canProceed: false,
      usage,
      limit: limit === -1 ? Infinity : limit,
      reason: `Monthly quota exceeded. You have used ${usage} out of ${limit === -1 ? "unlimited" : limit} ${resourceType.replace("_", " ")}.`,
    };
  }

  return {
    canProceed: true,
    usage,
    limit: limit === -1 ? Infinity : limit,
  };
}

/**
 * Record usage for a specific resource type
 * 
 * @param userId User ID
 * @param resourceType Resource type
 * @param count Count to record (default: 1)
 * @param metadata Optional metadata
 */
export async function recordResourceUsage(
  userId: number,
  resourceType: ResourceType,
  count: number = 1,
  metadata?: Record<string, unknown>
): Promise<void> {
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
 * Middleware to check quota before proceeding
 * 
 * Usage in tRPC:
 * ```
 * .use(requireQuota("webinar_created"))
 * ```
 */
export function requireQuota(resourceType: ResourceType) {
  return async ({ ctx, next }: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action.",
      });
    }

    const quotaCheck = await checkQuota(ctx.user.id, ctx.user.role, resourceType);

    if (!quotaCheck.canProceed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: quotaCheck.reason || "Quota exceeded.",
      });
    }

    return next({
      ctx: {
        ...ctx,
        quotaInfo: {
          usage: quotaCheck.usage,
          limit: quotaCheck.limit,
        },
      },
    });
  };
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(userId: number): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return false;
  }

  const now = new Date();
  return subscription.status === "active" && subscription.currentPeriodEnd > now;
}

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(userId: number): Promise<{
  hasSubscription: boolean;
  isActive: boolean;
  planId?: string;
  planName?: string;
  currentPeriodEnd?: Date;
  daysRemaining?: number;
}> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      hasSubscription: false,
      isActive: false,
    };
  }

  const now = new Date();
  const isActive = subscription.status === "active" && subscription.currentPeriodEnd > now;
  const daysRemaining = Math.ceil(
    (subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const plan = await getSubscriptionPlanById(subscription.planId);

  return {
    hasSubscription: true,
    isActive,
    planId: subscription.planId,
    planName: plan?.name,
    currentPeriodEnd: subscription.currentPeriodEnd,
    daysRemaining: isActive ? daysRemaining : 0,
  };
}
