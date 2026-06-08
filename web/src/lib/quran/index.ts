import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Ayah, SurahMeta } from "@/lib/types";

type ChapterIndexEntry = {
  id: number;
  name: string;
  transliteration: string;
  total_verses: number;
};

type ChapterFile = ChapterIndexEntry & {
  verses: { id: number; text: string }[];
};

const quranRoot = join(process.cwd(), "node_modules", "quran-json", "dist");

let surahIndexCache: SurahMeta[] | null = null;
const chapterCache = new Map<number, ChapterFile>();

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export function getSurahIndex(): SurahMeta[] {
  if (!surahIndexCache) {
    const index = readJson<ChapterIndexEntry[]>(
      join(quranRoot, "chapters", "index.json"),
    );
    surahIndexCache = index.map((chapter) => ({
      number: chapter.id,
      nameEn: chapter.transliteration,
      nameAr: chapter.name,
      ayahCount: chapter.total_verses,
    }));
  }
  return surahIndexCache;
}

function getChapter(surah: number): ChapterFile {
  let chapter = chapterCache.get(surah);
  if (!chapter) {
    chapter = readJson<ChapterFile>(join(quranRoot, "chapters", `${surah}.json`));
    chapterCache.set(surah, chapter);
  }
  return chapter;
}

export function getSurahAyahs(surah: number): Ayah[] {
  if (surah < 1 || surah > 114) {
    throw new RangeError(`Invalid surah number: ${surah}`);
  }
  const chapter = getChapter(surah);
  return chapter.verses.map((verse) => ({
    surah,
    ayah: verse.id,
    text: verse.text,
  }));
}

export function getSurahMeta(surah: number): SurahMeta {
  const meta = getSurahIndex().find((entry) => entry.number === surah);
  if (!meta) {
    throw new RangeError(`Invalid surah number: ${surah}`);
  }
  return meta;
}
