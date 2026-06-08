"use client";

import { memo, useEffect, useRef, type CSSProperties } from "react";
import { ReadingView } from "react-quran";
import "react-quran/fonts/index.css";
import "@/styles/mushaf-react-quran.css";
import { isAyahInRanges } from "@/lib/mushaf/ayah-page-index";
import {
  MUSHAF_PAGE_HEIGHT,
  MUSHAF_PAGE_WIDTH,
} from "@/lib/mushaf/page-layout";
import type { SurahRange } from "@/lib/session-ranges";
import { verseKey } from "@/lib/session-ranges";
import type { VerseMark, VerseStatusSlug } from "@/lib/types";

const STATUS_SLUGS: VerseStatusSlug[] = [
  "reminder_required",
  "second_attempt",
  "third_attempt",
  "prompting_required",
  "incomplete",
];

const ALL_INTERACTION_CLASSES = [
  "qt-mushaf-in-range",
  "qt-mushaf-out-range",
  "qt-mushaf-marker-marked",
  ...STATUS_SLUGS.map((s) => `qt-mushaf-status-${s}`),
];

/** Stable references — ReadingView is memoized and re-renders if these change identity */
const READING_VIEW_STYLES: CSSProperties = {
  width: MUSHAF_PAGE_WIDTH,
  maxWidth: "none",
  minWidth: MUSHAF_PAGE_WIDTH,
  height: MUSHAF_PAGE_HEIGHT,
  backgroundColor: "#fffef8",
  border: "1px solid #d6d3d1",
  boxShadow: "0 4px 14px rgba(28, 25, 23, 0.1)",
  padding: "12px 16px",
  boxSizing: "border-box",
};

const SURAH_TITLE_STYLES: CSSProperties = {
  color: "#1c1917",
  fontFamily: "inherit",
};

function statusClass(status: VerseStatusSlug) {
  return `qt-mushaf-status-${status}`;
}

function verseFromElement(el: HTMLElement | null): {
  surah: number;
  ayah: number;
} | null {
  let node: Element | null = el;
  while (node) {
    if (
      node instanceof HTMLElement &&
      node.classList.contains("react-quran_ayah-word")
    ) {
      const surah = Number(node.dataset.chapter);
      const ayah = Number(node.dataset.verse);
      if (surah && ayah) return { surah, ayah };
    }
    node = node.previousElementSibling;
  }
  return null;
}

function clearAyahHover(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>(".qt-mushaf-ayah-hover")
    .forEach((el) => el.classList.remove("qt-mushaf-ayah-hover"));
}

function setAyahHover(root: HTMLElement, surah: number, ayah: number) {
  clearAyahHover(root);
  root
    .querySelectorAll<HTMLElement>(
      `.react-quran_ayah-word[data-chapter="${surah}"][data-verse="${ayah}"]`,
    )
    .forEach((el) => {
      if (el.classList.contains("qt-mushaf-in-range")) {
        el.classList.add("qt-mushaf-ayah-hover");
      }
    });
  root.querySelectorAll<HTMLElement>(".react-quran_ayah-marker").forEach((marker) => {
    const verse = verseFromElement(marker);
    if (
      verse?.surah === surah &&
      verse?.ayah === ayah &&
      marker.classList.contains("qt-mushaf-in-range")
    ) {
      marker.classList.add("qt-mushaf-ayah-hover");
    }
  });
}

function applyInteractionStyles(
  root: HTMLElement,
  ranges: SurahRange[],
  marks: Record<string, VerseMark>,
) {
  const words = root.querySelectorAll<HTMLElement>(".react-quran_ayah-word");
  words.forEach((el) => {
    const surah = Number(el.dataset.chapter);
    const ayah = Number(el.dataset.verse);
    if (!surah || !ayah) return;

    const inRange = isAyahInRanges(surah, ayah, ranges);
    const status = marks[verseKey(surah, ayah)]?.status;
    const stateKey = inRange ? `in:${status ?? ""}` : "out";

    if (el.dataset.qtState === stateKey) return;
    el.dataset.qtState = stateKey;

    el.classList.remove(...ALL_INTERACTION_CLASSES);
    if (inRange) {
      el.classList.add("qt-mushaf-in-range");
      if (status) el.classList.add(statusClass(status));
    } else {
      el.classList.add("qt-mushaf-out-range");
    }
  });

  const markers = root.querySelectorAll<HTMLElement>(".react-quran_ayah-marker");
  markers.forEach((marker) => {
    const verse = verseFromElement(marker);
    if (!verse) return;
    const { surah, ayah } = verse;

    const inRange = isAyahInRanges(surah, ayah, ranges);
    const marked = Boolean(marks[verseKey(surah, ayah)]?.status);
    const stateKey = inRange ? `in:${marked}` : "out";

    if (marker.dataset.qtState === stateKey) return;
    marker.dataset.qtState = stateKey;

    marker.classList.remove(
      "qt-mushaf-in-range",
      "qt-mushaf-out-range",
      "qt-mushaf-marker-marked",
    );
    if (inRange) {
      marker.classList.add("qt-mushaf-in-range");
      if (marked) marker.classList.add("qt-mushaf-marker-marked");
    } else {
      marker.classList.add("qt-mushaf-out-range");
    }
  });
}

