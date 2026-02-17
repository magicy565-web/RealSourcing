/**
 * Admin Router 聚合文件
 * 导出所有管理后台路由组成的 adminRouter
 */

import { router } from "../../_core/trpc.js";
import { adminUserRouter } from "./user.router.js";
import { adminReviewRouter } from "./review.router.js";
import { adminAnalyticsRouter } from "./analytics.router.js";

/**
 * 管理后台主路由
 * 聚合所有管理功能的子路由
 */
export const adminRouter = router({
  user: adminUserRouter,
  review: adminReviewRouter,
  analytics: adminAnalyticsRouter,
});

/**
 * 导出 AdminRouter 类型供客户端使用
 */
export type AdminRouter = typeof adminRouter;
