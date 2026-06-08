"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActiveConfig } from "@/lib/config/types";
import {
  formatRangesLabel,
  type SurahRange,
  verseKey,
} from "@/lib/session-ranges";
import type { Ayah, SurahMeta, VerseMark, VerseStatusSlug } from "@/lib/types";
import { cn, getStatusBorderColor } from "@/lib/utils";

type SurahData = {
  meta: SurahMeta;
  ayahs: Ayah[];
};

function getStatusLabel(
  status: VerseStatusSlug,
  config: ActiveConfig | null,
): string {
  return (
    config?.verseStatuses.find((s) => s.slug === status)?.labelEn ??
    status.replace(/_/g, " ")
  );
}

function getDisplayStyle(config: ActiveConfig | null): React.CSSProperties {
  const fontSize =
    (config?.config.display.quran_font_size as number | undefined) ?? 28;
  const fontFamily =
    (config?.config.display.quran_font as string | undefined) ?? "amiri";

  return {
    fontSize: `${Math.round(fontSize * 0.75)}px`,
    fontFamily:
      fontFamily === "amiri"
        ? "var(--font-amiri), Traditional Arabic, serif"
        : fontFamily,
  };
}

export function QuranCanvas({
  ranges,
  marks,
  activeConfig,
  onAyahClick,
}: {
  ranges: SurahRange[];
  marks: Record<string, VerseMark>;
  activeConfig: ActiveConfig | null;
  onAyahClick: (surah: number, ayah: number) => void;
}) {
  const [surahData, setSurahData] = useState<Map<number, SurahData>>(new Map());
  const [loading, setLoading] = useState(true);

  const uniqueSurahs = useMemo(
    () => [...new Set(ranges.map((r) => r.surah))],
    [ranges],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all(
      uniqueSurahs.map((surah) =>
        fetch(`/api/quran/${surah}`).then((res) => res.json()),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        const map = new Map<number, SurahData>();
        results.forEach((data) => {
          if (data?.surah && data?.ayahs) {
            map.set(data.surah.number, {
              meta: data.surah,
              ayahs: data.ayahs,
            });
          }
        });
        setSurahData(map);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uniqueSurahs]);

  const displayStyle = getDisplayStyle(activeConfig);

  if (loading) {
    return <p className="py-8 text-center text-sm text-muted">Loading Quran…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {ranges.map((range) => {
        const data = surahData.get(range.surah);
        const ayahs =
          data?.ayahs.filter(
            (a) => a.ayah >= range.startAyah && a.ayah <= range.endAyah,
          ) ?? [];

        return (
          <section key={range.id}>
            <div className="sticky top-0 z-10 mb-2 rounded-lg bg-accent-light/80 px-3 py-2 backdrop-blur-sm">
              <p className="text-sm font-semibold text-accent">
                {data?.meta.nameEn ?? `Surah ${range.surah}`}
              </p>
              <p className="text-xs text-muted">
                Ayah {range.startAyah}–{range.endAyah}
              </p>
            </div>
            <div className="space-y-1">
              {ayahs.map(({ surah, ayah, text }) => {
                const key = verseKey(surah, ayah);
                const mark = marks[key];
                const status = mark?.status;
                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "w-full rounded-lg border-l-4 px-4 py-3 text-right transition-colors",
                      status
                        ? getStatusBorderColor(status)
                        : "border-l-transparent",
                      "hover:bg-stone-50/80 active:bg-stone-100/80",
                    )}
                    dir="rtl"
                    style={displayStyle}
                    onClick={() => onAyahClick(surah, ayah)}
                    aria-label={`${data?.meta.nameEn ?? `Surah ${surah}`} ayah ${ayah}${status ? `, ${getStatusLabel(status, activeConfig)}` : ""}`}
                  >
                    <span
                      className="float-left flex items-center gap-2 font-sans text-xs font-medium text-muted"
                      dir="ltr"
                      style={{ fontSize: "0.75rem" }}
                    >
                      <span>{ayah}</span>
                      {status && status !== "correct" && (
                        <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700">
                          {getStatusLabel(status, activeConfig)}
                        </span>
                      )}
                    </span>
                    <span className="font-quran leading-loose text-stone-900">
                      {text}
                    </span>
                    {mark?.mistakes && mark.mistakes.length > 0 && (
                      <span
                        className="mt-1 block text-left text-xs text-accent"
                        dir="ltr"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {mark.mistakes.length} mistake tag
                        {mark.mistakes.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
      {ranges.length > 0 && (
        <p className="sr-only">{formatRangesLabel(ranges)}</p>
      )}
    </div>
  );
}
