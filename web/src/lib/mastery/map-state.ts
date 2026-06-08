import type { ActiveConfig } from "@/lib/config/types";
import {
  computeRollingAyahMastery,
  type AyahRecitationRecord,
} from "@/lib/mastery/scoring";
import type { AyahMasteryCell, MasteryMapState, SurahMasteryCell } from "@/lib/types";
import { getSurahIndex } from "@/lib/quran";

const STATE_PRIORITY: Record<MasteryMapState, number> = {
  frequently_weak: 4,
  needs_review: 3,
  memorized: 2,
  not_recited: 1,
};

function mapConfig(config: ActiveConfig | null) {
  const mastery = config?.config.mastery ?? {};
  return {
    memorizedMin: (mastery["map.memorized_min_score"] as number | undefined) ?? 90,
    staleDays: (mastery["map.stale_days"] as number | undefined) ?? 90,
    weakMistakeCount:
      (mastery["map.weak_mistake_count"] as number | undefined) ?? 3,
  };
}

function daysSince(iso: string): number {
  return Math.floor(
    (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function topMistakeSlugs(history: AyahRecitationRecord[], limit = 3): string[] {
  const counts = new Map<string, number>();
  for (const r of history) {
    for (const m of r.mistakes) {
      counts.set(m, (counts.get(m) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([slug]) => slug);
}

export function assignMasteryMapState(
  ayahHistory: AyahRecitationRecord[],
  config: ActiveConfig | null,
): {
  state: MasteryMapState;
  score: number;
  lastRecitedAt: string | null;
  topMistakes: string[];
} {
  if (ayahHistory.length === 0) {
    return {
      state: "not_recited",
      score: 0,
      lastRecitedAt: null,
      topMistakes: [],
    };
  }

  const { memorizedMin, staleDays, weakMistakeCount } = mapConfig(config);
  const score = computeRollingAyahMastery(ayahHistory, config);
  const sorted = [...ayahHistory].sort(
    (a, b) =>
      new Date(b.sessionEndedAt).getTime() -
      new Date(a.sessionEndedAt).getTime(),
  );
  const lastRecitedAt = sorted[0]?.sessionEndedAt ?? null;

  const recentSessions = [
    ...new Set(sorted.map((r) => r.sessionId)),
  ].slice(0, 2);
  const hadIssueInLast2Sessions = sorted
    .filter((r) => recentSessions.includes(r.sessionId))
    .some(
      (r) =>
        r.statusSlug !== "correct" || (r.mistakes?.length ?? 0) > 0,
    );

  const mistakesLast30Days = sorted
    .filter((r) => daysSince(r.sessionEndedAt) <= 30)
    .reduce((sum, r) => sum + (r.mistakes?.length ?? 0), 0);

  let state: MasteryMapState = "memorized";

  if (score < 70 || mistakesLast30Days >= weakMistakeCount) {
    state = "frequently_weak";
  } else if (score < memorizedMin || hadIssueInLast2Sessions) {
    state = "needs_review";
  } else if (
    score >= memorizedMin &&
    lastRecitedAt &&
    daysSince(lastRecitedAt) <= staleDays
  ) {
    state = "memorized";
  } else {
    state = "needs_review";
  }

  return {
    state,
    score,
    lastRecitedAt,
    topMistakes: topMistakeSlugs(ayahHistory),
  };
}

export function computeSurahAggregate(
  ayahCells: Pick<AyahMasteryCell, "state" | "score">[],
): { state: MasteryMapState; score: number } {
  const recited = ayahCells.filter((c) => c.state !== "not_recited");
  if (recited.length === 0) {
    return { state: "not_recited", score: 0 };
  }

  let worstState: MasteryMapState = "memorized";
  let minScore = 100;

  for (const cell of recited) {
    if (STATE_PRIORITY[cell.state] > STATE_PRIORITY[worstState]) {
      worstState = cell.state;
    }
    if (cell.score < minScore) minScore = cell.score;
  }

  return { state: worstState, score: minScore };
}

export function buildMasteryMapFromHistory(
  history: AyahRecitationRecord[],
  config: ActiveConfig | null,
): { surahs: SurahMasteryCell[]; ayahsBySurah: Map<number, AyahMasteryCell[]> } {
  const byAyah = new Map<string, AyahRecitationRecord[]>();
  for (const record of history) {
    const key = `${record.surah}:${record.ayah}`;
    const list = byAyah.get(key) ?? [];
    list.push(record);
    byAyah.set(key, list);
  }

  const ayahsBySurah = new Map<number, AyahMasteryCell[]>();
  const surahIndex = getSurahIndex();

  for (const meta of surahIndex) {
    const ayahCells: AyahMasteryCell[] = [];
    for (let ayah = 1; ayah <= meta.ayahCount; ayah++) {
      const key = `${meta.number}:${ayah}`;
      const ayahHistory = byAyah.get(key) ?? [];
      const result = assignMasteryMapState(ayahHistory, config);
      ayahCells.push({
        ayah,
        state: result.state,
        score: result.score,
        lastRecitedAt: result.lastRecitedAt,
        topMistakes: result.topMistakes,
      });
    }
    ayahsBySurah.set(meta.number, ayahCells);
  }

  const surahs: SurahMasteryCell[] = surahIndex.map((meta) => {
    const ayahCells = ayahsBySurah.get(meta.number) ?? [];
    const recited = ayahCells.filter((c) => c.state !== "not_recited");
    const aggregate = computeSurahAggregate(recited);
    return {
      surah: meta.number,
      state: aggregate.state,
      score: aggregate.score,
    };
  });

  return { surahs, ayahsBySurah };
}
