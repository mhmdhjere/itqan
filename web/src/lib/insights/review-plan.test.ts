import { describe, expect, it } from "vitest";
import {
  buildReviewPlanItems,
  computeReviewPlanPriority,
  estimateSessionMinutes,
} from "./review-plan";

describe("review plan", () => {
  it("higher mistake frequency yields higher priority", () => {
    const low = computeReviewPlanPriority(
      {
        surah: 1,
        startAyah: 1,
        endAyah: 7,
        mistakeFrequency: 1,
        masteryScore: 90,
        daysSinceLastReview: 5,
      },
      null,
    );
    const high = computeReviewPlanPriority(
      {
        surah: 1,
        startAyah: 1,
        endAyah: 7,
        mistakeFrequency: 8,
        masteryScore: 90,
        daysSinceLastReview: 5,
      },
      null,
    );
    expect(high).toBeGreaterThan(low);
  });

  it("estimates session minutes from verse count", () => {
    expect(estimateSessionMinutes(24, 30)).toBe(12);
  });

  it("builds sorted plan items", () => {
    const items = buildReviewPlanItems(
      [
        {
          surah: 88,
          startAyah: 1,
          endAyah: 26,
          mistakeFrequency: 2,
          masteryScore: 75,
          daysSinceLastReview: 40,
        },
        {
          surah: 86,
          startAyah: 1,
          endAyah: 17,
          mistakeFrequency: 6,
          masteryScore: 60,
          daysSinceLastReview: 60,
          weakAyahRankBonus: 3,
        },
      ],
      null,
      25,
      5,
    );
    expect(items[0].surah).toBe(86);
    expect(items[0].reasons.length).toBeGreaterThan(0);
  });
});
