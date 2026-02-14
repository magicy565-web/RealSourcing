import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  createPaymentOrder,
  getPaymentOrderByNo,
  updatePaymentOrder,
  getUserPaymentOrders,
  getSubscriptionPlanById,
  createSubscription,
  getUserSubscription,
} from "../db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { createAlipayOrder, verifyAlipayNotify } from "../lib/alipay";
import { createWechatPayOrder, verifyWechatPayNotify } from "../lib/wechatpay";

export const paymentRouter = router({
  // Create a payment order
  createOrder: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        billingCycle: z.enum(["monthly", "yearly"]),
        paymentMethod: z.enum(["alipay", "wechatpay", "stripe"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get plan details
      const plan = await getSubscriptionPlanById(input.planId);
      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription plan not found",
        });
      }

      // Calculate amount
      const amount =
        input.billingCycle === "monthly"
          ? parseFloat(plan.priceMonthly)
          : parseFloat(plan.priceYearly);

      // Generate order number
      const orderNo = `RS${Date.now()}${nanoid(8)}`;

      // Create payment order
      const orderId = await createPaymentOrder({
        orderNo,
        userId: ctx.user.id,
        planId: input.planId,
        amount: amount.toString(),
        billingCycle: input.billingCycle,
        status: "pending",
        paymentMethod: input.paymentMethod,
      });

      // Generate payment URL/QR code based on payment method
      let paymentUrl = "";
      let qrCodeUrl = "";

      try {
        if (input.paymentMethod === "alipay") {
          // Generate Alipay payment URL
          paymentUrl = await createAlipayOrder({
            outTradeNo: orderNo,
            subject: `RealSourcing ${input.planId} - ${input.billingCycle}`,
            totalAmount: amount.toFixed(2),
            body: `RealSourcing 订阅服务`,
            returnUrl: `${process.env.APP_URL || "http://localhost:3000"}/payment/success?orderNo=${orderNo}`,
            notifyUrl: `${process.env.APP_URL || "http://localhost:3000"}/api/webhooks/alipay`,
          });
        } else if (input.paymentMethod === "wechatpay") {
          // Generate WeChat Pay QR code URL
          qrCodeUrl = await createWechatPayOrder({
            outTradeNo: orderNo,
            description: `RealSourcing ${input.planId} - ${input.billingCycle}`,
            totalAmount: Math.round(amount * 100), // Convert to cents
            notifyUrl: `${process.env.APP_URL || "http://localhost:3000"}/api/webhooks/wechatpay`,
          });
        }
      } catch (error) {
        console.error("Failed to generate payment URL:", error);
        // Continue without payment URL for now
      }

      return {
        orderId,
        orderNo,
        amount,
        planId: input.planId,
        billingCycle: input.billingCycle,
        paymentUrl,
        qrCodeUrl,
      };
    }),

  // Get payment order by order number
  getOrder: protectedProcedure
    .input(z.object({ orderNo: z.string() }))
    .query(async ({ input }) => {
      const order = await getPaymentOrderByNo(input.orderNo);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment order not found",
        });
      }
      return order;
    }),

  // Get user's payment history
  history: protectedProcedure.query(async ({ ctx }) => {
    return getUserPaymentOrders(ctx.user.id);
  }),

  // Webhook handler for payment callbacks (Alipay/WeChat Pay)
  // This should be called by payment provider's webhook
  webhook: publicProcedure
    .input(
      z.object({
        orderNo: z.string(),
        paymentId: z.string(),
        status: z.enum(["paid", "failed"]),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get payment order
      const order = await getPaymentOrderByNo(input.orderNo);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment order not found",
        });
      }

      // Update payment order status
      await updatePaymentOrder(input.orderNo, {
        status: input.status,
        paymentId: input.paymentId,
        paidAt: input.status === "paid" ? new Date() : undefined,
        metadata: input.metadata,
      });

      // If payment successful, activate subscription
      if (input.status === "paid") {
        const now = new Date();
        const periodEnd = new Date(now);

        // Calculate period end based on billing cycle
        if (order.billingCycle === "monthly") {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }

        // Check if user already has an active subscription
        const existingSubscription = await getUserSubscription(order.userId);

        if (existingSubscription) {
          // TODO: Handle subscription upgrade/renewal
          // For now, just create a new subscription
        }

        // Create new subscription
        await createSubscription({
          userId: order.userId,
          planId: order.planId,
          status: "active",
          billingCycle: order.billingCycle || "monthly", // Fixed null to undefined/default
          amount: order.amount, // Added missing amount
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          autoRenew: 1,
        });
      }

      return { success: true };
    }),

  // Simulate payment success (for testing only)
  simulatePayment: protectedProcedure
    .input(z.object({ orderNo: z.string() }))
    .mutation(async ({ input }) => {
      // This is for testing only - should be removed in production
      const order = await getPaymentOrderByNo(input.orderNo);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment order not found",
        });
      }

      // Update order status
      await updatePaymentOrder(input.orderNo, {
        status: "paid",
        paymentId: `TEST_${nanoid(16)}`,
        paidAt: new Date(),
      });

      // Activate subscription
      const now = new Date();
      const periodEnd = new Date(now);

      if (order.billingCycle === "monthly") {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      await createSubscription({
        userId: order.userId,
        planId: order.planId,
        status: "active",
        billingCycle: order.billingCycle || "monthly", // Fixed null to undefined/default
        amount: order.amount, // Added missing amount
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        autoRenew: 1,
      });

      return { success: true };
    }),
});
