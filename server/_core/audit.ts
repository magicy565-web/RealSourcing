/**
 * 审计日志工具
 * Audit Log Utility
 */

import { getDb } from "../db.js";
import { auditLogs } from "../../drizzle/schema.js";

export interface AuditLogData {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  changes?: any;
  metadata?: any;
}

/**
 * 记录审计日志
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database connection failed, cannot log audit event");
      return;
    }

    await db.insert(auditLogs).values({
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      changes: data.changes ? JSON.stringify(data.changes) : null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
    // 不抛出错误,避免影响主业务流程
  }
}

/**
 * 批量记录审计日志
 */
export async function logBatchAuditEvents(events: AuditLogData[]): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database connection failed, cannot log audit events");
      return;
    }

    const values = events.map((event) => ({
      userId: event.userId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      changes: event.changes ? JSON.stringify(event.changes) : null,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      createdAt: new Date(),
    }));

    await db.insert(auditLogs).values(values);
  } catch (error) {
    console.error("Failed to log batch audit events:", error);
  }
}
