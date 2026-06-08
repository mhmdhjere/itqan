import { describe, expect, it } from "vitest";
import {
  aggregateMistakeBreakdown,
  computeRollingAyahMastery,
  computeSessionMastery,
  computeStudentMasteryPercent,
  computeSurahMasteryScores,
  computeVerseScore,
  strongestWeakestSurah,
  type AyahRecitationRecord,
} from "./scoring";
import type { ActiveConfig } from "@/lib/config/types";

const config: ActiveConfig = {
  verseStatuses: [
    {
      slug: "correct",
      labelEn: "Correct",
      labelAr: null,
      scorePoints: 100,
      color: "#0d5c4b",
      sortOrder: 0,
      isDefaultImplicit: true,
    },
    {
      slug: "reminder_required",
      labelEn: "Reminder",
      labelAr: null,
      scorePoints: 85,
      color: "#f59e0b",
      sortOrder: 1,
      isDefaultImplicit: false,
    },
    {
      slug: "second_attempt",
      labelEn: "Second Attempt",
      labelAr: null,
      scorePoints: 70,
      color: "#f97316",
      sortOrder: 2,
      isDefaultImplicit: false,
    },
    {
      slug: "third_attempt",
      labelEn: "Third Attempt",
      labelAr: null,
      scorePoints: 60,
      color: "#ef4444",
      sortOrder: 3,
      isDefaultImplicit: false,
    },
    {
      slug: "prompting_required",
      labelEn: "Prompting",
      labelAr: null,
      scorePoints: 50,
      color: "#dc2626",
      sortOrder: 4,
      isDefaultImplicit: false,
    },
    {
      slug: "incomplete",
      labelEn: "Incomplete",
      labelAr: null,
      scorePoints: 0,
      color: "#9f1239",
      sortOrder: 5,
      isDefaultImplicit: false,
    },
  ],
  mistakeCategories: [],
  mistakeSubcategories: [
    {
      slug: "madd",
      categorySlug: "tajweed",
      labelEn: "Madd",
      labelAr: null,
      sortOrder: 0,
    },
    {
      slug: "forgotten_word",
      categorySlug: "memorization",
      labelEn: "Forgotten word",
      labelAr: null,
      sortOrder: 0,
    },
  ],
  config: {
    mastery: { mistake_penalty: 5, rolling_window_sessions: 3 },
    review: {},
    live: {},
    display: {},
    system: {},
    features: {},
  },
  cachedAt: new Date().toISOString(),
};

describe("computeVerseScore", () => {
  it("matches §6 status point table", () => {
    expect(computeVerseScore("correct", [], config)).toBe(100);
    expect(computeVerseScore("reminder_required", [], config)).toBe(85);
    expect(computeVerseScore("second_attempt", [], config)).toBe(70);
    expect(computeVerseScore("third_attempt", [], config)).toBe(60);
    expect(computeVerseScore("prompting_required", [], config)).toBe(50);
    expect(computeVerseScore("incomplete", [], config)).toBe(0);
  });

  it("deducts 5 points per mistake tag", () => {
    expect(computeVerseScore("third_attempt", ["madd"], config)).toBe(55);
    expect(computeVerseScore("third_attempt", ["madd", "forgotten_word"], config)).toBe(50);
  });

  it("floors at zero", () => {
    expect(computeVerseScore("incomplete", ["madd", "forgotten_word"], config)).toBe(0);
  });
});

describe("computeSessionMastery", () => {
  it("averages verse scores in a session", () => {
    const mastery = computeSessionMastery(
      [
        { statusSlug: "correct", mistakes: [] },
        { statusSlug: "second_attempt", mistakes: [] },
        { statusSlug: "third_attempt", mistakes: ["madd"] },
      ],
      config,
    );
    expect(mastery).toBe(Math.round((100 + 70 + 55) / 3));
  });
});

describe("computeRollingAyahMastery", () => {
  const base = (i: number): AyahRecitationRecord => ({
    sessionId: `s${i}`,
    sessionEndedAt: new Date(2026, 0, i + 1).toISOString(),
    surah: 1,
    ayah: 1,
    statusSlug: i === 3 ? "correct" : "third_attempt",
    mistakes: [],
  });

  it("weights recent sessions more heavily", () => {
    const history = [base(1), base(2), base(3)];
    const score = computeRollingAyahMastery(history, config);
    expect(score).toBeGreaterThan(60);
    expect(score).toBeLessThan(100);
  });

  it("uses only the rolling window", () => {
    const history = [
      { ...base(1), statusSlug: "incomplete" },
      { ...base(2), statusSlug: "incomplete" },
      { ...base(3), statusSlug: "incomplete" },
      { ...base(4), statusSlug: "correct" },
    ];
    const score = computeRollingAyahMastery(history, config);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });
});

describe("computeStudentMasteryPercent", () => {
  it("averages rolling scores across ayahs", () => {
    const history: AyahRecitationRecord[] = [
      {
        sessionId: "s1",
        sessionEndedAt: "2026-01-01",
        surah: 1,
        ayah: 1,
        statusSlug: "correct",
        mistakes: [],
      },
      {
        sessionId: "s1",
        sessionEndedAt: "2026-01-01",
        surah: 1,
        ayah: 2,
        statusSlug: "second_attempt",
        mistakes: [],
      },
    ];
    expect(computeStudentMasteryPercent(history, config)).toBe(85);
  });
});

describe("aggregateMistakeBreakdown", () => {
  it("counts mistakes by category", () => {
    const breakdown = aggregateMistakeBreakdown(
      [
        { mistakes: ["madd", "forgotten_word"] },
        { mistakes: ["madd"] },
      ],
      config,
    );
    expect(breakdown).toEqual([
      { category: "tajweed", count: 2 },
      { category: "memorization", count: 1 },
    ]);
  });
});

describe("computeSurahMasteryScores", () => {
  it("ranks surahs by average ayah mastery", () => {
    const history: AyahRecitationRecord[] = [
      {
        sessionId: "s1",
        sessionEndedAt: "2026-01-01",
        surah: 1,
        ayah: 1,
        statusSlug: "correct",
        mistakes: [],
      },
      {
        sessionId: "s1",
        sessionEndedAt: "2026-01-01",
        surah: 2,
        ayah: 1,
        statusSlug: "third_attempt",
        mistakes: [],
      },
    ];
    const scores = computeSurahMasteryScores(history, config);
    const { strongest, weakest } = strongestWeakestSurah(scores);
    expect(strongest?.surah).toBe(1);
    expect(weakest?.surah).toBe(2);
  });
});
