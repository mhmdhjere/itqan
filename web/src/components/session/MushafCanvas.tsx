"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActiveConfig } from "@/lib/config/types";
import { pagesForRanges } from "@/lib/mushaf/ayah-page-index";
import type { SurahRange } from "@/lib/session-ranges";
import type { VerseMark } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { MushafPageScaler } from "./MushafPageScaler";
import { ReactQuranMushafPage } from "./ReactQuranMushafPage";

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
}: {
  ranges: SurahRange[];
  marks: Record<string, VerseMark>;
  activeConfig: ActiveConfig | null;
  onAyahClick: (surah: number, ayah: number) => void;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}) {
  const bounds = useMemo(() => pagesForRanges(ranges), [ranges]);
  const [currentPage, setCurrentPage] = useState(
    initialPage ?? bounds.startPage,
  );

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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3 px-1">
        <Button
          size="sm"
          variant="secondary"
          disabled={!canPrev}
          onClick={() => {
            if (canPrev) setCurrentPage(bounds.pages[pageIndex - 1]!);
          }}
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
          onClick={() => {
            if (canNext) setCurrentPage(bounds.pages[pageIndex + 1]!);
          }}
          aria-label="Next Mushaf page"
        >
          →
        </Button>
      </div>

      <MushafPageScaler>
        <ReactQuranMushafPage
          page={currentPage}
          ranges={ranges}
          marks={marks}
          onAyahClick={onAyahClick}
        />
      </MushafPageScaler>
    </div>
  );
}
