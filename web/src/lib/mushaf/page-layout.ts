/**
 * Canonical Medina mushaf page size (512×724). QCF renderer draws at this
 * fixed size; MushafPageScaler scales uniformly so line breaks never reflow.
 */
export const MUSHAF_PAGE_WIDTH = 512;
export const MUSHAF_PAGE_HEIGHT = 724;

/** Pages 1–2 use centered short lines in the Medina layout */
export const MUSHAF_OPENING_PAGES = new Set([1, 2]);

/** Viewport inset (px) when fitting the page on phone — keeps glyphs off screen edges */
export const MOBILE_MUSHAF_VIEWPORT_INSET = {
  x: 8,
  top: 4,
  bottom: 10,
} as const;

/** Max scale — never upscale beyond 1× to preserve print-like proportions */
export const MUSHAF_MAX_SCALE = 1;

/**
 * Mobile height-first layout.
 *
 * On a portrait phone the page is always width-constrained with `contain`
 * fit, leaving dead space at the bottom and making text look small.
 * Instead we scale by height so the page fills the screen vertically, then
 * compute the extra line padding needed to keep words inside the visible
 * horizontal strip.
 *
 * Returns:
 *   scale   — CSS transform scale factor
 *   linePad — canvas-coordinate px to use as left/right padding on each line
 *             (set as --qt-line-pad CSS variable so it overrides --qcf-line-pad)
 */
export function computeMobileMushafLayout(
  containerWidth: number,
  containerHeight: number,
): { scale: number; linePad: number } {
  const inset = MOBILE_MUSHAF_VIEWPORT_INSET;
  const availH = Math.max(containerHeight - inset.top - inset.bottom, 300);
  const availW = Math.max(containerWidth - inset.x * 2, 200);

  const scaleH = availH / MUSHAF_PAGE_HEIGHT;
  const scaleW = availW / MUSHAF_PAGE_WIDTH;

  if (scaleH <= scaleW) {
    // Landscape / very short viewport — height is the natural constraint.
    // No horizontal overflow, keep default padding.
    return { scale: scaleH, linePad: 10 };
  }

  // Portrait: height-first. The canvas will visually overflow horizontally.
  // Compute line padding so word-glyphs stay within the visible width.
  //   visibleWidth = containerWidth
  //   canvasVisualWidth = MUSHAF_PAGE_WIDTH * scaleH
  //   overflowEachSide (visual px) = (canvasVisualWidth - containerWidth) / 2
  //   linePad (canvas px) = overflowEachSide / scaleH + safetyMargin
  const overflowPerSide =
    Math.max(0, MUSHAF_PAGE_WIDTH * scaleH - containerWidth) / 2;
  const linePad = Math.ceil(overflowPerSide / scaleH) + 4; // +4 px safety

  return { scale: scaleH, linePad: Math.max(10, linePad) };
}

export type MushafScaleFit = "contain" | "cover";

export type MushafScaleOptions = {
  padding?: number;
  paddingX?: number;
  paddingTop?: number;
  paddingBottom?: number;
  maxScale?: number;
  fit?: MushafScaleFit;
};

function resolveViewportInset(options?: MushafScaleOptions) {
  const fallback = options?.padding ?? 24;
  return {
    x: options?.paddingX ?? fallback,
    top: options?.paddingTop ?? fallback,
    bottom: options?.paddingBottom ?? fallback,
  };
}

export function computeMushafScale(
  containerWidth: number,
  containerHeight: number,
  options?: MushafScaleOptions,
): number {
  const inset = resolveViewportInset(options);
  const maxScale = options?.maxScale ?? MUSHAF_MAX_SCALE;
  const fit = options?.fit ?? "contain";
  const availW = Math.max(containerWidth - inset.x * 2, 200);
  const availH = Math.max(containerHeight - inset.top - inset.bottom, 300);
  const scaleW = availW / MUSHAF_PAGE_WIDTH;
  const scaleH = availH / MUSHAF_PAGE_HEIGHT;
  const raw = fit === "cover" ? Math.max(scaleW, scaleH) : Math.min(scaleW, scaleH);
  return Math.min(raw, maxScale);
}
