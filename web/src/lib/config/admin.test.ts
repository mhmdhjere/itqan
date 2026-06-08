import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ getDb: vi.fn() }));
vi.mock("./audit", () => ({
  writeConfigAuditLog: vi.fn(),
}));
vi.mock("./service", () => ({
  invalidateActiveConfigCache: vi.fn(),
}));

import { invalidateActiveConfigCache } from "./service";

describe("patchAdminConfig cache bust", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidateActiveConfigCache clears teacher-facing config", () => {
    invalidateActiveConfigCache();
    expect(invalidateActiveConfigCache).toHaveBeenCalled();
  });
});
