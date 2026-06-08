import type { ActiveConfig } from "@/lib/config/types";
import { verseKey } from "@/lib/session-ranges";

export type VerseScoreInput = {
  statusSlug: string;
  mistakes?: string[];
};

export type AyahRecitationRecord = {
  sessionId: string;
  sessionEndedAt: string;
  surah: number;
  ayah: number;
  statusSlug: string;
  mistakes: string[];
};

function statusPoints(config: ActiveConfig | null): Map<string, number> {
  return new Map(
    config?.verseStatuses.map((s) => [s.slug, s.scorePoints]) ?? [],
  );
}

function mistakePenalty(config: ActiveConfig | null): number {
  return (config?.config.mastery.mistake_penalty as number | undefined) ?? 5;
}

function rollingWindow(config: ActiveConfig | null): number {
  return (
    (config?.config.mastery.rolling_window_sessions as number | undefined) ?? 3
  );
}

export function computeVerseScore(
  statusSlug: string,
  mistakes: string[] | undefined,
  config: ActiveConfig | null,
): number {
  const points = statusPoints(config);
  const base = points.get(statusSlug) ?? (statusSlug === "correct" ? 100 : 0);
  const penalty = (mistakes?.length ?? 0) * mistakePenalty(config);
  return Math.max(base - penalty, 0);
}

export function computeSessionMastery(
  verses: VerseScoreInput[],
  config: ActiveConfig | null,
): number {
  if (verses.length === 0) return 100;
  const total = verses.reduce(
    (sum, v) =>
      sum + computeVerseScore(v.statusSlug, v.mistakes ?? [], config),
    0,
  );
  return Math.round(total / verses.length);
}

export function aggregateMistakeBreakdown(
  records: { mistakes: string[] }[],
  config: ActiveConfig | null,
): { category: string; count: number }[] {
  const categoryBySlug = new Map(
    config?.mistakeSubcategories.map((s) => [s.slug, s.categorySlug]) ?? [],
  );
  const counts = new Map<string, number>();

  for (const record of records) {
    for (const slug of record.mistakes ?? []) {
      const cat = categoryBySlug.get(slug) ?? "other";
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

function decayWeights(count: number, window: number): number[] {
  const n = Math.min(count, window);
  return Array.from({ length: n }, (_, i) => n - i);
}

export function computeRollingAyahMastery(
  history: AyahRecitationRecord[],
  config: ActiveConfig | null,
): number {
  if (history.length === 0) return 0;

  const sorted = [...history].sort(
    (a, b) =>
      new Date(b.sessionEndedAt).getTime() -
      new Date(a.sessionEndedAt).getTime(),
  );

  const window = rollingWindow(config);
  const recent = sorted.slice(0, window);
  const weights = decayWeights(recent.length, window);

  let weightedSum = 0;
  let weightTotal = 0;
  recent.forEach((record, i) => {
    const score = computeVerseScore(
      record.statusSlug,
      record.mistakes,
      config,
    );
    weightedSum += score * weights[i];
    weightTotal += weights[i];
  });

  return weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;
}

export function computeStudentMasteryPercent(
  history: AyahRecitationRecord[],
  config: ActiveConfig | null,
): number {
  const byAyah = new Map<string, AyahRecitationRecord[]>();
  for (const record of history) {
    const key = verseKey(record.surah, record.ayah);
    const list = byAyah.get(key) ?? [];
    list.push(record);
    byAyah.set(key, list);
  }

  if (byAyah.size === 0) return 0;

  let sum = 0;
  for (const ayahHistory of byAyah.values()) {
    sum += computeRollingAyahMastery(ayahHistory, config);
  }

  return Math.round(sum / byAyah.size);
}

export type SurahMasteryScore = {
  surah: number;
  score: number;
  ayahCount: number;
};

export function computeSurahMasteryScores(
  history: AyahRecitationRecord[],
  config: ActiveConfig | null,
): SurahMasteryScore[] {
  const bySurah = new Map<number, Map<number, AyahRecitationRecord[]>>();

  for (const record of history) {
    const surahMap = bySurah.get(record.surah) ?? new Map();
    const ayahList = surahMap.get(record.ayah) ?? [];
    ayahList.push(record);
    surahMap.set(record.ayah, ayahList);
    bySurah.set(record.surah, surahMap);
  }

  const results: SurahMasteryScore[] = [];
  for (const [surah, ayahMap] of bySurah) {
    let sum = 0;
    for (const ayahHistory of ayahMap.values()) {
      sum += computeRollingAyahMastery(ayahHistory, config);
    }
    results.push({
      surah,
      score: Math.round(sum / ayahMap.size),
      ayahCount: ayahMap.size,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

export function strongestWeakestSurah(scores: SurahMasteryScore[]): {
  strongest: SurahMasteryScore | null;
  weakest: SurahMasteryScore | null;
} {
  if (scores.length === 0) {
    return { strongest: null, weakest: null };
  }
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  return {
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
  };
}
