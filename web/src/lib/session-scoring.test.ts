import { describe, expect, it } from "vitest";
import { newRange } from "./session-ranges";
import { computeSessionSummary } from "./session-scoring";
import type { VerseMark } from "./types";

const mockConfig = {
  verseStatuses: [
    { slug: "correct", scorePoints: 100, labelEn: "Correct", labelAr: null, color: "#0f0", sortOrder: 0, isDefaultImplicit: true },
    { slug: "second_attempt", scorePoints: 70, labelEn: "2nd", labelAr: null, color: "#ff0", sortOrder: 1, isDefaultImplicit: false },
    { slug: "third_attempt", scorePoints: 60, labelEn: "3rd", labelAr: null, color: "#f80", sortOrder: 2, isDefaultImplicit: false },
  ],
  mistakeCategories: [],
  mistakeSubcategories: [
    { slug: "mem_hifz", categorySlug: "memorization", labelEn: "Hifz", labelAr: null, sortOrder: 0 },
  ],
  config: {
    mastery: { mistake_penalty: 5 },
    review: {},
    live: {},
    display: {},
    system: {},
    features: {},
  },
  cachedAt: new Date().toISOString(),
};

describe("computeSessionSummary", () => {
  it("counts implicit correct verses and marked exceptions", () => {
    const ranges = [newRange(1, 1, 3)];
    const marks: Record<string, VerseMark> = {
      "1:2": {
        surah: 1,
        ayah: 2,
        status: "second_attempt",
        mistakes: [],
      },
    };

    const summary = computeSessionSummary(ranges, marks, mockConfig);

    expect(summary.versesRecited).toBe(3);
    expect(summary.exceptionCount).toBe(1);
    expect(summary.secondAttemptCount).toBe(1);
    expect(summary.masteryScore).toBe(90);
  });

  it("applies mistake penalty to verse score", () => {
    const ranges = [newRange(1, 1, 1)];
    const marks: Record<string, VerseMark> = {
      "1:1": {
        surah: 1,
        ayah: 1,
        status: "third_attempt",
        mistakes: ["mem_hifz"],
      },
    };

    const summary = computeSessionSummary(ranges, marks, mockConfig);

    expect(summary.masteryScore).toBe(55);
    expect(summary.mistakeBreakdown).toEqual([
      { category: "memorization", count: 1 },
    ]);
  });
});
