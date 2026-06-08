"use client";

import { useEffect, useMemo, useState } from "react";
import type { SurahMeta } from "@/lib/types";

export function useSurahIndex() {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quran/surahs")
      .then((res) => (res.ok ? res.json() : { surahs: [] }))
      .then((data) => setSurahs(data.surahs ?? []))
      .finally(() => setLoading(false));
  }, []);

  const byNumber = useMemo(
    () => new Map(surahs.map((s) => [s.number, s])),
    [surahs],
  );

  const getAyahCount = (surah: number) => byNumber.get(surah)?.ayahCount;
  const getSurahName = (surah: number) =>
    byNumber.get(surah)?.nameEn ?? `Surah ${surah}`;

  return { surahs, byNumber, loading, getAyahCount, getSurahName };
}
