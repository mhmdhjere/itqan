import { describe, expect, it } from "vitest";
import {
  isAyahInRanges,
  pageForAyah,
  pagesForRanges,
} from "@/lib/mushaf/ayah-page-index";
import { newRange } from "@/lib/session-ranges";

describe("pageForAyah", () => {
  it("maps Al-Fatiha 1 to page 1", () => {
    expect(pageForAyah(1, 1)).toBe(1);
  });

  it("maps Taha 57 to a valid page", () => {
    const page = pageForAyah(20, 57);
    expect(page).toBeGreaterThan(0);
    expect(page).toBeLessThanOrEqual(604);
  });
});

describe("pagesForRanges", () => {
  it("returns contiguous page bounds for a single-surah range", () => {
    const result = pagesForRanges([newRange(20, 57, 60)]);
    expect(result.pages.length).toBeGreaterThan(0);
    expect(result.min).toBeLessThanOrEqual(result.max);
    expect(result.startPage).toBe(pageForAyah(20, 57));
  });
});

describe("isAyahInRanges", () => {
  it("returns true for ayah inside range", () => {
    expect(isAyahInRanges(20, 58, [newRange(20, 57, 60)])).toBe(true);
  });

  it("returns false for ayah outside range", () => {
    expect(isAyahInRanges(20, 55, [newRange(20, 57, 60)])).toBe(false);
  });
});
