/**
 * tRPC Router 聚合文件
 * 导出所有业务路由组成的 appRouter
 */

import { router } from "../_core/trpc.js";
import { factoryRouter } from "./factory.router.js";
import { orderRouter } from "./order.router.js";
import { webinarRouter } from "./webinar.router.js";
import { paymentRouter } from "./payment.router.js";
import { subscriptionRouter } from "./subscription.router.js";
import { subscriptionEnhancedRouter } from "./subscription_enhanced.router.js";
import { usageRouter } from "./usage.router.js";
import { agoraRouter } from "./agora.router.js";
import { rtmRouter } from "./rtm.router.js";
import { aiRouter } from "./ai.router.js";
import { directusProxyRouter } from "./directus-proxy.router.js";
import { buyerRouter } from "./buyer.router.js";
import { adminRouter } from "./admin/index.js";

/**
 * 应用主路由
 * 聚合所有业务模块的子路由
 */
export const appRouter = router({
  factory: factoryRouter,
  order: orderRouter,
  webinar: webinarRouter,
  payment: paymentRouter,
  subscription: subscriptionRouter,
  subscriptionEnhanced: subscriptionEnhancedRouter,
  usage: usageRouter,
  agora: agoraRouter,
  rtm: rtmRouter,
  ai: aiRouter,
  directus: directusProxyRouter,
  buyer: buyerRouter,
  admin: adminRouter,
});

/**
 * 导出 AppRouter 类型供客户端使用
 */
export type AppRouter = typeof appRouter;
