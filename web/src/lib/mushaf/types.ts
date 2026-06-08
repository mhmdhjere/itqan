export type MushafWord = {
  location: string;
  word: string;
  qpcV2?: string;
  qpcV1?: string;
};

export type MushafSurahHeaderLine = {
  line: number;
  type: "surah-header";
  text: string;
  surah: string;
};

export type MushafBasmalaLine = {
  line: number;
  type: "basmala";
  qpcV2?: string;
  qpcV1?: string;
};

export type MushafTextLine = {
  line: number;
  type: "text";
  text: string;
  verseRange: string;
  words: MushafWord[];
};

export type MushafLine =
  | MushafSurahHeaderLine
  | MushafBasmalaLine
  | MushafTextLine;

export type MushafPageData = {
  page: number;
  lines: MushafLine[];
};

export type AyahGroup = {
  surah: number;
  ayah: number;
  text: string;
};

export type QuranDisplayMode = "structured" | "mushaf";
