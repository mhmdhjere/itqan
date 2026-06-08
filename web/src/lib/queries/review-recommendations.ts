import { getActiveConfig } from "@/lib/config/service";
import { computeRollingAyahMastery } from "@/lib/mastery/scoring";
import { rankReviewPassages } from "@/lib/review/urgency";
import { verseKey } from "@/lib/session-ranges";
import { buildAyahHistory } from "./ayah-history";
import { getStudentMasteryMap } from "./mastery-map";
import { listReviewTargets } from "./plans";
import { getStudentForTeacher } from "./students";

export type ReviewRecommendationDto = {
  surah: number;
  startAyah: number;
  endAyah: number;
  urgency: number;
  masteryScore: number;
  mistakeFrequency: number;
  daysSinceLastReview: number;
  source: "algorithm";
  alreadyPinned: boolean;
};

export async function getReviewRecommendations(
  studentId: string,
  teacherId: string,
): Promise<ReviewRecommendationDto[] | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const [config, map, targets, history] = await Promise.all([
    getActiveConfig(),
    getStudentMasteryMap(studentId, teacherId),
    listReviewTargets(studentId, teacherId),
    buildAyahHistory(studentId),
  ]);

  if (!map) return null;

  const byAyah = new Map<string, typeof history>();
  for (const record of history) {
    const key = verseKey(record.surah, record.ayah);
    const list = byAyah.get(key) ?? [];
    list.push(record);
    byAyah.set(key, list);
  }

  const candidates: ReviewRecommendationDto[] = [];

  for (const [surahStr, ayahCells] of Object.entries(map.ayahs)) {
    const surah = Number(surahStr);
    for (const cell of ayahCells) {
      if (
        cell.state !== "needs_review" &&
        cell.state !== "frequently_weak"
      ) {
        continue;
      }

      const key = verseKey(surah, cell.ayah);
      const ayahHistory = byAyah.get(key) ?? [];
      const masteryScore = computeRollingAyahMastery(ayahHistory, config);
      const mistakeFrequency = ayahHistory.reduce(
        (sum, r) => sum + (r.mistakes?.length ?? 0),
        0,
      );

      const lastRecited = cell.lastRecitedAt
        ? new Date(cell.lastRecitedAt)
        : null;
      const pinnedTarget = targets?.find(
        (t) =>
          t.surah === surah &&
          cell.ayah >= t.startAyah &&
          cell.ayah <= t.endAyah,
      );
      const lastReviewed = pinnedTarget?.lastReviewedAt
        ? new Date(pinnedTarget.lastReviewedAt)
        : lastRecited;
      const daysSinceLastReview = lastReviewed
        ? Math.floor(
            (Date.now() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 999;

      const urgency = rankReviewPassages(
        [
          {
            surah,
            startAyah: cell.ayah,
            endAyah: cell.ayah,
            mistakeFrequency,
            masteryScore,
            daysSinceLastReview,
          },
        ],
        config,
        1,
      )[0]?.urgency ?? 0;

      candidates.push({
        surah,
        startAyah: cell.ayah,
        endAyah: cell.ayah,
        urgency,
        masteryScore,
        mistakeFrequency,
        daysSinceLastReview,
        source: "algorithm",
        alreadyPinned: !!pinnedTarget,
      });
    }
  }

  const ranked = rankReviewPassages(
    candidates.map((c) => ({
      surah: c.surah,
      startAyah: c.startAyah,
      endAyah: c.endAyah,
      mistakeFrequency: c.mistakeFrequency,
      masteryScore: c.masteryScore,
      daysSinceLastReview: c.daysSinceLastReview,
    })),
    config,
  );

  return ranked.map((r) => {
    const match = candidates.find(
      (c) =>
        c.surah === r.surah &&
        c.startAyah === r.startAyah &&
        c.endAyah === r.endAyah,
    )!;
    return { ...match, urgency: r.urgency };
  });
}
