import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appConfig } from "@/db/schema";
import { writeConfigAuditLog } from "./audit";
import { invalidateActiveConfigCache } from "./service";

export type AdminConfigRow = {
  key: string;
  value: unknown;
  valueType: string;
  category: string;
  label: string;
  description: string | null;
};

export async function loadAdminConfig(): Promise<Record<string, AdminConfigRow[]>> {
  const db = getDb();
  const rows = await db
    .select()
    .from(appConfig)
    .orderBy(asc(appConfig.category), asc(appConfig.key));

  const grouped: Record<string, AdminConfigRow[]> = {};
  for (const row of rows) {
    const entry: AdminConfigRow = {
      key: row.key,
      value: row.valueJson,
      valueType: row.valueType,
      category: row.category,
      label: row.label,
      description: row.description,
    };
    if (!grouped[row.category]) grouped[row.category] = [];
    grouped[row.category].push(entry);
  }
  return grouped;
}

export async function patchAdminConfig(
  updates: { key: string; value: unknown }[],
  adminUserId: string,
) {
  const db = getDb();

  for (const update of updates) {
    const [existing] = await db
      .select()
      .from(appConfig)
      .where(eq(appConfig.key, update.key))
      .limit(1);

    if (!existing) continue;

    await db
      .update(appConfig)
      .set({
        valueJson: update.value,
        updatedAt: new Date(),
        updatedBy: adminUserId,
      })
      .where(eq(appConfig.key, update.key));

    await writeConfigAuditLog({
      adminUserId,
      entityType: "app_config",
      entityId: update.key,
      field: update.key,
      oldValue: existing.valueJson,
      newValue: update.value,
    });
  }

  invalidateActiveConfigCache();
}
