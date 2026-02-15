/**
 * Vercel Serverless Function Entry Point (Diagnostic Version)
 */

import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import mysql from 'mysql2/promise';

// 显式使用 .js 后缀以符合 Vercel ESM 运行时要求
import { registerOAuthRoutes } from "../server/_core/oauth.js";
import { appRouter } from "../server/routers/index.js";
import { createContext } from "../server/_core/context.js";
import authRouter from "../server/auth-routes.js";
import dashboardRouter from "../server/dashboard-routes.js";
import webinarRouter from "../server/webinar-routes.js";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS
app.use((req: any, res: any, next: any) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// 🚀 核心诊断接口
app.get("/api/check-db", async (req, res) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.json({ status: "error", message: "DATABASE_URL is missing in environment variables" });
  }

  try {
    const connection = await mysql.createConnection({
      uri: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 10000
    });
    await connection.query('SELECT 1');
    await connection.end();
    return res.json({ 
      status: "success", 
      message: "Successfully connected to MySQL!",
      dbUrlMasked: dbUrl.replace(/\/\/.*@/, "//***:***@")
    });
  } catch (err: any) {
    return res.json({ 
      status: "failed", 
      error_code: err.code,
      error_message: err.message,
      errno: err.errno,
      sqlState: err.sqlState,
      dbUrlMasked: dbUrl.replace(/\/\/.*@/, "//***:***@")
    });
  }
});

app.get("/api/health", (req: any, res: any) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Register Routes
registerOAuthRoutes(app);
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

export default app;
