import { describe, expect, it } from "vitest";
import type { ActiveConfig } from "@/lib/config/types";
import { isSessionMutable } from "./session-immutability";

const configWith48h: ActiveConfig = {
  verseStatuses: [],
  mistakeCategories: [],
  mistakeSubcategories: [],
  config: {
    system: { session_immutability_hours: 48 },
  },
} as ActiveConfig;

describe("isSessionMutable", () => {
  it("returns false for ended sessions", () => {
    expect(isSessionMutable(new Date(), new Date(), null)).toBe(false);
  });

  it("returns true for a recently started open session", () => {
    expect(isSessionMutable(new Date(), null, null)).toBe(true);
  });

  it("returns false when open session exceeds immutability window", () => {
    const started = new Date(Date.now() - 50 * 60 * 60 * 1000);
    expect(isSessionMutable(started, null, configWith48h)).toBe(false);
  });
});
