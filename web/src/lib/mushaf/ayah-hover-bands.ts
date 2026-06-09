import { isAyahInRanges } from "@/lib/mushaf/ayah-page-index";
import { parseVerseKey, type SurahRange } from "@/lib/session-ranges";
import type { VerseMark, VerseStatusSlug } from "@/lib/types";

export type AyahHoverBand = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type MarkedAyahBand = AyahHoverBand & {
  key: string;
  status: VerseStatusSlug;
};

const LINE_TOLERANCE_PX = 6;

type LayoutRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

const WORD_SELECTORS = [
  ".qt-mushaf-qcf-word",
  ".react-quran_ayah-word",
] as const;

function ayahWordSelector(surah: number, ayah: number): string {
  return WORD_SELECTORS.map(
    (cls) => `${cls}[data-chapter="${surah}"][data-verse="${ayah}"]`,
  ).join(",");
}

/** Map viewport rects to local CSS pixels (undo ancestor transform scale). */
export function getVisualScale(el: HTMLElement): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  const ow = el.offsetWidth;
  const oh = el.offsetHeight;
  return {
    x: ow > 0 ? rect.width / ow : 1,
    y: oh > 0 ? rect.height / oh : 1,
  };
}

export function elementLayoutRect(
  el: HTMLElement,
  root: HTMLElement,
): LayoutRect {
  const elRect = el.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const scale = getVisualScale(root);

  return {
    top: (elRect.top - rootRect.top) / scale.y,
    left: (elRect.left - rootRect.left) / scale.x,
    right: (elRect.right - rootRect.left) / scale.x,
    bottom: (elRect.bottom - rootRect.top) / scale.y,
  };
}

function mergeRectsIntoBands(rects: LayoutRect[]): AyahHoverBand[] {
  const groups: LayoutRect[][] = [];

  for (const rect of rects) {
    let placed = false;
    for (const group of groups) {
      if (Math.abs(group[0]!.top - rect.top) < LINE_TOLERANCE_PX) {
        group.push(rect);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([rect]);
  }

  return groups.map((group) => {
    const top = Math.min(...group.map((r) => r.top));
    const bottom = Math.max(...group.map((r) => r.bottom));
    const left = Math.min(...group.map((r) => r.left));
    const right = Math.max(...group.map((r) => r.right));
    return {
      top,
      left,
      width: right - left,
      height: bottom - top,
    };
  });
}

function collectAyahElements(
  root: HTMLElement,
  surah: number,
  ayah: number,
): HTMLElement[] {
  const elements: HTMLElement[] = [];
  root
    .querySelectorAll<HTMLElement>(ayahWordSelector(surah, ayah))
    .forEach((el) => elements.push(el));
  return elements;
}

/** One seamless highlight band per line segment for the ayah */
export function getAyahHoverBands(
  queryRoot: HTMLElement,
  overlayRoot: HTMLElement,
  surah: number,
  ayah: number,
  ranges: SurahRange[],
): AyahHoverBand[] {
  if (!isAyahInRanges(surah, ayah, ranges)) return [];

  const elements = collectAyahElements(queryRoot, surah, ayah);
  if (elements.length === 0) return [];

  const rects = elements.map((el) => elementLayoutRect(el, overlayRoot));
  return mergeRectsIntoBands(rects);
}

export function getMarkedAyahBands(
  queryRoot: HTMLElement,
  overlayRoot: HTMLElement,
  ranges: SurahRange[],
  marks: Record<string, VerseMark>,
): MarkedAyahBand[] {
  const result: MarkedAyahBand[] = [];

  for (const [key, mark] of Object.entries(marks)) {
    if (!mark.status) continue;
    const { surah, ayah } = parseVerseKey(key);
    const bands = getAyahHoverBands(
      queryRoot,
      overlayRoot,
      surah,
      ayah,
      ranges,
    );
    for (const band of bands) {
      result.push({ ...band, key, status: mark.status });
    }
  }

  return result;
}
