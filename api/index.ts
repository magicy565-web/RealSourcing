/**
 * Vercel Serverless Function Entry Point (Diagnostic Version)
 */

import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json({ limit: "50mb" }));

// Diagnostic Endpoint
app.get("/api/debug-files", (req, res) => {
  const getDirStructure = (dir: string, depth = 0): any => {
    if (depth > 2) return "...";
    try {
      const files = fs.readdirSync(dir);
      const structure: any = {};
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          structure[file] = getDirStructure(fullPath, depth + 1);
        } else {
          structure[file] = "file";
        }
      }
      return structure;
    } catch (e: any) {
      return { error: e.message };
    }
  };

  res.json({
    cwd: process.cwd(),
    structure: {
      root: getDirStructure(process.cwd()),
      var_task: getDirStructure("/var/task")
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Lazy load routes
 */
const initRoutes = async () => {
  const { registerOAuthRoutes } = await import("../server/_core/oauth.js");
  const { default: authRouter } = await import("../server/auth-routes.js");
  const { appRouter } = await import("../server/routers/index.js");
  const { createContext } = await import("../server/_core/context.js");
  const { createExpressMiddleware } = await import("@trpc/server/adapters/express");

  registerOAuthRoutes(app);
  app.use("/api/auth", authRouter);
  
  app.use("/api/trpc", createExpressMiddleware({
    router: appRouter,
    createContext,
  }));
};

let initialized = false;
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api/debug") || req.path === "/api/health") return next();
  
  if (!initialized) {
    try {
      await initRoutes();
      initialized = true;
    } catch (err: any) {
      return res.status(500).json({ 
        error: "Initialization failed", 
        message: err.message,
        stack: err.stack
      });
    }
  }
  next();
});

export default app;
