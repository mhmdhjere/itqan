/**
 * Canonical page size for react-quran ReadingView (Medina Mushaf proportions).
 * Content is rendered by react-quran at this fixed size; MushafPageScaler
 * scales the whole page uniformly — line breaks never reflow.
 */
export const MUSHAF_PAGE_WIDTH = 512;
export const MUSHAF_PAGE_HEIGHT = 724;

/** Max scale — never upscale beyond 1× to preserve print-like proportions */
export const MUSHAF_MAX_SCALE = 1;

export function computeMushafScale(
  containerWidth: number,
  containerHeight: number,
): number {
  const pad = 24;
  const availW = Math.max(containerWidth - pad, 200);
  const availH = Math.max(containerHeight - pad, 300);
  const scaleW = availW / MUSHAF_PAGE_WIDTH;
  const scaleH = availH / MUSHAF_PAGE_HEIGHT;
  return Math.min(scaleW, scaleH, MUSHAF_MAX_SCALE);
}
