import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getSubscriptionPlans,
  getSubscriptionPlanById,
  getUserSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getMonthlyUsage,
} from "../db";
import { TRPCError } from "@trpc/server";

export const subscriptionRouter = router({
  // Get all subscription plans
  plans: publicProcedure.query(async () => {
    return getSubscriptionPlans();
  }),

  // Get a specific plan by ID
  getPlan: publicProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ input }) => {
      const plan = await getSubscriptionPlanById(input.planId);
      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription plan not found",
        });
      }
      return plan;
    }),

  // Get current user's subscription
  current: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getUserSubscription(ctx.user.id);
    if (!subscription) {
      return null;
    }

    // Get plan details
    const plan = await getSubscriptionPlanById(subscription.planId);

    // Get usage statistics
    const webinarUsage = await getMonthlyUsage(ctx.user.id, "webinar_created");
    const productUsage = await getMonthlyUsage(ctx.user.id, "product_uploaded");
    const inquiryUsage = await getMonthlyUsage(ctx.user.id, "inquiry_received");

    return {
      subscription,
      plan,
      usage: {
        webinarCreated: webinarUsage,
        productUploaded: productUsage,
        inquiryReceived: inquiryUsage,
      },
    };
  }),

  // Create a new subscription (for free trial)
  createFreeTrial: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if user already has a subscription
    const existing = await getUserSubscription(ctx.user.id);
    if (existing) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User already has an active subscription",
      });
    }

    // Create 14-day free trial
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 14);

    const subscriptionId = await createSubscription({
      userId: ctx.user.id,
      planId: "free_trial",
      status: "active",
      billingCycle: "monthly",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      autoRenew: 0,
    });

    return { subscriptionId };
  }),

  // Upgrade/Downgrade subscription
  changePlan: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        billingCycle: z.enum(["monthly", "yearly"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await getUserSubscription(ctx.user.id);
      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active subscription found",
        });
      }

      // Update subscription plan
      await updateSubscription(subscription.id, {
        planId: input.planId,
        billingCycle: input.billingCycle,
      });

      return { success: true };
    }),

  // Cancel subscription
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    await cancelSubscription(ctx.user.id);
    return { success: true };
  }),

  // Check if user can perform an action (quota check)
  checkQuota: protectedProcedure
    .input(
      z.object({
        resourceType: z.enum([
          "webinar_created",
          "product_uploaded",
          "inquiry_received",
        ]),
      })
    )
    .query(async ({ ctx, input }) => {
      // Buyers have unlimited access
      if (ctx.user.role === "buyer") {
        return { canProceed: true, usage: 0, limit: Infinity };
      }

      // Get user's subscription
      const subscription = await getUserSubscription(ctx.user.id);
      if (!subscription) {
        return { canProceed: false, usage: 0, limit: 0, reason: "No active subscription" };
      }

      // Get plan limits
      const plan = await getSubscriptionPlanById(subscription.planId);
      if (!plan || !plan.limits) {
        return { canProceed: false, usage: 0, limit: 0, reason: "Invalid plan" };
      }

      // Get current usage
      const usage = await getMonthlyUsage(ctx.user.id, input.resourceType);

      // Determine limit based on resource type
      let limit = 0;
      if (input.resourceType === "webinar_created") {
        limit = plan.limits.webinarCreatedMonthly;
      } else if (input.resourceType === "product_uploaded") {
        limit = plan.limits.productsMax;
      } else if (input.resourceType === "inquiry_received") {
        limit = plan.limits.inquiriesMonthly;
      }

      const canProceed = limit === -1 || usage < limit; // -1 means unlimited

      return {
        canProceed,
        usage,
        limit: limit === -1 ? Infinity : limit,
      };
    }),
});
