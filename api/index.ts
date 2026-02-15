/**
 * Vercel Serverless Function Entry Point (Robust Version)
 */

import express from "express";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS Middleware
app.use((req: any, res: any, next: any) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// Health check available immediately
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

/**
 * Lazy load routes to prevent startup crashes
 */
const initRoutes = async () => {
  try {
    const { registerOAuthRoutes } = await import("../server/_core/oauth.js");
    const { default: authRouter } = await import("../server/auth-routes.js");
    const { default: dashboardRouter } = await import("../server/dashboard-routes.js");
    const { default: webinarRouter } = await import("../server/webinar-routes.js");
    const { appRouter } = await import("../server/routers/index.js");
    const { createContext } = await import("../server/_core/context.js");
    const { createExpressMiddleware } = await import("@trpc/server/adapters/express");

    registerOAuthRoutes(app);
    app.use("/api/auth", authRouter);
    app.use("/api/dashboard", dashboardRouter);
    app.use("/api/webinars", webinarRouter);
    
    app.use("/api/trpc", createExpressMiddleware({
      router: appRouter,
      createContext,
    }));

    console.log("[Server] Routes initialized successfully");
  } catch (err) {
    console.error("[Server] Critical initialization error:", err);
    throw err;
  }
};

// Vercel handles the export, but we need to ensure routes are registered
// We use a middleware to ensure routes are loaded on the first request
let initialized = false;
let initError: any = null;

app.use(async (req, res, next) => {
  if (initialized) return next();
  if (initError) return res.status(500).json({ error: "Initialization failed", details: initError.message });
  
  try {
    await initRoutes();
    initialized = true;
    next();
  } catch (err: any) {
    initError = err;
    res.status(500).json({ error: "Initialization failed during startup", details: err.message });
  }
});

export default app;
