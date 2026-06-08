"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  computeMushafScale,
  MUSHAF_PAGE_HEIGHT,
  MUSHAF_PAGE_WIDTH,
} from "@/lib/mushaf/page-layout";

export function MushafPageScaler({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      setScale(computeMushafScale(el.clientWidth, el.clientHeight));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const scaledW = MUSHAF_PAGE_WIDTH * scale;
  const scaledH = MUSHAF_PAGE_HEIGHT * scale;

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
