import { describe, expect, it } from "vitest";
import {
  computeMushafScale,
  MUSHAF_PAGE_HEIGHT,
  MUSHAF_PAGE_WIDTH,
} from "@/lib/mushaf/page-layout";

describe("computeMushafScale", () => {
  it("returns 1 when container is larger than page", () => {
    expect(computeMushafScale(800, 900)).toBe(1);
  });

  it("scales down when container is smaller than page", () => {
    const scale = computeMushafScale(300, 400);
    expect(scale).toBeLessThan(1);
    expect(scale * MUSHAF_PAGE_WIDTH).toBeLessThanOrEqual(300);
    expect(scale * MUSHAF_PAGE_HEIGHT).toBeLessThanOrEqual(400);
  });

  it("never exceeds 1", () => {
    expect(computeMushafScale(2000, 2000)).toBe(1);
  });

  it("fills viewport on mobile when maxScale is removed", () => {
    const scale = computeMushafScale(600, 1000, {
      padding: 0,
      maxScale: Number.POSITIVE_INFINITY,
    });
    expect(scale).toBeGreaterThan(1);
    expect(scale * MUSHAF_PAGE_WIDTH).toBeCloseTo(600, 0);
  });

  it("uses cover fit to maximize mobile fill", () => {
    const contain = computeMushafScale(390, 680, {
      padding: 0,
      maxScale: Number.POSITIVE_INFINITY,
      fit: "contain",
    });
    const cover = computeMushafScale(390, 680, {
      padding: 0,
      maxScale: Number.POSITIVE_INFINITY,
      fit: "cover",
    });
    expect(cover).toBeGreaterThan(contain);
    expect(cover * MUSHAF_PAGE_HEIGHT).toBeCloseTo(680, 0);
  });
});
