import ayahToPageData from "@/data/ayah-to-page.json";
import type { SurahRange } from "@/lib/session-ranges";

const ayahToPage = ayahToPageData as Record<string, number>;

export function pageForAyah(surah: number, ayah: number): number | null {
  return ayahToPage[`${surah}:${ayah}`] ?? null;
}

export function isAyahInRanges(
  surah: number,
  ayah: number,
  ranges: SurahRange[],
): boolean {
  return ranges.some(
    (r) => r.surah === surah && ayah >= r.startAyah && ayah <= r.endAyah,
  );
}

export function pagesForRanges(ranges: SurahRange[]): {
  min: number;
  max: number;
  pages: number[];
  startPage: number;
} {
  const pageSet = new Set<number>();

  for (const range of ranges) {
    for (let ayah = range.startAyah; ayah <= range.endAyah; ayah++) {
      const page = pageForAyah(range.surah, ayah);
      if (page) pageSet.add(page);
    }
  }

  const pages = [...pageSet].sort((a, b) => a - b);
  const firstRange = ranges[0];
  const startPage =
    firstRange != null
      ? (pageForAyah(firstRange.surah, firstRange.startAyah) ?? pages[0] ?? 1)
      : (pages[0] ?? 1);

  return {
    min: pages[0] ?? 1,
    max: pages[pages.length - 1] ?? 1,
    pages,
    startPage,
  };
}
