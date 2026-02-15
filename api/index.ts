/**
 * Vercel Serverless Function Entry Point
 * 
 * 这个文件将 Express 应用转换为 Vercel Serverless Function
 * 支持所有后端 API 路由：tRPC、OAuth、Webhooks、Auth、Dashboard、Webinars
 */

import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import webhookRouter from "../server/webhooks";
import authRouter from "../server/auth-routes";
import dashboardRouter from "../server/dashboard-routes";
import webinarRouter from "../server/webinar-routes";

const app = express();

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS configuration for production
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

// OAuth callback routes
registerOAuthRoutes(app);

// Webhook routes for payment callbacks
app.use("/api/webhooks", webhookRouter);

// Auth routes (register, login)
app.use("/api/auth", authRouter);

// Dashboard routes
app.use("/api/dashboard", dashboardRouter);

// Webinar CRUD routes
app.use("/api/webinars", webinarRouter);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check endpoint
app.get("/api/health", (req: any, res: any) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Health check endpoint
app.get("/api/ping", (req: any, res: any) => {
  res.send("pong");
});

// Export for Vercel Serverless
export default app;
