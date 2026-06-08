"use client";

import { useEffect, useRef } from "react";
import type { VerseMark } from "@/lib/types";

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const marksRef = useRef(marks);
  marksRef.current = marks;

  useEffect(() => {
    if (!sessionId || !enabled) return;

    const serialized = JSON.stringify(marks);
    if (serialized === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const payload = marksToPayload(marksRef.current);
      if (payload.length === 0) return;

      fetch(`/api/sessions/${sessionId}/verses`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verses: payload }),
      })
        .then((res) => {
          if (res.ok) lastSavedRef.current = serialized;
        })
        .catch(() => {
          /* retry on next change */
        });
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionId, marks, enabled, debounceMs]);

  const flush = async () => {
    if (!sessionId) return;
    const payload = marksToPayload(marksRef.current);
    if (payload.length === 0) return;

    const res = await fetch(`/api/sessions/${sessionId}/verses`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verses: payload }),
    });
    if (res.ok) lastSavedRef.current = JSON.stringify(marksRef.current);
  };

  return { flush };
}
