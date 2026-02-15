/**
 * Vercel Serverless Function Entry Point
 * 
 * 使用 ESM 兼容的导入方式，确保在 Vercel 环境下能正确解析模块
 */

import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// 在 Vercel 的 ESM 环境中，导入本地文件需要显式后缀，或者通过特定的解析规则
// 尝试使用更稳健的导入方式
import { registerOAuthRoutes } from "../server/_core/oauth.js";
import { appRouter } from "../server/routers/index.js";
import { createContext } from "../server/_core/context.js";
import webhookRouter from "../server/webhooks/index.js";
import authRouter from "../server/auth-routes.js";
import dashboardRouter from "../server/dashboard-routes.js";
import webinarRouter from "../server/webinar-routes.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS
app.use((req: any, res: any, next: any) => {
  const allowedOrigins = [
    process.env.APP_URL || "",
    process.env.CORS_ORIGIN || "",
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

registerOAuthRoutes(app);
app.use("/api/webhooks", webhookRouter);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/webinars", webinarRouter);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.get("/api/health", (req: any, res: any) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
