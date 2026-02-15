import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth.js";
import { appRouter } from "../server/routers/index.js";
import { createContext } from "../server/_core/context.js";
import authRouter from "../server/auth-routes.js";
import dashboardRouter from "../server/dashboard-routes.js";
import webinarRouter from "../server/webinar-routes.js";

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

// Register all routes statically
registerOAuthRoutes(app);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/webinars", webinarRouter);

app.use("/api/trpc", createExpressMiddleware({
  router: appRouter,
  createContext,
}));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    mode: "fully-bundled", 
    timestamp: new Date().toISOString() 
  });
});

export default app;
