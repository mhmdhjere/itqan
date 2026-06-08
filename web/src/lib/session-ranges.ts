export interface SurahRange {
  id: string;
  surah: number;
  startAyah: number;
  endAyah: number;
}

export function verseKey(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

export function parseVerseKey(key: string): { surah: number; ayah: number } {
  const [surah, ayah] = key.split(":").map(Number);
  return { surah, ayah };
}

export function encodeRanges(ranges: SurahRange[]): string {
  return ranges
    .map((r) => `${r.surah}:${r.startAyah}-${r.endAyah}`)
    .join(",");
}

export function decodeRanges(param: string | null): SurahRange[] {
  if (!param?.trim()) return [];
  return param.split(",").map((part, i) => {
    const [surahPart, ayahPart] = part.split(":");
    const [start, end] = ayahPart.split("-").map(Number);
    return {
      id: `range-${i}`,
      surah: Number(surahPart),
      startAyah: start,
      endAyah: end,
    };
  });
}

export function validateRange(
  range: Pick<SurahRange, "surah" | "startAyah" | "endAyah">,
  ayahCount: number,
): boolean {
  return (
    ayahCount > 0 &&
    range.startAyah >= 1 &&
    range.endAyah >= range.startAyah &&
    range.endAyah <= ayahCount
  );
}

export function countVersesInRanges(
  ranges: SurahRange[],
  getAyahCount: (surah: number) => number | undefined,
): number {
  return ranges.reduce((sum, r) => {
    const ayahCount = getAyahCount(r.surah);
    if (ayahCount === undefined) return sum;
    return validateRange(r, ayahCount)
      ? sum + (r.endAyah - r.startAyah + 1)
      : sum;
  }, 0);
}

export function formatRangesLabel(
  ranges: SurahRange[],
  getSurahName?: (surah: number) => string,
): string {
  return ranges
    .map((r) => {
      const name = getSurahName?.(r.surah) ?? `Surah ${r.surah}`;
      return r.startAyah === r.endAyah
        ? `${name} ${r.startAyah}`
        : `${name} ${r.startAyah}–${r.endAyah}`;
    })
    .join(" · ");
}

export function newRange(
  surah = 20,
  startAyah = 1,
  endAyah = 10,
): SurahRange {
  return {
    id: `range-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    surah,
    startAyah,
    endAyah,
  };
}

export function passagesToRanges(
  passages: {
    surah: number;
    startAyah: number;
    endAyah: number;
    sortOrder?: number;
  }[],
): SurahRange[] {
  return passages.map((p, i) => ({
    id: `range-${p.surah}-${p.startAyah}-${p.sortOrder ?? i}`,
    surah: p.surah,
    startAyah: p.startAyah,
    endAyah: p.endAyah,
  }));
}
