"use client";

import {
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";
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

type FlatRow =
  | {
      type: "header";
      key: string;
      surah: number;
      range: SurahRange;
      surahName: string;
    }
  | {
      type: "ayah";
      key: string;
      surah: number;
      ayah: number;
      text: string;
      surahName: string;
    };

const VIRTUALIZE_THRESHOLD = 50;
const ROW_HEIGHT = 72;
const HEADER_HEIGHT = 56;
const OVERSCAN = 6;

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

function AyahButton({
  surah,
  ayah,
  text,
  surahName,
  mark,
  activeConfig,
  displayStyle,
  onAyahClick,
}: {
  surah: number;
  ayah: number;
  text: string;
  surahName: string;
  mark?: VerseMark;
  activeConfig: ActiveConfig | null;
  displayStyle: React.CSSProperties;
  onAyahClick: (surah: number, ayah: number) => void;
}) {
  const status = mark?.status;
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg border-l-4 px-4 py-3 text-right transition-colors",
        status ? getStatusBorderColor(status) : "border-l-transparent",
        "hover:bg-stone-50/80 active:bg-stone-100/80",
      )}
      dir="rtl"
      style={displayStyle}
      onClick={() => onAyahClick(surah, ayah)}
      role="button"
      aria-label={`${surahName} ayah ${ayah}${status ? `, ${getStatusLabel(status, activeConfig)}` : ", unmarked"}`}
    >
      <span
        className="float-left flex items-center gap-2 font-sans text-xs font-medium text-muted"
        dir="ltr"
        style={{ fontSize: "0.75rem" }}
        aria-hidden
      >
        <span>{ayah}</span>
        {status && status !== "correct" && (
          <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700">
            {getStatusLabel(status, activeConfig)}
          </span>
        )}
      </span>
      <span className="font-quran leading-loose text-stone-900">{text}</span>
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
}

export function QuranCanvas({
  ranges,
  marks,
  activeConfig,
  onAyahClick,
  scrollContainerRef,
}: {
  ranges: SurahRange[];
  marks: Record<string, VerseMark>;
  activeConfig: ActiveConfig | null;
  onAyahClick: (surah: number, ayah: number) => void;
  scrollContainerRef?: RefObject<HTMLElement | null>;
}) {
  const [surahData, setSurahData] = useState<Map<number, SurahData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 60 });

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

  const flatRows = useMemo(() => {
    const rows: FlatRow[] = [];
    for (const range of ranges) {
      const data = surahData.get(range.surah);
      const surahName = data?.meta.nameEn ?? `Surah ${range.surah}`;
      rows.push({
        type: "header",
        key: `h-${range.id}`,
        surah: range.surah,
        range,
        surahName,
      });
      const ayahs =
        data?.ayahs.filter(
          (a) => a.ayah >= range.startAyah && a.ayah <= range.endAyah,
        ) ?? [];
      for (const { surah, ayah, text } of ayahs) {
        rows.push({
          type: "ayah",
          key: verseKey(surah, ayah),
          surah,
          ayah,
          text,
          surahName,
        });
      }
    }
    return rows;
  }, [ranges, surahData]);

  const ayahCount = flatRows.filter((r) => r.type === "ayah").length;
  const useVirtual = ayahCount > VIRTUALIZE_THRESHOLD;

  const rowOffsets = useMemo(() => {
    let y = 0;
    return flatRows.map((row) => {
      const top = y;
      y += row.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT;
      return top;
    });
  }, [flatRows]);

  const totalHeight = useMemo(() => {
    if (flatRows.length === 0) return 0;
    const last = flatRows[flatRows.length - 1];
    const lastTop = rowOffsets[rowOffsets.length - 1] ?? 0;
    return (
      lastTop + (last.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT)
    );
  }, [flatRows, rowOffsets]);

  useEffect(() => {
    if (!useVirtual || !scrollContainerRef?.current) return;

    const el = scrollContainerRef.current;
    const update = () => {
      const scrollTop = el.scrollTop;
      const viewHeight = el.clientHeight;
      let start = 0;
      let end = flatRows.length;

      for (let i = 0; i < flatRows.length; i++) {
        const top = rowOffsets[i] ?? 0;
        const height =
          flatRows[i].type === "header" ? HEADER_HEIGHT : ROW_HEIGHT;
        if (top + height >= scrollTop - OVERSCAN * ROW_HEIGHT) {
          start = Math.max(0, i - OVERSCAN);
          break;
        }
      }

      for (let i = start; i < flatRows.length; i++) {
        const top = rowOffsets[i] ?? 0;
        if (top > scrollTop + viewHeight + OVERSCAN * ROW_HEIGHT) {
          end = Math.min(flatRows.length, i + OVERSCAN);
          break;
        }
      }

      setVisibleRange({ start, end });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [useVirtual, flatRows, rowOffsets, scrollContainerRef]);

  const displayStyle = getDisplayStyle(activeConfig);

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted">Loading Quran…</p>
    );
  }

  const renderRow = (row: FlatRow) => {
    if (row.type === "header") {
      return (
        <div
          key={row.key}
          className="sticky top-0 z-10 mb-2 rounded-lg bg-accent-light/80 px-3 py-2 backdrop-blur-sm"
          style={useVirtual ? { minHeight: HEADER_HEIGHT } : undefined}
        >
          <p className="text-sm font-semibold text-accent">{row.surahName}</p>
          <p className="text-xs text-muted">
            Ayah {row.range.startAyah}–{row.range.endAyah}
          </p>
        </div>
      );
    }

    const mark = marks[row.key];
    return (
      <AyahButton
        key={row.key}
        surah={row.surah}
        ayah={row.ayah}
        text={row.text}
        surahName={row.surahName}
        mark={mark}
        activeConfig={activeConfig}
        displayStyle={displayStyle}
        onAyahClick={onAyahClick}
      />
    );
  };

  if (!useVirtual) {
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
                {ayahs.map(({ surah, ayah, text }) =>
                  renderRow({
                    type: "ayah",
                    key: verseKey(surah, ayah),
                    surah,
                    ayah,
                    text,
                    surahName: data?.meta.nameEn ?? `Surah ${surah}`,
                  }),
                )}
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

  const visibleRows = flatRows.slice(visibleRange.start, visibleRange.end);
  const paddingTop = rowOffsets[visibleRange.start] ?? 0;
  const lastVisible = flatRows[visibleRange.end - 1];
  const lastBottom =
    (rowOffsets[visibleRange.end - 1] ?? 0) +
    (lastVisible?.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT);
  const paddingBottom = Math.max(0, totalHeight - lastBottom);

  return (
    <div className="mx-auto max-w-2xl">
      <div style={{ paddingTop, paddingBottom }} className="space-y-1">
        {visibleRows.map(renderRow)}
      </div>
      <p className="sr-only">{formatRangesLabel(ranges)}</p>
    </div>
  );
}
