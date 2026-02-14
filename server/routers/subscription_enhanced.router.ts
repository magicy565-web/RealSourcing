/**
 * 增强版订阅管理 tRPC 路由
 * 集成配额管理和使用量追踪
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  getSubscriptionPlans,
  getSubscriptionPlanById,
  getUserSubscription,
} from "../db";
import {
  initializeUserSubscription,
  upgradeSubscription,
  downgradeSubscription,
  cancelUserSubscription,
  getUserQuotaLimits,
  getUserQuotaUsage,
  getUserSubscriptionDetails,
  checkQuota,
} from "../saas-core";

export const subscriptionEnhancedRouter = router({
  // ============================================================================
  // 订阅计划
  // ============================================================================
  
  /**
   * 获取所有订阅计划
   */
  getPlans: protectedProcedure
    .query(async () => {
      return await getSubscriptionPlans();
    }),
  
  /**
   * 获取订阅计划详情
   */
  getPlanById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      return await getSubscriptionPlanById(input.id);
    }),
  
  // ============================================================================
  // 用户订阅
  // ============================================================================
  
  /**
   * 获取用户当前订阅
   */
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      const subscription = await getUserSubscription(ctx.user.id);
      
      // 如果没有订阅，初始化免费试用
      if (!subscription) {
        const newSub = await initializeUserSubscription(ctx.user.id);
        return newSub || undefined; // Convert null to undefined for TS compatibility
      }
      
      return subscription;
    }),
  
  /**
   * 获取用户订阅详情（包含配额和使用量）
   */
  getDetails: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserSubscriptionDetails(ctx.user.id);
    }),
  
  /**
   * 升级订阅
   */
  upgrade: protectedProcedure
    .input(z.object({
      planId: z.string(),
      billingCycle: z.enum(["monthly", "yearly"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await upgradeSubscription(
        ctx.user.id,
        input.planId,
        input.billingCycle
      );
      return { success: true, subscription };
    }),
  
  /**
   * 降级订阅
   */
  downgrade: protectedProcedure
    .input(z.object({
      planId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await downgradeSubscription(ctx.user.id, input.planId);
      return { success: true, subscription };
    }),
  
  /**
   * 取消订阅
   */
  cancel: protectedProcedure
    .input(z.object({
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await cancelUserSubscription(ctx.user.id, input.reason);
      return { success: true, subscription };
    }),
  
  // ============================================================================
  // 配额管理
  // ============================================================================
  
  /**
   * 获取用户配额限制
   */
  getQuotaLimits: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserQuotaLimits(ctx.user.id);
    }),
  
  /**
   * 获取用户配额使用情况
   */
  getQuotaUsage: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserQuotaUsage(ctx.user.id);
    }),
  
  /**
   * 检查特定资源的配额
   */
  checkQuota: protectedProcedure
    .input(z.object({
      resourceType: z.enum(["webinar", "product", "inquiry", "storage", "video", "ai_report"]),
    }))
    .query(async ({ ctx, input }) => {
      return await checkQuota(ctx.user.id, input.resourceType);
    }),
  
  /**
   * 获取配额仪表板数据
   */
  getDashboard: protectedProcedure
    .query(async ({ ctx }) => {
      const details = await getUserSubscriptionDetails(ctx.user.id);
      
      if (!details) {
        return {
          subscription: null,
          plan: null,
          quotas: [],
        };
      }
      
      const quotas = [
        {
          name: "会议创建",
          key: "webinar",
          current: details.usage.webinarCreated,
          limit: details.limits.webinarCreatedMonthly,
          percentage: details.quotaPercentage.webinar,
          unit: "场/月",
          unlimited: details.limits.webinarCreatedMonthly === -1,
        },
        {
          name: "产品数量",
          key: "product",
          current: details.usage.products,
          limit: details.limits.productsMax,
          percentage: details.quotaPercentage.product,
          unit: "个",
          unlimited: details.limits.productsMax === -1,
        },
        {
          name: "询价数量",
          key: "inquiry",
          current: details.usage.inquiries,
          limit: details.limits.inquiriesMonthly,
          percentage: details.quotaPercentage.inquiry,
          unit: "次/月",
          unlimited: details.limits.inquiriesMonthly === -1,
        },
        {
          name: "存储空间",
          key: "storage",
          current: details.usage.storage,
          limit: details.limits.storageGB,
          percentage: details.quotaPercentage.storage,
          unit: "GB",
          unlimited: details.limits.storageGB === -1,
        },
        {
          name: "视频录制",
          key: "video",
          current: details.usage.videoRecording,
          limit: details.limits.videoRecordingHours,
          percentage: details.quotaPercentage.video,
          unit: "小时/月",
          unlimited: details.limits.videoRecordingHours === -1,
        },
        {
          name: "AI 报告",
          key: "ai_report",
          current: details.usage.aiReports,
          limit: details.limits.aiReportsMonthly,
          percentage: details.quotaPercentage.aiReport,
          unit: "份/月",
          unlimited: details.limits.aiReportsMonthly === -1,
        },
      ];
      
      return {
        subscription: details.subscription,
        plan: details.plan,
        quotas,
      };
    }),
});
