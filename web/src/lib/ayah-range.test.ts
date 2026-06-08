import { describe, expect, it } from "vitest";
import { clampAyahRange, validateAyahRange } from "./ayah-range";

describe("validateAyahRange", () => {
  it("accepts a valid range", () => {
    const result = validateAyahRange(
      { surah: 1, startAyah: 1, endAyah: 7 },
      7,
    );
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.normalized).toEqual({ surah: 1, startAyah: 1, endAyah: 7 });
    }
  });

  it("rejects end < start", () => {
    const result = validateAyahRange(
      { surah: 2, startAyah: 10, endAyah: 5 },
      286,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("End ayah");
  });

  it("rejects end beyond surah length", () => {
    const result = validateAyahRange(
      { surah: 112, startAyah: 1, endAyah: 10 },
      4,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain("exceeds");
  });
});

describe("clampAyahRange", () => {
  it("clamps end to surah length", () => {
    expect(clampAyahRange({ surah: 1, startAyah: 1, endAyah: 99 }, 7)).toEqual({
      surah: 1,
      startAyah: 1,
      endAyah: 7,
    });
  });

  it("fixes inverted range", () => {
    expect(clampAyahRange({ surah: 1, startAyah: 5, endAyah: 2 }, 7)).toEqual({
      surah: 1,
      startAyah: 5,
      endAyah: 5,
    });
  });
});
