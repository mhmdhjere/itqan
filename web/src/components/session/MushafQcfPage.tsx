"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getAyahHoverBands,
  getMarkedAyahBands,
  type AyahHoverBand,
  type MarkedAyahBand,
} from "@/lib/mushaf/ayah-hover-bands";
import { isAyahInRanges } from "@/lib/mushaf/ayah-page-index";
import { fetchMushafPage } from "@/lib/mushaf/page-cache";
import {
  MUSHAF_OPENING_PAGES,
  MUSHAF_PAGE_HEIGHT,
  MUSHAF_PAGE_WIDTH,
} from "@/lib/mushaf/page-layout";
import { parseWordLocation } from "@/lib/mushaf/parse-location";
import { loadQcfV2PageFont } from "@/lib/mushaf/qcf-font";
import type { MushafLine, MushafPageData } from "@/lib/mushaf/types";
import type { SurahRange } from "@/lib/session-ranges";
import type { VerseMark } from "@/lib/types";
import { cn } from "@/lib/utils";
import "@/styles/mushaf-qcf.css";

const WORD_CLASS = "qt-mushaf-qcf-word";

function applyInteractionStyles(
  root: HTMLElement,
  ranges: SurahRange[],
  marks: Record<string, VerseMark>,
) {
  root.querySelectorAll<HTMLElement>(`.${WORD_CLASS}`).forEach((el) => {
    const surah = Number(el.dataset.chapter);
    const ayah = Number(el.dataset.verse);
    if (!surah || !ayah) return;

    const inRange = isAyahInRanges(surah, ayah, ranges);
    const stateKey = inRange ? "in" : "out";
    if (el.dataset.qtState === stateKey) return;
    el.dataset.qtState = stateKey;

    el.classList.remove("qt-mushaf-in-range", "qt-mushaf-out-range");
    el.classList.add(inRange ? "qt-mushaf-in-range" : "qt-mushaf-out-range");
  });
}

function QcfWord({
  location,
  glyph,
  fallback,
  fontFamily,
}: {
  location: string;
  glyph?: string;
  fallback: string;
  fontFamily: string | null;
}) {
  const verse = parseWordLocation(location);
  if (!verse) return null;

  if (fontFamily && glyph) {
    return (
      <span
        className={WORD_CLASS}
        data-chapter={verse.surah}
        data-verse={verse.ayah}
        style={{ fontFamily }}
        dangerouslySetInnerHTML={{ __html: glyph }}
      />
    );
  }

  return (
    <span
      className={WORD_CLASS}
      data-chapter={verse.surah}
      data-verse={verse.ayah}
    >
      {fallback}
    </span>
  );
}

function MushafQcfLine({
  line,
  fontFamily,
}: {
  line: MushafLine;
  fontFamily: string | null;
}) {
  if (line.type === "surah-header") {
    return <div className="qt-mushaf-qcf-line--surah">{line.text}</div>;
  }

  if (line.type === "basmala") {
    return (
      <div className="qt-mushaf-qcf-line--basmala">
        {fontFamily && line.qpcV2 ? (
          <span
            style={{ fontFamily }}
            dangerouslySetInnerHTML={{ __html: line.qpcV2 }}
          />
        ) : (
          <span>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
        )}
      </div>
    );
  }

  return (
    <div className="qt-mushaf-qcf-line--text">
      {line.words.map((w) => (
        <QcfWord
          key={w.location}
          location={w.location}
          glyph={w.qpcV2}
          fallback={w.word}
          fontFamily={fontFamily}
        />
      ))}
    </div>
  );
}

