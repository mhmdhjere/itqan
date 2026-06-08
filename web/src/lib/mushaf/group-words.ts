import type { AyahGroup, MushafWord } from "@/lib/mushaf/types";

export function parseWordLocation(location: string): {
  surah: number;
  ayah: number;
} {
  const [surah, ayah] = location.split(":").map(Number);
  return { surah, ayah };
}

export function groupWordsByAyah(words: MushafWord[]): AyahGroup[] {
  const groups: { surah: number; ayah: number; parts: string[] }[] = [];

  for (const word of words) {
    const { surah, ayah } = parseWordLocation(word.location);
    const last = groups[groups.length - 1];
    if (last && last.surah === surah && last.ayah === ayah) {
      last.parts.push(word.word);
    } else {
      groups.push({ surah, ayah, parts: [word.word] });
    }
  }

  return groups.map((g) => ({
    surah: g.surah,
    ayah: g.ayah,
    text: g.parts.join(" "),
  }));
}
