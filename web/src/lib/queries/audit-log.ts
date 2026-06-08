import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { configAuditLog, users } from "@/db/schema";

export type AuditLogEntry = {
  id: string;
  adminUserId: string | null;
  adminName: string | null;
  adminEmail: string | null;
  entityType: string;
  entityId: string | null;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeReason: string | null;
  changedAt: string;
};

export type AuditLogFilters = {
  from?: Date;
  to?: Date;
  entityType?: string;
  adminUserId?: string;
  limit?: number;
};

export async function listAuditLog(
  filters: AuditLogFilters = {},
): Promise<AuditLogEntry[]> {
  const db = getDb();
  const conditions = [];

  if (filters.from) {
    conditions.push(gte(configAuditLog.changedAt, filters.from));
  }
  if (filters.to) {
    conditions.push(lte(configAuditLog.changedAt, filters.to));
  }
  if (filters.entityType) {
    conditions.push(eq(configAuditLog.entityType, filters.entityType));
  }
  if (filters.adminUserId) {
    conditions.push(eq(configAuditLog.adminUserId, filters.adminUserId));
  }

  const limit = filters.limit ?? 50;

  const rows = await db
    .select({
      id: configAuditLog.id,
      adminUserId: configAuditLog.adminUserId,
      adminName: users.name,
      adminEmail: users.email,
      entityType: configAuditLog.entityType,
      entityId: configAuditLog.entityId,
      field: configAuditLog.field,
      oldValue: configAuditLog.oldValue,
      newValue: configAuditLog.newValue,
      changeReason: configAuditLog.changeReason,
      changedAt: configAuditLog.changedAt,
    })
    .from(configAuditLog)
    .leftJoin(users, eq(configAuditLog.adminUserId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(configAuditLog.changedAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    adminUserId: row.adminUserId,
    adminName: row.adminName,
    adminEmail: row.adminEmail,
    entityType: row.entityType,
    entityId: row.entityId,
    field: row.field,
    oldValue: row.oldValue,
    newValue: row.newValue,
    changeReason: row.changeReason,
    changedAt: row.changedAt.toISOString(),
  }));
}

export async function countAuditLogSince(since: Date) {
  const db = getDb();
  const [row] = await db
    .select({ total: count() })
    .from(configAuditLog)
    .where(gte(configAuditLog.changedAt, since));
  return row?.total ?? 0;
}