export const ReactQuranMushafPage = memo(function ReactQuranMushafPage({
  page,
  ranges,
  marks,
  onAyahClick,
}: {
  page: number;
  ranges: SurahRange[];
  marks: Record<string, VerseMark>;
  onAyahClick: (surah: number, ayah: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const applyingRef = useRef(false);
  const hoverAyahRef = useRef<string | null>(null);
  const rangesRef = useRef(ranges);
  const marksRef = useRef(marks);
  rangesRef.current = ranges;
  marksRef.current = marks;

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const run = () => {
      if (applyingRef.current) return;
      applyingRef.current = true;
      try {
        applyInteractionStyles(root, rangesRef.current, marksRef.current);
      } finally {
        applyingRef.current = false;
      }
    };

    run();
    const t1 = window.setTimeout(run, 80);

    // Only watch DOM structure (ReadingView mount) — NOT attributes (our class changes)
    const mo = new MutationObserver((records) => {
      const added = records.some(
        (r) => r.type === "childList" && r.addedNodes.length > 0,
      );
      if (added) run();
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      window.clearTimeout(t1);
    };
  }, [page]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    applyInteractionStyles(root, ranges, marks);
  }, [ranges, marks]);

  const resolveAyahFromTarget = (
    target: EventTarget | null,
  ): { surah: number; ayah: number } | null => {
    if (!(target instanceof HTMLElement)) return null;
    const word = target.closest<HTMLElement>(".react-quran_ayah-word");
    if (word?.classList.contains("qt-mushaf-in-range")) {
      const surah = Number(word.dataset.chapter);
      const ayah = Number(word.dataset.verse);
      if (surah && ayah) return { surah, ayah };
    }
    const marker = target.closest<HTMLElement>(".react-quran_ayah-marker");
    if (marker?.classList.contains("qt-mushaf-in-range")) {
      return verseFromElement(marker);
    }
    return null;
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    const root = containerRef.current;
    if (!root) return;

    const verse = resolveAyahFromTarget(e.target);
    if (!verse) {
      if (hoverAyahRef.current !== null) {
        hoverAyahRef.current = null;
        clearAyahHover(root);
      }
      return;
    }

    const key = `${verse.surah}:${verse.ayah}`;
    if (hoverAyahRef.current === key) return;
    hoverAyahRef.current = key;
    setAyahHover(root, verse.surah, verse.ayah);
  };

  const handleMouseLeave = () => {
    hoverAyahRef.current = null;
    const root = containerRef.current;
    if (root) clearAyahHover(root);
  };

  const handlePointer = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const word = target.closest<HTMLElement>(".react-quran_ayah-word");
    const marker = target.closest<HTMLElement>(".react-quran_ayah-marker");

    let surah = 0;
    let ayah = 0;

    if (word) {
      surah = Number(word.dataset.chapter);
      ayah = Number(word.dataset.verse);
    } else if (marker) {
      const verse = verseFromElement(marker);
      if (verse) {
        surah = verse.surah;
        ayah = verse.ayah;
      }
    }

    if (!surah || !ayah) return;
    if (!isAyahInRanges(surah, ayah, ranges)) return;
    onAyahClick(surah, ayah);
  };

  return (
    <div
      ref={containerRef}
      className="qt-mushaf-react-quran"
      onClick={handlePointer}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <ReadingView
        page={page}
        fixedAspectRatio
        readingViewStyles={READING_VIEW_STYLES}
        surahTitleStyles={SURAH_TITLE_STYLES}
      />
    </div>
  );
});
