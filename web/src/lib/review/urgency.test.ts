import { describe, expect, it } from "vitest";
import { computeReviewUrgency, rankReviewPassages } from "./urgency";

const config = {
  verseStatuses: [],
  mistakeCategories: [],
  mistakeSubcategories: [],
  config: {
    mastery: {},
    review: {
      urgency_mistake_weight: 3,
      urgency_mastery_weight: 2,
      stale_day_divisor: 30,
      max_recommendations: 2,
    },
    live: {},
    display: {},
    system: {},
    features: {},
  },
  cachedAt: new Date().toISOString(),
};

describe("computeReviewUrgency", () => {
  it("matches §12 formula", () => {
    const urgency = computeReviewUrgency(
      {
        surah: 20,
        startAyah: 1,
        endAyah: 10,
        mistakeFrequency: 2,
        masteryScore: 80,
        daysSinceLastReview: 15,
      },
      config,
    );
    expect(urgency).toBeCloseTo(2 * 3 + (1 - 0.8) * 2 + 15 / 30, 5);
  });
});

describe("rankReviewPassages", () => {
  it("returns top K passages by urgency", () => {
    const ranked = rankReviewPassages(
      [
        {
          surah: 1,
          startAyah: 1,
          endAyah: 3,
          mistakeFrequency: 1,
          masteryScore: 90,
          daysSinceLastReview: 5,
        },
        {
          surah: 2,
          startAyah: 1,
          endAyah: 5,
          mistakeFrequency: 4,
          masteryScore: 50,
          daysSinceLastReview: 60,
        },
      ],
      config,
    );
    expect(ranked).toHaveLength(2);
    expect(ranked[0].surah).toBe(2);
  });
});
