"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  computeMobileMushafLayout,
  computeMushafScale,
  MUSHAF_PAGE_HEIGHT,
  MUSHAF_PAGE_WIDTH,
} from "@/lib/mushaf/page-layout";

export function MushafPageScaler({
  children,
  fillViewport = false,
}: {
  children: ReactNode;
  fillViewport?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [linePad, setLinePad] = useState(10);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      if (fillViewport) {
        // Height-first: fills the screen vertically with the largest possible
        // text size, then compensates for horizontal canvas overflow via
        // dynamic line padding (--qt-line-pad CSS variable).
        const { scale: s, linePad: lp } = computeMobileMushafLayout(
          el.clientWidth,
          el.clientHeight,
        );
        setScale(s);
        setLinePad(lp);
      } else {
        setScale(computeMushafScale(el.clientWidth, el.clientHeight));
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [fillViewport]);

  const scaledW = MUSHAF_PAGE_WIDTH * scale;
  const scaledH = MUSHAF_PAGE_HEIGHT * scale;

  if (fillViewport) {
    return (
      <div
        ref={viewportRef}
        className="flex h-full w-full flex-1 items-center justify-center overflow-hidden"
      >
        <div
          className="origin-center shrink-0"
          style={{
            width: MUSHAF_PAGE_WIDTH,
            height: MUSHAF_PAGE_HEIGHT,
            transform: `scale(${scale})`,
            // --qt-line-pad cascades to .qt-mushaf-qcf-line--text children
            // so they use this computed value instead of the default --qcf-line-pad.
            ["--qt-line-pad"]: `${linePad}px`,
          } as React.CSSProperties}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className="flex w-full flex-1 items-start justify-center overflow-auto py-2"
    >
      <div
        className="relative shrink-0"
        style={{ width: scaledW, height: scaledH }}
      >
        <div
          className="absolute left-1/2 top-0 origin-top"
          style={{
            width: MUSHAF_PAGE_WIDTH,
            height: MUSHAF_PAGE_HEIGHT,
            transform: `translateX(-50%) scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
