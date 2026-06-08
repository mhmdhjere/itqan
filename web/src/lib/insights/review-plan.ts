import type { ActiveConfig } from "@/lib/config/types";
import { computeReviewUrgency } from "@/lib/review/urgency";

export type ReviewPlanPassageInput = {
  surah: number;
  startAyah: number;
  endAyah: number;
  mistakeFrequency: number;
  masteryScore: number;
  daysSinceLastReview: number;
  weakAyahRankBonus?: number;
  trendBonus?: number;
};

export type ReviewPlanItem = ReviewPlanPassageInput & {
  priority: number;
  estimatedMinutes: number;
  reasons: string[];
};

export function computeReviewPlanPriority(
  passage: ReviewPlanPassageInput,
  config: ActiveConfig | null,
): number {
  const base = computeReviewUrgency(passage, config);
  const weakBonus =
    (config?.config.review.weak_ayat_rank_bonus as number | undefined) ?? 0.5;
  const trendWeight =
    (config?.config.review.trend_bonus_weight as number | undefined) ?? 1;

  return (
    base +
    (passage.weakAyahRankBonus ?? 0) * weakBonus +
    (passage.trendBonus ?? 0) * trendWeight
  );
}

export function estimateSessionMinutes(
  verseCount: number,
  avgSecondsPerVerse: number,
): number {
  if (verseCount <= 0) return 0;
  return Math.max(1, Math.round((verseCount * avgSecondsPerVerse) / 60));
}

export function buildReviewPlanItems(
  passages: ReviewPlanPassageInput[],
  config: ActiveConfig | null,
  avgSecondsPerVerse: number,
  dailyLimit = 5,
): ReviewPlanItem[] {
  return passages
    .map((p) => {
      const verseCount = p.endAyah - p.startAyah + 1;
      const priority = Math.round(computeReviewPlanPriority(p, config) * 10) / 10;
      const reasons: string[] = [];
      if (p.mistakeFrequency >= 3) reasons.push(`${p.mistakeFrequency} mistakes`);
      if (p.masteryScore < 70) reasons.push(`Low mastery (${p.masteryScore}%)`);
      if (p.daysSinceLastReview >= 30) {
        reasons.push(`Not reviewed in ${p.daysSinceLastReview} days`);
      }
      if ((p.weakAyahRankBonus ?? 0) > 0) reasons.push("Recurring weak ayah");

      return {
        ...p,
        priority,
        estimatedMinutes: estimateSessionMinutes(verseCount, avgSecondsPerVerse),
        reasons,
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, dailyLimit);
}
