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
} from "../db.js";

export type ResourceType = "webinar_created" | "product_uploaded" | "inquiry_received";

/**
 * Check if user has quota for a specific resource type
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
  if (userRole === "buyer") {
    return { canProceed: true, usage: 0, limit: Infinity };
  }

  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return {
      canProceed: false,
      usage: 0,
      limit: 0,
      reason: "No active subscription.",
    };
  }

  const now = new Date();
  if (subscription.currentPeriodEnd < now) {
    return {
      canProceed: false,
      usage: 0,
      limit: 0,
      reason: "Subscription expired.",
    };
  }

  const plan = await getSubscriptionPlanById(subscription.planId);
  if (!plan || !plan.limits) {
    return { canProceed: false, usage: 0, limit: 0, reason: "Invalid plan." };
  }

  const usage = await getMonthlyUsage(userId, resourceType);

  let limit = 0;
  const limits = plan.limits as any;
  if (resourceType === "webinar_created") {
    limit = Number(limits.webinarCreatedMonthly || 0);
  } else if (resourceType === "product_uploaded") {
    limit = Number(limits.productsMax || 0);
  } else if (resourceType === "inquiry_received") {
    limit = Number(limits.inquiriesMonthly || 0);
  }

  const canProceed = limit === -1 || Number(usage) < limit;

  return {
    canProceed,
    usage: Number(usage),
    limit: limit === -1 ? Infinity : limit,
    reason: canProceed ? undefined : "Quota exceeded.",
  };
}

/**
 * Record usage for a specific resource type
 */
export async function recordResourceUsage(
  userId: number,
  resourceType: ResourceType,
  count: number = 1,
  metadata?: Record<string, unknown>
): Promise<void> {
  // Use the parameters expected by db.recordUsage: (userId, resourceType, count, metadata)
  await recordUsage(userId, resourceType, count, metadata);
}

/**
 * Middleware to check quota before proceeding
 */
export function requireQuota(resourceType: ResourceType) {
  return async ({ ctx, next }: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in.",
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
