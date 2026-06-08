"use client";

import Link from "next/link";
import type { SurahMasteryCell } from "@/lib/types";
import { cn, getMapStateColor } from "@/lib/utils";

export function MasteryMapThumbnail({
  studentId,
  surahs,
}: {
  studentId: string;
  surahs: SurahMasteryCell[];
}) {
  const recited = surahs.filter((s) => s.state !== "not_recited");
  if (recited.length === 0) {
    return (
      <p className="text-sm text-muted">
        Complete a session to see progress on the mastery map.
      </p>
    );
  }

  return (
    <Link
      href={`/students/${studentId}/mastery-map`}
      className="block rounded-lg border border-border p-3 transition-colors hover:border-accent/40"
    >
      <div className="grid grid-cols-[repeat(19,minmax(0,1fr))] gap-px">
        {surahs.map((cell) => (
          <span
            key={cell.surah}
            title={`Surah ${cell.surah}`}
            className={cn(
              "aspect-square rounded-[2px]",
              getMapStateColor(cell.state),
              cell.state === "not_recited" && "opacity-30",
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">Tap to open full mastery map</p>
    </Link>
  );
}
