"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ActiveConfig } from "@/lib/config/types";
import { pagesForRanges } from "@/lib/mushaf/ayah-page-index";
import type { SurahRange } from "@/lib/session-ranges";
import type { VerseMark } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { MushafPageScaler } from "./MushafPageScaler";
import { MushafQcfPage } from "./MushafQcfPage";

const SWIPE_THRESHOLD_PX = 48;

function toArabicNumeral(n: number): string {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

export function MushafCanvas({
  ranges,
  marks,
  activeConfig: _activeConfig,
  onAyahClick,
  initialPage,
  onPageChange,
  mobile = false,
}: {
  ranges: SurahRange[];
  marks: Record<string, VerseMark>;
  activeConfig: ActiveConfig | null;
  onAyahClick: (surah: number, ayah: number) => void;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  mobile?: boolean;
}) {
  const bounds = useMemo(() => pagesForRanges(ranges), [ranges]);
  const [currentPage, setCurrentPage] = useState(
    initialPage ?? bounds.startPage,
  );
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setCurrentPage((p) => {
      if (p < bounds.min) return bounds.startPage;
      if (p > bounds.max) return bounds.startPage;
      return p;
    });
  }, [bounds.min, bounds.max, bounds.startPage]);

  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  const pageIndex = bounds.pages.indexOf(currentPage);
  const canPrev = pageIndex > 0;
  const canNext = pageIndex >= 0 && pageIndex < bounds.pages.length - 1;

  const goPrev = useCallback(() => {
    if (canPrev) setCurrentPage(bounds.pages[pageIndex - 1]!);
  }, [bounds.pages, canPrev, pageIndex]);

  const goNext = useCallback(() => {
    if (canNext) setCurrentPage(bounds.pages[pageIndex + 1]!);
  }, [bounds.pages, canNext, pageIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (
      Math.abs(dx) < SWIPE_THRESHOLD_PX ||
      Math.abs(dx) < Math.abs(dy) * 1.2
    ) {
      return;
    }

    if (dx < 0) goNext();
    else goPrev();
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      onTouchStart={mobile ? handleTouchStart : undefined}
      onTouchEnd={mobile ? handleTouchEnd : undefined}
    >
      {!mobile && (
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3 px-1">
          <Button
            size="sm"
            variant="secondary"
            disabled={!canPrev}
            onClick={goPrev}
            aria-label="Previous Mushaf page"
          >
            ←
          </Button>
          <p className="text-center text-sm text-muted" dir="rtl">
            صفحة {toArabicNumeral(currentPage)}
            <span className="mx-2 text-border">·</span>
            <span dir="ltr">
              {pageIndex + 1} / {bounds.pages.length}
            </span>
          </p>
          <Button
            size="sm"
            variant="secondary"
            disabled={!canNext}
            onClick={goNext}
            aria-label="Next Mushaf page"
          >
            →
          </Button>
        </div>
      )}

      <MushafPageScaler fillViewport={mobile}>
        <MushafQcfPage
          page={currentPage}
          ranges={ranges}
          marks={marks}
          onAyahClick={onAyahClick}
          fillViewport={mobile}
        />
      </MushafPageScaler>
    </div>
  );
}
