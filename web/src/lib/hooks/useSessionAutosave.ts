"use client";

import { useEffect, useRef } from "react";
import {
  enqueueVerseUpdates,
  flushOfflineQueue,
} from "@/lib/offline/session-queue";
import type { VerseMark } from "@/lib/types";
import { useOnlineStatus } from "./useOnlineStatus";

function marksToPayload(marks: Record<string, VerseMark>) {
  return Object.values(marks).map((m) => ({
    surah: m.surah,
    ayah: m.ayah,
    statusSlug: m.status,
    mistakes: m.mistakes ?? [],
    note: m.note ?? null,
  }));
}

export function useSessionAutosave(
  sessionId: string | null,
  marks: Record<string, VerseMark>,
  enabled = true,
  debounceMs = 2000,
) {
  const online = useOnlineStatus();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const marksRef = useRef(marks);
  marksRef.current = marks;

  const persist = async (serialized: string) => {
    if (!sessionId) return false;
    const payload = marksToPayload(marksRef.current);
    if (payload.length === 0) return true;

    if (!navigator.onLine) {
      enqueueVerseUpdates(sessionId, payload);
      lastSavedRef.current = serialized;
      return true;
    }

    try {
      const res = await fetch(`/api/sessions/${sessionId}/verses`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verses: payload }),
      });
      if (res.ok) {
        lastSavedRef.current = serialized;
        return true;
      }
      enqueueVerseUpdates(sessionId, payload);
      return false;
    } catch {
      enqueueVerseUpdates(sessionId, payload);
      return false;
    }
  };

  useEffect(() => {
    if (!sessionId || !enabled) return;

    const serialized = JSON.stringify(marks);
    if (serialized === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      void persist(serialized);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionId, marks, enabled, debounceMs]);

  useEffect(() => {
    if (!sessionId || !online) return;
    void flushOfflineQueue(sessionId).then((ok) => {
      if (ok) {
        const serialized = JSON.stringify(marksRef.current);
        if (serialized !== lastSavedRef.current) {
          void persist(serialized);
        }
      }
    });
  }, [sessionId, online]);

  const flush = async () => {
    if (!sessionId) return;
    if (online) {
      await flushOfflineQueue(sessionId);
    }
    await persist(JSON.stringify(marksRef.current));
  };

  return { flush, online };
}
