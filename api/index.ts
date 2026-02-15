import "dotenv/config";
import express from "express";
import mysql from 'mysql2/promise';

const app = express();
app.use(express.json());

// 1. Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. Database Diagnostic
app.get("/api/check-db", async (req, res) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "DATABASE_URL missing" });

  try {
    const conn = await mysql.createConnection({ uri: dbUrl, ssl: { rejectUnauthorized: false } });
    await conn.query('SELECT 1');
    await conn.end();
    res.json({ status: "success", message: "Database connected!" });
  } catch (err: any) {
    res.status(500).json({ status: "failed", error: err.message });
  }
});

// 3. Simple Proxy for Main App
// 为了最快恢复，我们暂时让主入口保持存活，并代理核心路由
app.use(async (req, res, next) => {
  try {
    // 动态加载确保启动不崩溃
    const { registerOAuthRoutes } = await import("../server/_core/oauth.js");
    const authRouter = (await import("../server/auth-routes.js")).default;
    const { appRouter } = await import("../server/routers/index.js");
    const { createContext } = await import("../server/_core/context.js");
    const { createExpressMiddleware } = await import("@trpc/server/adapters/express");

    if (req.path.startsWith("/api/auth")) {
      return authRouter(req, res, next);
    }
    
    if (req.path.startsWith("/api/trpc")) {
      return createExpressMiddleware({ router: appRouter, createContext })(req, res, next);
    }

    next();
  } catch (err: any) {
    res.status(500).json({ error: "Runtime Error", message: err.message });
  }
});

export default app;
