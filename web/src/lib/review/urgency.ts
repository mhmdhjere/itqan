import type { ActiveConfig } from "@/lib/config/types";

export type ReviewPassageInput = {
  surah: number;
  startAyah: number;
  endAyah: number;
  mistakeFrequency: number;
  masteryScore: number;
  daysSinceLastReview: number;
};

export function computeReviewUrgency(
  passage: ReviewPassageInput,
  config: ActiveConfig | null,
): number {
  const mistakeWeight =
    (config?.config.review.urgency_mistake_weight as number | undefined) ?? 3;
  const masteryWeight =
    (config?.config.review.urgency_mastery_weight as number | undefined) ?? 2;
  const staleDivisor =
    (config?.config.review.stale_day_divisor as number | undefined) ?? 30;

  return (
    passage.mistakeFrequency * mistakeWeight +
    (1 - passage.masteryScore / 100) * masteryWeight +
    passage.daysSinceLastReview / staleDivisor
  );
}

export function rankReviewPassages<T extends ReviewPassageInput>(
  passages: T[],
  config: ActiveConfig | null,
  max = 5,
): (T & { urgency: number })[] {
  const limit =
    (config?.config.review.max_recommendations as number | undefined) ?? max;

  return passages
    .map((p) => ({ ...p, urgency: computeReviewUrgency(p, config) }))
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, limit);
}
