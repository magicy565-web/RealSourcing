/**
 * Simple REST API endpoint for webinars
 * Bypasses tRPC complexity
 */
import { Request, Response } from "express";
import { getDb } from "../_core/db.js";
import { webinars } from "../../drizzle/schema.js";
import { eq, desc, and, sql } from "drizzle-orm";

export async function getWebinars(req: Request, res: Response) {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    const { status, limit = 100, offset = 0 } = req.query;

    const conditions = [];
    if (status && typeof status === "string") {
      conditions.push(eq(webinars.status, status as any));
    }

    const items = await db
      .select()
      .from(webinars)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(webinars.scheduledAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(webinars)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;

    res.json({
      items,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error("[API] Error fetching webinars:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
