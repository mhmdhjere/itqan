"use client";

import { useEffect, useRef, useState } from "react";
import type { ActiveConfig } from "@/lib/config/types";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTeacherPreferences } from "@/lib/hooks/useTeacherPreferences";
import type { QuranDisplayMode } from "@/lib/mushaf/types";
import type { SurahRange } from "@/lib/session-ranges";
import type { VerseMark } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MushafCanvas } from "./MushafCanvas";
import { QuranCanvas } from "./QuranCanvas";

function ModeToggle({
  mode,
  onChange,
}: {
  mode: QuranDisplayMode;
  onChange: (mode: QuranDisplayMode) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-xs"
      role="tablist"
      aria-label="Quran display mode"
    >
      {(["structured", "mushaf"] as const).map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={mode === value}
          className={cn(
            "rounded-md px-3 py-1.5 font-medium capitalize transition-colors",
            mode === value
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground",
          )}
          onClick={() => onChange(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

export function QuranDisplay({
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
  const isMobile = useIsMobile();
  const { mode, setMode, loaded } = useTeacherPreferences();
  const [localMode, setLocalMode] = useState<QuranDisplayMode>("structured");
  const [mushafPage, setMushafPage] = useState<number | undefined>();
  const structuredScrollRef = useRef<HTMLDivElement>(null);

  const mushafEnabled =
    activeConfig?.config.features.mushaf_display !== false;

  useEffect(() => {
    if (loaded) setLocalMode(mode);
  }, [loaded, mode]);

  const displayMode =
    isMobile && mushafEnabled
      ? "mushaf"
      : mushafEnabled && localMode === "mushaf"
        ? "mushaf"
        : "structured";

  const handleModeChange = (next: QuranDisplayMode) => {
    setLocalMode(next);
    void setMode(next);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {mushafEnabled && !isMobile && (
        <div className="mb-4 flex shrink-0 justify-center">
          <ModeToggle mode={displayMode} onChange={handleModeChange} />
        </div>
      )}

      {displayMode === "mushaf" ? (
        <>
          {!isMobile && (
            <p className="mb-2 shrink-0 text-center text-xs text-muted">
              Tap an ayah in your session range to mark
            </p>
          )}
          <MushafCanvas
            ranges={ranges}
            marks={marks}
            activeConfig={activeConfig}
            onAyahClick={onAyahClick}
            initialPage={mushafPage}
            onPageChange={setMushafPage}
            mobile={isMobile}
          />
        </>
      ) : (
        <div
          ref={structuredScrollRef}
          className="min-h-0 flex-1 overflow-y-auto py-2"
        >
          <QuranCanvas
            ranges={ranges}
            marks={marks}
            activeConfig={activeConfig}
            onAyahClick={onAyahClick}
            scrollContainerRef={structuredScrollRef}
          />
        </div>
      )}
    </div>
  );
}
