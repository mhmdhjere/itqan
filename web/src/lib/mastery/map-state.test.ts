import { describe, expect, it } from "vitest";
import type { ActiveConfig } from "@/lib/config/types";
import type { AyahRecitationRecord } from "@/lib/mastery/scoring";
import {
  assignMasteryMapState,
  computeSurahAggregate,
} from "./map-state";

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
      slug: "third_attempt",
      labelEn: "Third",
      labelAr: null,
      scorePoints: 60,
      color: "#ef4444",
      sortOrder: 1,
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
  ],
  config: {
    mastery: {
      mistake_penalty: 5,
      rolling_window_sessions: 3,
      "map.memorized_min_score": 90,
      "map.stale_days": 90,
      "map.weak_mistake_count": 3,
    },
    review: {},
    live: {},
    display: {},
    system: {},
    features: {},
  },
  cachedAt: new Date().toISOString(),
};

function rec(
  sessionId: string,
  endedAt: string,
  statusSlug: string,
  mistakes: string[] = [],
): AyahRecitationRecord {
  return {
    sessionId,
    sessionEndedAt: endedAt,
    surah: 1,
    ayah: 1,
    statusSlug,
    mistakes,
  };
}

describe("assignMasteryMapState", () => {
  it("returns not_recited when no history", () => {
    const result = assignMasteryMapState([], config);
    expect(result.state).toBe("not_recited");
    expect(result.score).toBe(0);
  });

  it("returns memorized for strong recent recitation", () => {
    const result = assignMasteryMapState(
      [rec("s1", new Date().toISOString(), "correct")],
      config,
    );
    expect(result.state).toBe("memorized");
    expect(result.score).toBe(100);
  });

  it("returns frequently_weak for low score", () => {
    const result = assignMasteryMapState(
      [
        rec("s1", new Date().toISOString(), "third_attempt"),
        rec("s2", new Date().toISOString(), "third_attempt"),
      ],
      config,
    );
    expect(result.state).toBe("frequently_weak");
  });

  it("returns frequently_weak when many mistakes in 30 days", () => {
    const recent = new Date().toISOString();
    const result = assignMasteryMapState(
      [
        rec("s1", recent, "correct", ["madd", "madd", "madd"]),
      ],
      config,
    );
    expect(result.state).toBe("frequently_weak");
  });
});

describe("computeSurahAggregate", () => {
  it("uses worst-ayah-wins for surah state", () => {
    const result = computeSurahAggregate([
      { state: "memorized", score: 95 },
      { state: "frequently_weak", score: 55 },
      { state: "memorized", score: 98 },
    ]);
    expect(result.state).toBe("frequently_weak");
    expect(result.score).toBe(55);
  });

  it("returns not_recited when no ayahs recited", () => {
    expect(computeSurahAggregate([])).toEqual({
      state: "not_recited",
      score: 0,
    });
  });
});
