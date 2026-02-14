/**
 * Vercel Serverless Function Entry Point
 * 
 * 这个文件将 Express 应用转换为 Vercel Serverless Function
 * 支持所有后端 API 路由：tRPC、OAuth、Webhooks
 */

import "dotenv/config";
import path from "path";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import webhookRouter from "../server/webhooks";

const app = express();

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS configuration for production
app.use((req, res, next) => {
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

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Health check endpoint
app.get("/api/ping", (req, res) => {
  res.send("pong");
});

// Export for Vercel Serverless
export default app;
