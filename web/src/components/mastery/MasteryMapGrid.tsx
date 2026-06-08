"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getAyahMasteryMap,
  getSurah,
  getSurahMasteryMap,
} from "@/lib/mock-data";
import type { MasteryMapState } from "@/lib/types";
import {
  cn,
  getMapStateColor,
  getMapStateLabel,
} from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const legend: MasteryMapState[] = [
  "memorized",
  "needs_review",
  "frequently_weak",
  "not_recited",
];

export function MasteryMapGrid({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [filter, setFilter] = useState<MasteryMapState | "all">("all");
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);

  const surahCells = getSurahMasteryMap(studentId);
  const ayahCells = selectedSurah
    ? getAyahMasteryMap(studentId, selectedSurah)
    : [];

  const filteredSurahs =
    filter === "all"
      ? surahCells
      : surahCells.filter((c) => c.state === filter);

  const selectedAyahData = ayahCells.find((a) => a.ayah === selectedAyah);
  const selectedSurahMeta = selectedSurah ? getSurah(selectedSurah) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/students/${studentId}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Mastery Map</h1>
          <p className="text-sm text-muted">{studentName}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedSurah(null);
            setSelectedAyah(null);
          }}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            selectedSurah === null
              ? "bg-accent text-white"
              : "bg-stone-100 text-stone-600",
          )}
        >
          All surahs
        </button>
        {legend.map((state) => (
          <button
            key={state}
            type="button"
            onClick={() => setFilter(filter === state ? "all" : state)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-opacity",
              filter === state || filter === "all"
                ? "opacity-100"
                : "opacity-40",
              "bg-stone-100 text-stone-700",
            )}
          >
            <span
              className={cn("h-2.5 w-2.5 rounded-sm", getMapStateColor(state))}
            />
            {getMapStateLabel(state)}
          </button>
        ))}
      </div>

      {selectedSurah === null ? (
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
          {filteredSurahs.map((cell) => (
            <button
              key={cell.surah}
              type="button"
              title={`Surah ${cell.surah} — ${getMapStateLabel(cell.state)}`}
              onClick={() => {
                setSelectedSurah(cell.surah);
                setSelectedAyah(null);
              }}
              className={cn(
                "aspect-square rounded-md text-[10px] font-medium text-white/90 transition-transform hover:scale-105 sm:text-xs",
                getMapStateColor(cell.state),
                filter !== "all" && cell.state !== filter && "opacity-20",
              )}
            >
              {cell.surah}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            type="button"
            className="mb-4 text-sm text-accent hover:underline"
            onClick={() => {
              setSelectedSurah(null);
              setSelectedAyah(null);
            }}
          >
            ← All surahs
          </button>
          <h2 className="mb-3 text-lg font-medium">
            {selectedSurahMeta?.nameEn} ({selectedSurah})
          </h2>
          <div className="flex flex-wrap gap-1">
            {ayahCells.map((cell) => (
              <button
                key={cell.ayah}
                type="button"
                onClick={() => setSelectedAyah(cell.ayah)}
                className={cn(
                  "h-8 w-8 rounded text-[10px] font-medium text-white/90 sm:h-9 sm:w-9 sm:text-xs",
                  getMapStateColor(cell.state),
                  selectedAyah === cell.ayah && "ring-2 ring-accent ring-offset-1",
                )}
              >
                {cell.ayah}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedAyah !== null && selectedAyahData && selectedSurahMeta && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="font-medium">
            Ayah {selectedAyah} · {selectedSurahMeta.nameEn}
          </p>
          <p className="mt-1 text-sm text-muted">
            {getMapStateLabel(selectedAyahData.state)} · Score{" "}
            {selectedAyahData.score}%
          </p>
          {selectedAyahData.lastRecitedAt && (
            <p className="text-sm text-muted">
              Last recited:{" "}
              {new Date(selectedAyahData.lastRecitedAt).toLocaleDateString()}
            </p>
          )}
          {selectedAyahData.topMistakes.length > 0 && (
            <p className="mt-2 text-sm">
              Top mistakes: {selectedAyahData.topMistakes.join(", ")}
            </p>
          )}
          <Button
            className="mt-4"
            size="sm"
            href={`/session/new?studentId=${studentId}&ranges=${encodeURIComponent(`${selectedSurah}:${selectedAyah}-${Math.min(selectedAyah + 4, selectedSurahMeta.ayahCount)}`)}`}
          >
            Start session here
          </Button>
        </div>
      )}
    </div>
  );
}
