/**
 * Permissions Middleware
 * 
 * This module provides middleware for role-based access control
 * and subscription-based feature access.
 */

import { TRPCError } from "@trpc/server";
import { getUserSubscription, getSubscriptionPlanById } from "../db";

export type UserRole = "user" | "admin" | "buyer" | "factory";

/**
 * Require specific user role
 * 
 * Usage in tRPC:
 * ```
 * .use(requireRole("factory"))
 * ```
 */
export function requireRole(role: UserRole | UserRole[]) {
  return async ({ ctx, next }: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action.",
      });
    }

    const allowedRoles = Array.isArray(role) ? role : [role];

    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This action requires one of the following roles: ${allowedRoles.join(", ")}`,
      });
    }

    return next();
  };
}

/**
 * Require active subscription
 * 
 * Usage in tRPC:
 * ```
 * .use(requireSubscription())
 * ```
 */
export function requireSubscription(minPlanId?: string) {
  return async ({ ctx, next }: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action.",
      });
    }

    // Buyers don't need subscription
    if (ctx.user.role === "buyer") {
      return next();
    }

    // Get user's subscription
    const subscription = await getUserSubscription(ctx.user.id);
    if (!subscription) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Active subscription required. Please subscribe to a plan to continue.",
      });
    }

    // Check if subscription is expired
    const now = new Date();
    if (subscription.currentPeriodEnd < now) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your subscription has expired. Please renew to continue.",
      });
    }

    // Check if subscription is active
    if (subscription.status !== "active") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Your subscription is not active. Please contact support.",
      });
    }

    // Check minimum plan requirement if specified
    if (minPlanId) {
      const planHierarchy = ["free_trial", "basic", "professional", "enterprise"];
      const userPlanIndex = planHierarchy.indexOf(subscription.planId);
      const minPlanIndex = planHierarchy.indexOf(minPlanId);

      if (userPlanIndex < minPlanIndex) {
        const plan = await getSubscriptionPlanById(minPlanId);
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `This feature requires ${plan?.name || minPlanId} plan or higher. Please upgrade your subscription.`,
        });
      }
    }

    return next({
      ctx: {
        ...ctx,
        subscription,
      },
    });
  };
}

/**
 * Require specific feature access
 * 
 * Usage in tRPC:
 * ```
 * .use(requireFeature("ai_insights"))
 * ```
 */
export function requireFeature(featureName: string) {
  return async ({ ctx, next }: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action.",
      });
    }

    // Admins have access to all features
    if (ctx.user.role === "admin") {
      return next();
    }

    // Buyers have access to all features
    if (ctx.user.role === "buyer") {
      return next();
    }

    // Get user's subscription
    const subscription = await getUserSubscription(ctx.user.id);
    if (!subscription) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Active subscription required to access this feature.",
      });
    }

    // Get plan features
    const plan = await getSubscriptionPlanById(subscription.planId);
    if (!plan || !plan.features) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invalid subscription plan.",
      });
    }

    // Check if feature is included in plan
    const hasFeature = plan.features.some((f) =>
      f.toLowerCase().includes(featureName.toLowerCase())
    );

    if (!hasFeature) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This feature is not included in your current plan. Please upgrade to access ${featureName}.`,
      });
    }

    return next();
  };
}

/**
 * Check if user is owner of a resource
 * 
 * Usage in tRPC:
 * ```
 * .use(requireOwnership((ctx, input) => input.userId === ctx.user.id))
 * ```
 */
export function requireOwnership(checkFn: (ctx: any, input: any) => boolean | Promise<boolean>) {
  return async ({ ctx, input, next }: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action.",
      });
    }

    // Admins can access all resources
    if (ctx.user.role === "admin") {
      return next();
    }

    const isOwner = await checkFn(ctx, input);

    if (!isOwner) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource.",
      });
    }

    return next();
  };
}

/**
 * Feature flags based on subscription plan
 */
export const PLAN_FEATURES = {
  free_trial: [
    "basic_factory_page",
    "limited_products",
    "limited_inquiries",
    "participate_webinars",
  ],
  basic: [
    "basic_factory_page",
    "products_30",
    "inquiries_20",
    "participate_webinars",
    "create_webinars_2",
    "basic_analytics",
    "email_support",
  ],
  professional: [
    "basic_factory_page",
    "products_100",
    "unlimited_inquiries",
    "participate_webinars",
    "create_webinars_10",
    "premium_placement",
    "ai_recommendations",
    "verified_badge",
    "advanced_analytics",
    "video_recording",
    "online_support",
  ],
  enterprise: [
    "basic_factory_page",
    "unlimited_products",
    "unlimited_inquiries",
    "participate_webinars",
    "unlimited_webinars",
    "top_placement",
    "ai_recommendations_priority",
    "multi_factory_management",
    "dedicated_manager",
    "custom_marketing",
    "white_label",
    "api_access",
    "priority_support",
    "training",
  ],
};

/**
 * Check if user's plan includes a specific feature
 */
export async function hasFeature(userId: number, featureName: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return false;
  }

  const planFeatures = PLAN_FEATURES[subscription.planId as keyof typeof PLAN_FEATURES];
  return planFeatures?.includes(featureName) || false;
}
