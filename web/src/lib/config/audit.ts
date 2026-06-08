import { getDb } from "@/db";
import { configAuditLog } from "@/db/schema";

export type AuditLogInput = {
  adminUserId?: string | null;
  entityType: string;
  entityId?: string | null;
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
  changeReason?: string | null;
};

export async function writeConfigAuditLog(input: AuditLogInput) {
  const db = getDb();
  const [row] = await db
    .insert(configAuditLog)
    .values({
      adminUserId: input.adminUserId ?? null,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      field: input.field,
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
      changeReason: input.changeReason ?? null,
    })
    .returning();

  return row;
}
