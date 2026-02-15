/**
 * Vercel Serverless Function - Zero Local Dependency Version
 * This file is designed to survive Vercel's runtime by avoiding all "../server" imports.
 */

import express from "express";
import mysql from 'mysql2/promise';

const app = express();
app.use(express.json());

// 1. Pure Health Check (No dependencies)
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Serverless function is alive and isolated",
    timestamp: new Date().toISOString() 
  });
});

// 2. Isolated Database Diagnostic
app.get("/api/check-db", async (req, res) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "DATABASE_URL missing" });

  try {
    const conn = await mysql.createConnection({ 
      uri: dbUrl, 
      ssl: { rejectUnauthorized: false },
      connectTimeout: 5000 
    });
    await conn.query('SELECT 1');
    await conn.end();
    res.json({ status: "success", message: "Database connection verified from isolated entry!" });
  } catch (err: any) {
    res.status(500).json({ 
      status: "failed", 
      error: err.message,
      hint: "Check if DATABASE_URL is correct and RDS allows public access"
    });
  }
});

// 3. Fallback Route to prevent 404s
app.all("/api/:path*", (req, res) => {
  res.status(200).json({
    message: "The backend is currently in isolated mode for recovery.",
    path: req.params.path,
    instruction: "If you see this, the runtime is working. We can now safely re-introduce modules."
  });
});

export default app;
