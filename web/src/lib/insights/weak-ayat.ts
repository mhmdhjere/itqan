export type AyahMistakeInput = {
  surah: number;
  ayah: number;
  sessionId: string;
  sessionEndedAt: string;
  statusSlug: string;
  mistakes: string[];
};

export type WeakAyahAggregate = {
  surah: number;
  ayah: number;
  mistakeCount: number;
  sessionCountWithMistakes: number;
  persistent: boolean;
  lastMistakeAt: string;
  topMistakeSlugs: string[];
};

export type WeakAyahEvent = {
  sessionId: string;
  sessionEndedAt: string;
  statusSlug: string;
  mistakes: string[];
};

export function aggregateAyahMistakes(
  records: AyahMistakeInput[],
  options: { minMistakes?: number } = {},
): WeakAyahAggregate[] {
  const minMistakes = options.minMistakes ?? 1;
  const byAyah = new Map<
    string,
    {
      surah: number;
      ayah: number;
      mistakeCount: number;
      sessionIds: Set<string>;
      lastMistakeAt: string;
      slugCounts: Map<string, number>;
    }
  >();

  for (const record of records) {
    const hasIssues =
      record.mistakes.length > 0 || record.statusSlug !== "correct";
    if (!hasIssues) continue;

    const key = `${record.surah}:${record.ayah}`;
    const entry = byAyah.get(key) ?? {
      surah: record.surah,
      ayah: record.ayah,
      mistakeCount: 0,
      sessionIds: new Set<string>(),
      lastMistakeAt: record.sessionEndedAt,
      slugCounts: new Map<string, number>(),
    };

    entry.mistakeCount += record.mistakes.length || 1;
    entry.sessionIds.add(record.sessionId);
    if (record.sessionEndedAt > entry.lastMistakeAt) {
      entry.lastMistakeAt = record.sessionEndedAt;
    }
    for (const slug of record.mistakes) {
      entry.slugCounts.set(slug, (entry.slugCounts.get(slug) ?? 0) + 1);
    }
    if (record.mistakes.length === 0 && record.statusSlug !== "correct") {
      entry.slugCounts.set(
        record.statusSlug,
        (entry.slugCounts.get(record.statusSlug) ?? 0) + 1,
      );
    }

    byAyah.set(key, entry);
  }

  return [...byAyah.values()]
    .filter((e) => e.mistakeCount >= minMistakes)
    .map((e) => ({
      surah: e.surah,
      ayah: e.ayah,
      mistakeCount: e.mistakeCount,
      sessionCountWithMistakes: e.sessionIds.size,
      persistent: e.sessionIds.size >= 2,
      lastMistakeAt: e.lastMistakeAt,
      topMistakeSlugs: [...e.slugCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([slug]) => slug),
    }))
    .sort((a, b) => b.mistakeCount - a.mistakeCount || b.ayah - a.ayah);
}

export function eventsForAyah(
  records: AyahMistakeInput[],
  surah: number,
  ayah: number,
): WeakAyahEvent[] {
  return records
    .filter(
      (r) =>
        r.surah === surah &&
        r.ayah === ayah &&
        (r.mistakes.length > 0 || r.statusSlug !== "correct"),
    )
    .map((r) => ({
      sessionId: r.sessionId,
      sessionEndedAt: r.sessionEndedAt,
      statusSlug: r.statusSlug,
      mistakes: r.mistakes,
    }))
    .sort((a, b) => b.sessionEndedAt.localeCompare(a.sessionEndedAt));
}
