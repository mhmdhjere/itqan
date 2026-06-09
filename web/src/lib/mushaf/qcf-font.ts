/** QCF V2 per-page fonts — same CDN used by quran.com / Quran Foundation */
const QCF_V2_CDN =
  "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2";

const loaded = new Set<number>();

export function qcfV2FontFamily(page: number): string {
  return `qcf-p${page}-v2`;
}

export async function loadQcfV2PageFont(page: number): Promise<string> {
  if (loaded.has(page)) return qcfV2FontFamily(page);

  const family = qcfV2FontFamily(page);
  const face = new FontFace(
    family,
    `url(${QCF_V2_CDN}/p${page}.woff2)`,
    { display: "block" },
  );
  await face.load();
  document.fonts.add(face);
  loaded.add(page);
  return family;
}
