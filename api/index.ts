import express from "express";
import httpProxy from "http-proxy";

const app = express();
const proxy = httpProxy.createProxyServer();

// ECS Backend URL
const TARGET = "http://47.99.205.136";

// CORS Middleware
app.use((req: any, res: any, next: any) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// Proxy all /api/trpc requests to ECS
app.all("/api/trpc/:path*", (req, res) => {
  proxy.web(req, res, { target: TARGET, changeOrigin: true }, (err) => {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "Backend unreachable", details: err.message });
  });
});

// Fallback for other /api routes
app.all("/api/:path*", (req, res) => {
  proxy.web(req, res, { target: TARGET, changeOrigin: true }, (err) => {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "Backend unreachable", details: err.message });
  });
});

export default app;