export const MushafQcfPage = memo(function MushafQcfPage({
  page,
  ranges,
  marks,
  onAyahClick,
  fillViewport = false,
}: {
  page: number;
  ranges: SurahRange[];
  marks: Record<string, VerseMark>;
  onAyahClick: (surah: number, ayah: number) => void;
  fillViewport?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageLayerRef = useRef<HTMLDivElement>(null);
  const [pageData, setPageData] = useState<MushafPageData | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hoverAyahRef = useRef<string | null>(null);
  const [hoverBands, setHoverBands] = useState<AyahHoverBand[]>([]);
  const [markBands, setMarkBands] = useState<MarkedAyahBand[]>([]);
  const rangesRef = useRef(ranges);
  const marksRef = useRef(marks);
  rangesRef.current = ranges;
  marksRef.current = marks;

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setPageData(null);
    setFontFamily(null);

    Promise.all([fetchMushafPage(page), loadQcfV2PageFont(page)])
      .then(([data, family]) => {
        if (cancelled) return;
        setPageData(data);
        setFontFamily(family);
        const neighbors = [page - 1, page + 1].filter((p) => p >= 1 && p <= 604);
        for (const p of neighbors) void loadQcfV2PageFont(p);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Failed to load mushaf page");
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const refreshMarkBands = useCallback(() => {
    const queryRoot = containerRef.current;
    const overlayRoot = pageLayerRef.current;
    if (!queryRoot || !overlayRoot) return;
    setMarkBands(
      getMarkedAyahBands(
        queryRoot,
        overlayRoot,
        rangesRef.current,
        marksRef.current,
      ),
    );
  }, []);

  const refreshHoverBands = useCallback(() => {
    const queryRoot = containerRef.current;
    const overlayRoot = pageLayerRef.current;
    const key = hoverAyahRef.current;
    if (!queryRoot || !overlayRoot || !key) return;
    const [surah, ayah] = key.split(":").map(Number);
    if (!surah || !ayah) return;
    setHoverBands(
      getAyahHoverBands(
        queryRoot,
        overlayRoot,
        surah,
        ayah,
        rangesRef.current,
      ),
    );
  }, []);

  const refreshAllBands = useCallback(() => {
    refreshMarkBands();
    refreshHoverBands();
  }, [refreshMarkBands, refreshHoverBands]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || !pageData) return;

    applyInteractionStyles(root, rangesRef.current, marksRef.current);
    refreshMarkBands();
    const t = window.setTimeout(() => {
      applyInteractionStyles(root, rangesRef.current, marksRef.current);
      refreshMarkBands();
    }, 50);
    return () => window.clearTimeout(t);
  }, [pageData, page, refreshMarkBands]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || !pageData) return;
    applyInteractionStyles(root, ranges, marks);
    refreshMarkBands();
  }, [ranges, marks, pageData, refreshMarkBands]);

  useEffect(() => {
    const queryRoot = containerRef.current;
    const overlayRoot = pageLayerRef.current;
    if (!queryRoot || !overlayRoot) return;
    const ro = new ResizeObserver(() => refreshAllBands());
    ro.observe(queryRoot);
    ro.observe(overlayRoot);
    return () => ro.disconnect();
  }, [page, pageData, refreshAllBands]);

  const resolveAyahFromTarget = (
    target: EventTarget | null,
  ): { surah: number; ayah: number } | null => {
    if (!(target instanceof HTMLElement)) return null;
    const word = target.closest<HTMLElement>(`.${WORD_CLASS}`);
    if (!word) return null;
    const surah = Number(word.dataset.chapter);
    const ayah = Number(word.dataset.verse);
    if (surah && ayah && isAyahInRanges(surah, ayah, rangesRef.current)) {
      return { surah, ayah };
    }
    return null;
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    const queryRoot = containerRef.current;
    const overlayRoot = pageLayerRef.current;
    if (!queryRoot || !overlayRoot) return;

    const verse = resolveAyahFromTarget(e.target);
    if (!verse) {
      if (hoverAyahRef.current !== null) {
        hoverAyahRef.current = null;
        setHoverBands([]);
      }
      return;
    }

    const key = `${verse.surah}:${verse.ayah}`;
    if (hoverAyahRef.current === key) return;
    hoverAyahRef.current = key;
    setHoverBands(
      getAyahHoverBands(
        queryRoot,
        overlayRoot,
        verse.surah,
        verse.ayah,
        rangesRef.current,
      ),
    );
  };

  const handleMouseLeave = () => {
    hoverAyahRef.current = null;
    setHoverBands([]);
  };

  const handlePointer = (e: React.MouseEvent) => {
    const verse = resolveAyahFromTarget(e.target);
    if (!verse) return;
    onAyahClick(verse.surah, verse.ayah);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "qt-mushaf-qcf relative",
        fillViewport && "qt-mushaf-qcf--fill h-full w-full",
        MUSHAF_OPENING_PAGES.has(page) && "qt-mushaf-qcf--opening",
      )}
      style={{ width: MUSHAF_PAGE_WIDTH, height: MUSHAF_PAGE_HEIGHT }}
      onClick={handlePointer}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={pageLayerRef} className="relative h-full w-full">
        <div className="qt-mushaf-qcf-page">
          {loadError && (
            <p className="flex flex-1 items-center justify-center text-sm text-muted">
              {loadError}
            </p>
          )}
          {!loadError &&
            !pageData &&
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="qt-mushaf-qcf-line--text opacity-20" />
            ))}
          {pageData?.lines.map((line) => (
            <MushafQcfLine
              key={line.line}
              line={line}
              fontFamily={fontFamily}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden>
          {markBands.map((band, i) => (
            <div
              key={`${band.key}-${i}`}
              className={`qt-mushaf-ayah-mark-band qt-mushaf-ayah-mark-band--${band.status}`}
              style={{
                top: band.top,
                left: band.left,
                width: band.width,
                height: band.height,
              }}
            />
          ))}
          {hoverBands.map((band, i) => (
            <div
              key={`hover-${i}`}
              className="qt-mushaf-ayah-hover-band"
              style={{
                top: band.top,
                left: band.left,
                width: band.width,
                height: band.height,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
