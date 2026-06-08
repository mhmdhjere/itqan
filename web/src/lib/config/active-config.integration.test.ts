import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActiveConfig } from "./types";

function buildConfig(mistakePenalty: number): ActiveConfig {
  return {
    verseStatuses: [],
    mistakeCategories: [],
    mistakeSubcategories: [],
    config: {
      mastery: { mistake_penalty: mistakePenalty },
      review: {},
      live: {},
      display: {},
      system: {},
      features: {},
    },
    cachedAt: new Date().toISOString(),
  };
}

describe("admin config → active config integration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("serves updated values after cache invalidation (simulates admin PATCH)", async () => {
    const { getActiveConfig, invalidateActiveConfigCache } = await import(
      "./service"
    );

    let penalty = 5;
    const loader = async () => buildConfig(penalty);

    const first = await getActiveConfig(loader);
    expect(first.config.mastery.mistake_penalty).toBe(5);

    const cached = await getActiveConfig(loader);
    expect(cached.config.mastery.mistake_penalty).toBe(5);

    penalty = 12;
    invalidateActiveConfigCache();

    const refreshed = await getActiveConfig(loader);
    expect(refreshed.config.mastery.mistake_penalty).toBe(12);
  });

  it("patchAdminConfig invalidates cache so next load reflects DB change", async () => {
    const service = await import("./service");
    const admin = await import("./admin");

    vi.spyOn(admin, "patchAdminConfig").mockImplementation(async (updates) => {
      service.invalidateActiveConfigCache();
      return updates;
    });

    let penalty = 5;
    const loader = async () => buildConfig(penalty);

    await service.getActiveConfig(loader);
    penalty = 15;
    await admin.patchAdminConfig(
      [{ key: "mastery.mistake_penalty", value: 15 }],
      "admin-1",
    );

    const afterPatch = await service.getActiveConfig(loader);
    expect(afterPatch.config.mastery.mistake_penalty).toBe(15);
  });
});
