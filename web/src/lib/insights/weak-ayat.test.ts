import { describe, expect, it } from "vitest";
import { aggregateAyahMistakes, eventsForAyah } from "./weak-ayat";

describe("aggregateAyahMistakes", () => {
  const records = [
    {
      surah: 20,
      ayah: 64,
      sessionId: "s1",
      sessionEndedAt: "2026-01-01T00:00:00Z",
      statusSlug: "third_attempt",
      mistakes: ["madd", "hesitation"],
    },
    {
      surah: 20,
      ayah: 64,
      sessionId: "s2",
      sessionEndedAt: "2026-02-01T00:00:00Z",
      statusSlug: "second_attempt",
      mistakes: ["madd"],
    },
    {
      surah: 20,
      ayah: 109,
      sessionId: "s1",
      sessionEndedAt: "2026-01-01T00:00:00Z",
      statusSlug: "third_attempt",
      mistakes: ["similar_verse_confusion"],
    },
  ];

  it("ranks ayat by mistake count", () => {
    const result = aggregateAyahMistakes(records);
    expect(result[0]).toMatchObject({ surah: 20, ayah: 64, mistakeCount: 3 });
    expect(result[1]).toMatchObject({ surah: 20, ayah: 109, mistakeCount: 1 });
  });

  it("marks persistent ayat across sessions", () => {
    const result = aggregateAyahMistakes(records);
    expect(result.find((r) => r.ayah === 64)?.persistent).toBe(true);
    expect(result.find((r) => r.ayah === 109)?.persistent).toBe(false);
  });

  it("returns events for a single ayah", () => {
    const events = eventsForAyah(records, 20, 64);
    expect(events).toHaveLength(2);
    expect(events[0].sessionId).toBe("s2");
  });
});
