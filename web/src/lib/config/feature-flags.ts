import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { featureFlags } from "@/db/schema";
import { writeConfigAuditLog } from "./audit";
import { invalidateActiveConfigCache } from "./service";

export type FeatureFlagDto = {
  key: string;
  enabled: boolean;
  description: string | null;
  scope: string;
};

export async function listFeatureFlags(): Promise<FeatureFlagDto[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(featureFlags)
    .orderBy(asc(featureFlags.key));

  return rows.map((row) => ({
    key: row.key,
    enabled: row.enabled,
    description: row.description,
    scope: row.scope,
  }));
}

export async function patchFeatureFlags(
  updates: { key: string; enabled: boolean }[],
  adminUserId: string,
) {
  const db = getDb();

  for (const update of updates) {
    const [existing] = await db
      .select()
      .from(featureFlags)
      .where(eq(featureFlags.key, update.key))
      .limit(1);

    if (!existing) continue;

    await db
      .update(featureFlags)
      .set({ enabled: update.enabled })
      .where(eq(featureFlags.key, update.key));

    await writeConfigAuditLog({
      adminUserId,
      entityType: "feature_flag",
      entityId: update.key,
      field: "enabled",
      oldValue: existing.enabled,
      newValue: update.enabled,
    });
  }

  invalidateActiveConfigCache();
}
