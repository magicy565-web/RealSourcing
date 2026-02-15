/**
 * Payment Webhooks Handler
 * 
 * This module handles payment notifications from Alipay and WeChat Pay.
 */

import { Router } from "express";
import { verifyAlipayNotify } from "./lib/alipay.js";
import { verifyWechatPayNotify, decryptWechatPayResource } from "./lib/wechatpay.js";
import {
  getPaymentOrderByNo,
  updatePaymentOrder,
  createSubscription,
  getUserSubscription,
} from "./db.js";

const webhooksRouter = Router();

/**
 * Alipay payment notification webhook
 * 
 * POST /api/webhooks/alipay
 */
webhooksRouter.post("/alipay", async (req: any, res: any) => {
  try {
    const params = req.body;

    // Verify signature
    const isValid = verifyAlipayNotify(params);
    if (!isValid) {
      console.error("[Alipay Webhook] Invalid signature");
      return res.status(400).send("fail");
    }

    const { out_trade_no, trade_status, trade_no } = params;

    // Get payment order
    const order = await getPaymentOrderByNo(out_trade_no);
    if (!order) {
      console.error(`[Alipay Webhook] Order not found: ${out_trade_no}`);
      return res.status(404).send("fail");
    }

    // Check if order is already paid
    if (order.status === "paid") {
      console.log(`[Alipay Webhook] Order already paid: ${out_trade_no}`);
      return res.send("success");
    }

    // Handle payment status
    if (trade_status === "TRADE_SUCCESS" || trade_status === "TRADE_FINISHED") {
      // Update payment order
      await updatePaymentOrder(order.id, {
        status: "paid",
        paymentId: trade_no,
        paidAt: new Date(),
        metadata: params,
      });

      // Activate subscription
      const now = new Date();
      const periodEnd = new Date(now);

      if (order.billingCycle === "monthly") {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else if (order.billingCycle === "yearly") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      // Check if user already has an active subscription
      const existingSubscription = await getUserSubscription(order.userId);

      if (existingSubscription) {
        // TODO: Handle subscription renewal/upgrade
        console.log(`[Alipay Webhook] User ${order.userId} already has an active subscription`);
      } else {
        // Create new subscription
        await createSubscription({
          userId: order.userId,
          planId: order.planId,
          status: "active",
          billingCycle: (order.billingCycle || "monthly") as any,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          autoRenew: 1,
          amount: order.amount || "0"
        });

        console.log(`[Alipay Webhook] Subscription activated for user ${order.userId}`);
      }
    } else if (trade_status === "TRADE_CLOSED") {
      // Payment failed or cancelled
      await updatePaymentOrder(order.id, {
        status: "failed",
        paymentId: trade_no,
        metadata: params,
      });

      console.log(`[Alipay Webhook] Payment failed: ${out_trade_no}`);
    }

    // Return success to Alipay
    res.send("success");
  } catch (error) {
    console.error("[Alipay Webhook] Error:", error);
    res.status(500).send("fail");
  }
});

/**
 * WeChat Pay payment notification webhook
 * 
 * POST /api/webhooks/wechatpay
 */
webhooksRouter.post("/wechatpay", async (req: any, res: any) => {
  try {
    const { resource } = req.body;

    // Verify signature
    const timestamp = req.headers["wechatpay-timestamp"] as string;
    const nonce = req.headers["wechatpay-nonce"] as string;
    const signature = req.headers["wechatpay-signature"] as string;
    const body = JSON.stringify(req.body);

    const isValid = verifyWechatPayNotify({
      timestamp,
      nonce,
      signature,
      body,
    });

    if (!isValid) {
      console.error("[WeChat Pay Webhook] Invalid signature");
      return res.status(400).json({ code: "FAIL", message: "Invalid signature" });
    }

    // Decrypt resource
    const { ciphertext, nonce: resourceNonce, associated_data } = resource;
    const decryptedData = decryptWechatPayResource(
      ciphertext,
      resourceNonce,
      associated_data
    );

    const paymentData = JSON.parse(decryptedData);
    const { out_trade_no, trade_state, transaction_id } = paymentData;

    // Get payment order
    const order = await getPaymentOrderByNo(out_trade_no);
    if (!order) {
      console.error(`[WeChat Pay Webhook] Order not found: ${out_trade_no}`);
      return res.status(404).json({ code: "FAIL", message: "Order not found" });
    }

    // Check if order is already paid
    if (order.status === "paid") {
      console.log(`[WeChat Pay Webhook] Order already paid: ${out_trade_no}`);
      return res.json({ code: "SUCCESS" });
    }

    // Handle payment status
    if (trade_state === "SUCCESS") {
      // Update payment order
      await updatePaymentOrder(order.id, {
        status: "paid",
        paymentId: transaction_id,
        paidAt: new Date(),
        metadata: paymentData,
      });

      // Activate subscription
      const now = new Date();
      const periodEnd = new Date(now);

      if (order.billingCycle === "monthly") {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else if (order.billingCycle === "yearly") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      // Check if user already has an active subscription
      const existingSubscription = await getUserSubscription(order.userId);

      if (existingSubscription) {
        // TODO: Handle subscription renewal/upgrade
        console.log(`[WeChat Pay Webhook] User ${order.userId} already has an active subscription`);
      } else {
        // Create new subscription
        await createSubscription({
          userId: order.userId,
          planId: order.planId,
          status: "active",
          billingCycle: (order.billingCycle || "monthly") as any,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          autoRenew: 1,
          amount: order.amount || "0"
        });

        console.log(`[WeChat Pay Webhook] Subscription activated for user ${order.userId}`);
      }
    } else if (trade_state === "CLOSED" || trade_state === "REVOKED") {
      // Payment failed or cancelled
      await updatePaymentOrder(order.id, {
        status: "failed",
        paymentId: transaction_id,
        metadata: paymentData,
      });

      console.log(`[WeChat Pay Webhook] Payment failed: ${out_trade_no}`);
    }

    // Return success to WeChat Pay
    res.json({ code: "SUCCESS" });
  } catch (error) {
    console.error("[WeChat Pay Webhook] Error:", error);
    res.status(500).json({ code: "FAIL", message: "Internal server error" });
  }
});

export default webhooksRouter;
