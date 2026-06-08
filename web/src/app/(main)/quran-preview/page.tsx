import { getActiveConfig } from "@/lib/config/service";
import { getSurahAyahs, getSurahMeta } from "@/lib/quran";

export default async function QuranPreviewPage() {
  const surah = 1;
  let fontSize = 28;
  let fontFamily = "amiri";

  try {
    const config = await getActiveConfig();
    fontSize = (config.config.display.quran_font_size as number) ?? 28;
    fontFamily = (config.config.display.quran_font as string) ?? "amiri";
  } catch {
    // DB not seeded yet — use defaults
  }

  const meta = getSurahMeta(surah);
  const ayahs = getSurahAyahs(surah);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Quran Preview</h1>
        <p className="mt-1 text-sm text-muted">
          {meta.nameEn} ({meta.nameAr}) — {meta.ayahCount} ayahs
        </p>
      </div>

      <div
        dir="rtl"
        lang="ar"
        className="rounded-xl border border-border bg-quran-bg p-8 font-quran"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily:
            fontFamily === "amiri"
              ? "var(--font-amiri), Traditional Arabic, serif"
              : fontFamily,
        }}
      >
        {ayahs.map((ayah) => (
          <p key={ayah.ayah} className="mb-4">
            <span className="mx-2 text-sm text-muted">﴿{ayah.ayah}﴾</span>
            {ayah.text}
          </p>
        ))}
      </div>
    </div>
  );
}
