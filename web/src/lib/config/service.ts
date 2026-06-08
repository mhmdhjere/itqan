import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  appConfig,
  featureFlags,
  mistakeCategories,
  mistakeSubcategories,
  verseStatusDefinitions,
} from "@/db/schema";
import type { ActiveConfig } from "./types";

const DEFAULT_TTL_MS = 60_000;

type CacheEntry = {
  data: ActiveConfig;
  expiresAt: number;
};

let cache: CacheEntry | null = null;
let ttlMs = DEFAULT_TTL_MS;

function groupConfigKey(key: string, value: unknown, target: ActiveConfig["config"]) {
  if (key.startsWith("mastery.")) {
    target.mastery[key.replace("mastery.", "")] = value as number;
  } else if (key.startsWith("review.")) {
    target.review[key.replace("review.", "")] = value as number;
  } else if (key.startsWith("live.")) {
    target.live[key.replace("live.", "")] = value as string | number | boolean;
  } else if (key.startsWith("display.")) {
    target.display[key.replace("display.", "")] = value as string | number;
  } else if (key.startsWith("system.")) {
    target.system[key.replace("system.", "")] = value as number;
  }
}

export function invalidateActiveConfigCache() {
  cache = null;
}

export function setActiveConfigCacheTtl(ms: number) {
  ttlMs = ms;
}

export async function loadActiveConfigFromDb(): Promise<ActiveConfig> {
  const db = getDb();

  const [statusRows, categoryRows, subcategoryRows, configRows, flagRows] =
    await Promise.all([
      db
        .select()
        .from(verseStatusDefinitions)
        .where(eq(verseStatusDefinitions.isActive, true))
        .orderBy(asc(verseStatusDefinitions.sortOrder)),
      db
        .select()
        .from(mistakeCategories)
        .where(eq(mistakeCategories.isActive, true))
        .orderBy(asc(mistakeCategories.sortOrder)),
      db
        .select({
          slug: mistakeSubcategories.slug,
          categorySlug: mistakeCategories.slug,
          labelEn: mistakeSubcategories.labelEn,
          labelAr: mistakeSubcategories.labelAr,
          sortOrder: mistakeSubcategories.sortOrder,
        })
        .from(mistakeSubcategories)
        .innerJoin(
          mistakeCategories,
          eq(mistakeSubcategories.categoryId, mistakeCategories.id),
        )
        .where(eq(mistakeSubcategories.isActive, true))
        .orderBy(asc(mistakeSubcategories.sortOrder)),
      db.select().from(appConfig),
      db.select().from(featureFlags),
    ]);

  const config: ActiveConfig["config"] = {
    mastery: {},
    review: {},
    live: {},
    display: {},
    system: {},
    features: {},
  };

  for (const row of configRows) {
    groupConfigKey(row.key, row.valueJson, config);
  }

  for (const flag of flagRows) {
    const shortKey = flag.key.replace("features.", "");
    config.features[shortKey] = flag.enabled;
  }

  return {
    verseStatuses: statusRows.map((row) => ({
      slug: row.slug,
      labelEn: row.labelEn,
      labelAr: row.labelAr,
      scorePoints: row.scorePoints,
      color: row.color,
      sortOrder: row.sortOrder,
      isDefaultImplicit: row.isDefaultImplicit,
    })),
    mistakeCategories: categoryRows.map((row) => ({
      slug: row.slug,
      labelEn: row.labelEn,
      labelAr: row.labelAr,
      sortOrder: row.sortOrder,
    })),
    mistakeSubcategories: subcategoryRows,
    config,
    cachedAt: new Date().toISOString(),
  };
}

export async function getActiveConfig(
  loader: () => Promise<ActiveConfig> = loadActiveConfigFromDb,
): Promise<ActiveConfig> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.data;
  }

  const data = await loader();
  cache = { data, expiresAt: now + ttlMs };
  return data;
}
