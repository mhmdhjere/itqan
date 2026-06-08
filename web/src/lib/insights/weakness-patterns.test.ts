import { describe, expect, it } from "vitest";
import type { ActiveConfig } from "@/lib/config/types";
import { aggregateWeaknessPatterns } from "./weakness-patterns";

const config: ActiveConfig = {
  verseStatuses: [],
  mistakeCategories: [
    { slug: "memorization", labelEn: "Memorization", labelAr: null, sortOrder: 0 },
    { slug: "tajweed", labelEn: "Tajweed", labelAr: null, sortOrder: 1 },
    { slug: "behavior", labelEn: "Behavior", labelAr: null, sortOrder: 2 },
  ],
  mistakeSubcategories: [
    {
      slug: "similar_verse_confusion",
      categorySlug: "memorization",
      labelEn: "Similar Verse Confusion",
      labelAr: null,
      sortOrder: 0,
    },
    { slug: "madd", categorySlug: "tajweed", labelEn: "Madd", labelAr: null, sortOrder: 0 },
    { slug: "hesitation", categorySlug: "behavior", labelEn: "Hesitation", labelAr: null, sortOrder: 0 },
  ],
  config: {
    mastery: {},
    review: {},
    live: {},
    display: {},
    system: {},
    features: {},
  },
  cachedAt: new Date().toISOString(),
};

describe("aggregateWeaknessPatterns", () => {
  it("computes category percentages", () => {
    const now = new Date();
    const records = [
      { mistakes: ["similar_verse_confusion"], recordedAt: now.toISOString() },
      { mistakes: ["similar_verse_confusion"], recordedAt: now.toISOString() },
      { mistakes: ["madd"], recordedAt: now.toISOString() },
      { mistakes: ["hesitation"], recordedAt: now.toISOString() },
    ];

    const result = aggregateWeaknessPatterns(records, config, 90);
    const totalPct = result.categories.reduce((s, c) => s + c.percent, 0);
    expect(totalPct).toBe(100);
    expect(result.categories[0].topSubcategory?.slug).toBe(
      "similar_verse_confusion",
    );
  });
});
