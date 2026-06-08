import { create } from "zustand";
import type { VerseMark, VerseStatusSlug } from "@/lib/types";
import { parseVerseKey, verseKey } from "@/lib/session-ranges";

export type UndoEntry = {
  key: string;
  previous?: VerseMark;
};

type LiveSessionState = {
  sessionId: string | null;
  marks: Record<string, VerseMark>;
  undoStack: UndoEntry[];
  focusedKey: string | null;
  undoDepth: number;
  init: (
    sessionId: string,
    initialMarks?: Record<string, VerseMark>,
    undoDepth?: number,
  ) => void;
  reset: () => void;
  applyMark: (
    surah: number,
    ayah: number,
    status: VerseStatusSlug,
    recordUndo?: boolean,
  ) => void;
  saveDetail: (key: string, mistakes: string[], note: string) => void;
  undo: () => void;
  setFocusedKey: (key: string | null) => void;
  setUndoDepth: (depth: number) => void;
  canUndo: () => boolean;
};

function pushUndo(
  stack: UndoEntry[],
  entry: UndoEntry,
  maxDepth: number,
): UndoEntry[] {
  const next = [...stack, entry];
  if (maxDepth <= 0) return [];
  return next.slice(-maxDepth);
}

export const useLiveSessionStore = create<LiveSessionState>((set, get) => ({
  sessionId: null,
  marks: {},
  undoStack: [],
  focusedKey: null,
  undoDepth: 20,

  init(sessionId, initialMarks = {}, undoDepth = 20) {
    set({
      sessionId,
      marks: { ...initialMarks },
      undoStack: [],
      focusedKey: null,
      undoDepth,
    });
  },

  reset() {
    set({
      sessionId: null,
      marks: {},
      undoStack: [],
      focusedKey: null,
    });
  },

  applyMark(surah, ayah, status, recordUndo = true) {
    const key = verseKey(surah, ayah);
    set((state) => {
      const previous = state.marks[key];
      const nextMark: VerseMark = {
        surah,
        ayah,
        status,
        mistakes: previous?.mistakes ?? [],
        note: previous?.note,
      };
      return {
        marks: { ...state.marks, [key]: nextMark },
        undoStack: recordUndo
          ? pushUndo(state.undoStack, { key, previous }, state.undoDepth)
          : state.undoStack,
      };
    });
  },

  saveDetail(key, mistakes, note) {
    const { surah, ayah } = parseVerseKey(key);
    set((state) => {
      const previous = state.marks[key];
      const nextMark: VerseMark = {
        surah,
        ayah,
        status: previous?.status ?? "third_attempt",
        mistakes,
        note: note.trim() || undefined,
      };
      return {
        marks: { ...state.marks, [key]: nextMark },
        undoStack: pushUndo(
          state.undoStack,
          { key, previous },
          state.undoDepth,
        ),
        focusedKey: null,
      };
    });
  },

  undo() {
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const last = state.undoStack[state.undoStack.length - 1];
      const nextMarks = { ...state.marks };
      if (last.previous) {
        nextMarks[last.key] = last.previous;
      } else {
        delete nextMarks[last.key];
      }
      return {
        marks: nextMarks,
        undoStack: state.undoStack.slice(0, -1),
      };
    });
  },

  setFocusedKey(key) {
    set({ focusedKey: key });
  },

  setUndoDepth(depth) {
    set({ undoDepth: depth });
  },

  canUndo() {
    return get().undoStack.length > 0;
  },
}));
