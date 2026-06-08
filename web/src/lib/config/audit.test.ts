import { describe, expect, it, vi } from "vitest";

const mockReturning = vi.fn();
const mockInsert = vi.fn(() => ({
  values: vi.fn(() => ({
    returning: mockReturning,
  })),
}));

vi.mock("@/db", () => ({
  getDb: vi.fn(() => ({
    insert: mockInsert,
  })),
}));

import { writeConfigAuditLog } from "./audit";

describe("writeConfigAuditLog", () => {
  it("creates a log row with old and new values", async () => {
    const auditRow = {
      id: "audit-1",
      entityType: "app_config",
      field: "mastery.mistake_penalty",
      oldValue: 5,
      newValue: 10,
    };
    mockReturning.mockResolvedValueOnce([auditRow]);

    const result = await writeConfigAuditLog({
      adminUserId: "admin-1",
      entityType: "app_config",
      entityId: "mastery.mistake_penalty",
      field: "mastery.mistake_penalty",
      oldValue: 5,
      newValue: 10,
      changeReason: "Test update",
    });

    expect(mockInsert).toHaveBeenCalled();
    expect(result).toEqual(auditRow);
  });
});
