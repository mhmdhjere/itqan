/** Parse mushaf word location e.g. "7:2:3" → surah 7, ayah 2 */
export function parseWordLocation(location: string): {
  surah: number;
  ayah: number;
} | null {
  const [surahPart, ayahPart] = location.split(":");
  const surah = Number(surahPart);
  const ayah = Number(ayahPart);
  if (!surah || !ayah) return null;
  return { surah, ayah };
}
