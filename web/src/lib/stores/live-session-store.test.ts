import { beforeEach, describe, expect, it } from "vitest";
import { useLiveSessionStore } from "./live-session-store";

describe("live-session-store", () => {
  beforeEach(() => {
    useLiveSessionStore.getState().reset();
  });

  it("applies mark and undo restores previous state", () => {
    const store = useLiveSessionStore.getState();
    store.init("session-1", {}, 10);

    store.applyMark(1, 1, "second_attempt");
    expect(useLiveSessionStore.getState().marks["1:1"]?.status).toBe(
      "second_attempt",
    );

    store.applyMark(1, 1, "third_attempt");
    expect(useLiveSessionStore.getState().marks["1:1"]?.status).toBe(
      "third_attempt",
    );

    store.undo();
    expect(useLiveSessionStore.getState().marks["1:1"]?.status).toBe(
      "second_attempt",
    );

    store.undo();
    expect(useLiveSessionStore.getState().marks["1:1"]).toBeUndefined();
  });

  it("respects undo depth limit", () => {
    const store = useLiveSessionStore.getState();
    store.init("session-1", {}, 2);

    store.applyMark(1, 1, "second_attempt");
    store.applyMark(1, 2, "second_attempt");
    store.applyMark(1, 3, "second_attempt");

    expect(useLiveSessionStore.getState().undoStack).toHaveLength(2);

    store.undo();
    expect(useLiveSessionStore.getState().marks["1:3"]).toBeUndefined();
    store.undo();
    expect(useLiveSessionStore.getState().marks["1:2"]).toBeUndefined();
    store.undo();
    expect(useLiveSessionStore.getState().marks["1:1"]?.status).toBe(
      "second_attempt",
    );
  });

  it("saveDetail persists mistakes and note", () => {
    const store = useLiveSessionStore.getState();
    store.init("session-1");
    store.applyMark(2, 5, "third_attempt", false);

    store.saveDetail("2:5", ["tajweed_madd"], "Watch elongation");
    const mark = useLiveSessionStore.getState().marks["2:5"];
    expect(mark?.mistakes).toEqual(["tajweed_madd"]);
    expect(mark?.note).toBe("Watch elongation");
  });
});
