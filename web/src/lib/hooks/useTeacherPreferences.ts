"use client";

import { useCallback, useEffect, useState } from "react";
import type { QuranDisplayMode } from "@/lib/mushaf/types";

const STORAGE_KEY = "qt:quran_display_mode";

export function useTeacherPreferences() {
  const [mode, setModeState] = useState<QuranDisplayMode>("structured");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached === "mushaf" || cached === "structured") {
      setModeState(cached);
    }

    fetch("/api/users/me/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const serverMode = data?.preferences?.quran_display_mode;
        if (serverMode === "mushaf" || serverMode === "structured") {
          setModeState(serverMode);
          localStorage.setItem(STORAGE_KEY, serverMode);
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const setMode = useCallback(async (next: QuranDisplayMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    await fetch("/api/users/me/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quran_display_mode: next }),
    });
  }, []);

  return { mode, setMode, loaded };
}
