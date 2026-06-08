export type WeakAyahPoint = { surah: number; ayah: number };

export type PassageRange = {
  surah: number;
  startAyah: number;
  endAyah: number;
};

export function clusterWeakAyahsIntoRanges(
  weakAyahs: WeakAyahPoint[],
  getAyahCount: (surah: number) => number,
  options: {
    rangePadding?: number;
    clusterGap?: number;
    maxAyahs?: number;
  } = {},
): PassageRange[] {
  const padding = options.rangePadding ?? 5;
  const clusterGap = options.clusterGap ?? 15;
  const maxAyahs = options.maxAyahs ?? 10;

  if (weakAyahs.length === 0) return [];

  const bySurah = new Map<number, number[]>();
  for (const { surah, ayah } of weakAyahs) {
    const list = bySurah.get(surah) ?? [];
    list.push(ayah);
    bySurah.set(surah, list);
  }

  const ranges: PassageRange[] = [];

  for (const [surah, ayahs] of bySurah) {
    const sorted = [...new Set(ayahs)].sort((a, b) => a - b);
    const count = getAyahCount(surah);
    const clusters: number[][] = [];
    let current: number[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] <= clusterGap) {
        current.push(sorted[i]);
      } else {
        clusters.push(current);
        current = [sorted[i]];
      }
    }
    clusters.push(current);

    for (const cluster of clusters.slice(0, maxAyahs)) {
      const minAyah = Math.max(1, Math.min(...cluster) - padding);
      const maxAyah = Math.min(count, Math.max(...cluster) + padding);
      ranges.push({ surah, startAyah: minAyah, endAyah: maxAyah });
    }
  }

  return ranges.sort((a, b) => a.surah - b.surah || a.startAyah - b.startAyah);
}
