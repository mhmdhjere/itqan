import { describe, expect, it } from "vitest";
import { clusterWeakAyahsIntoRanges } from "./cluster-ranges";

const tahaCount = 135;

describe("clusterWeakAyahsIntoRanges", () => {
  it("merges Taha 64 and 109 into one padded range", () => {
    const ranges = clusterWeakAyahsIntoRanges(
      [
        { surah: 20, ayah: 64 },
        { surah: 20, ayah: 109 },
      ],
      () => tahaCount,
      { rangePadding: 5, clusterGap: 50 },
    );
    expect(ranges).toHaveLength(1);
    expect(ranges[0]).toEqual({ surah: 20, startAyah: 59, endAyah: 114 });
  });

  it("splits far-apart ayahs when cluster gap is small", () => {
    const ranges = clusterWeakAyahsIntoRanges(
      [
        { surah: 20, ayah: 10 },
        { surah: 20, ayah: 100 },
      ],
      () => tahaCount,
      { rangePadding: 3, clusterGap: 15 },
    );
    expect(ranges.length).toBeGreaterThanOrEqual(2);
  });
});
