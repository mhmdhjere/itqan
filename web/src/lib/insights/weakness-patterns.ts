import type { ActiveConfig } from "@/lib/config/types";

export type MistakeRecord = {
  mistakes: string[];
  recordedAt: string;
};

export type SubcategoryStat = {
  slug: string;
  label: string;
  count: number;
  percent: number;
};

export type CategoryPattern = {
  category: string;
  label: string;
  count: number;
  percent: number;
  topSubcategory: SubcategoryStat | null;
  trendDelta: number | null;
};

export type WeaknessPatternsResult = {
  totalMistakes: number;
  categories: CategoryPattern[];
  strongestCategory: { category: string; label: string } | null;
  weakestCategory: { category: string; label: string } | null;
};

function filterByPeriod(records: MistakeRecord[], since: Date): MistakeRecord[] {
  return records.filter((r) => new Date(r.recordedAt) >= since);
}

function countByCategory(
  records: MistakeRecord[],
  config: ActiveConfig | null,
): Map<string, { count: number; subCounts: Map<string, number> }> {
  const categoryBySlug = new Map(
    config?.mistakeSubcategories.map((s) => [s.slug, s.categorySlug]) ?? [],
  );
  const result = new Map<string, { count: number; subCounts: Map<string, number> }>();

  for (const record of records) {
    for (const slug of record.mistakes) {
      const cat = categoryBySlug.get(slug) ?? "other";
      const entry = result.get(cat) ?? { count: 0, subCounts: new Map() };
      entry.count += 1;
      entry.subCounts.set(slug, (entry.subCounts.get(slug) ?? 0) + 1);
      result.set(cat, entry);
    }
  }

  return result;
}

export function aggregateWeaknessPatterns(
  records: MistakeRecord[],
  config: ActiveConfig | null,
  days: number,
): WeaknessPatternsResult {
  const now = Date.now();
  const periodStart = new Date(now - days * 24 * 60 * 60 * 1000);
  const priorStart = new Date(now - days * 2 * 24 * 60 * 60 * 1000);

  const current = filterByPeriod(records, periodStart);
  const prior = filterByPeriod(records, priorStart).filter(
    (r) => new Date(r.recordedAt) < periodStart,
  );

  const currentCounts = countByCategory(current, config);
  const priorCounts = countByCategory(prior, config);
  const totalMistakes = current.reduce(
    (sum, r) => sum + r.mistakes.length,
    0,
  );

  const labelByCat = new Map(
    config?.mistakeCategories.map((c) => [c.slug, c.labelEn]) ?? [],
  );
  const labelBySlug = new Map(
    config?.mistakeSubcategories.map((s) => [s.slug, s.labelEn]) ?? [],
  );

  const categories: CategoryPattern[] = [...currentCounts.entries()].map(
    ([category, data]) => {
      const priorTotal = priorCounts.get(category)?.count ?? 0;
      const priorPct =
        prior.reduce((s, r) => s + r.mistakes.length, 0) > 0
          ? (priorTotal / prior.reduce((s, r) => s + r.mistakes.length, 0)) *
            100
          : 0;
      const pct =
        totalMistakes > 0 ? (data.count / totalMistakes) * 100 : 0;

      const topSub = [...data.subCounts.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0];

      return {
        category,
        label: labelByCat.get(category) ?? category,
        count: data.count,
        percent: Math.round(pct),
        topSubcategory: topSub
          ? {
              slug: topSub[0],
              label: labelBySlug.get(topSub[0]) ?? topSub[0],
              count: topSub[1],
              percent:
                data.count > 0
                  ? Math.round((topSub[1] / data.count) * 100)
                  : 0,
            }
          : null,
        trendDelta:
          prior.length > 0 ? Math.round(pct - priorPct) : null,
      };
    },
  );

  categories.sort((a, b) => b.percent - a.percent);

  const strongest =
    categories.length > 0
      ? categories.reduce((min, c) => (c.percent < min.percent ? c : min))
      : null;
  const weakest = categories[0] ?? null;

  return {
    totalMistakes,
    categories,
    strongestCategory: strongest
      ? { category: strongest.category, label: strongest.label }
      : null,
    weakestCategory: weakest
      ? { category: weakest.category, label: weakest.label }
      : null,
  };
}
