import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActiveConfig } from "./types";
import {
  getActiveConfig,
  invalidateActiveConfigCache,
  setActiveConfigCacheTtl,
} from "./service";

const mockConfig: ActiveConfig = {
  verseStatuses: [
    {
      slug: "correct",
      labelEn: "Correct",
      labelAr: "صحيح",
      scorePoints: 100,
      color: "#0d5c4b",
      sortOrder: 0,
      isDefaultImplicit: true,
    },
  ],
  mistakeCategories: [],
  mistakeSubcategories: [],
  config: {
    mastery: { mistake_penalty: 5 },
    review: {},
    live: { tap_mode: "attempt_cycle" },
    display: { quran_font_size: 28 },
    system: {},
    features: { mastery_map: true },
  },
  cachedAt: new Date().toISOString(),
};

const mockLoader = vi.fn(async () => mockConfig);

describe("getActiveConfig cache", () => {
  beforeEach(() => {
    invalidateActiveConfigCache();
    setActiveConfigCacheTtl(60_000);
    mockLoader.mockClear();
  });

  it("returns typed config from loader", async () => {
    const config = await getActiveConfig(mockLoader);
    expect(config.verseStatuses[0].slug).toBe("correct");
    expect(config.config.mastery.mistake_penalty).toBe(5);
    expect(config.config.live.tap_mode).toBe("attempt_cycle");
  });

  it("serves cached config on second call", async () => {
    await getActiveConfig(mockLoader);
    await getActiveConfig(mockLoader);
    expect(mockLoader).toHaveBeenCalledTimes(1);
  });

  it("reloads after invalidate", async () => {
    await getActiveConfig(mockLoader);
    invalidateActiveConfigCache();
    await getActiveConfig(mockLoader);
    expect(mockLoader).toHaveBeenCalledTimes(2);
  });
});
