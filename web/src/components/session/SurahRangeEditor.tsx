"use client";

import { useSurahIndex } from "@/lib/hooks/useSurahIndex";
import type { SurahRange } from "@/lib/session-ranges";
import { validateRange } from "@/lib/session-ranges";
import { Button } from "@/components/ui/Button";

export function SurahRangeEditor({
  ranges,
  onChange,
}: {
  ranges: SurahRange[];
  onChange: (ranges: SurahRange[]) => void;
}) {
  const { surahs, loading, getAyahCount } = useSurahIndex();

  const updateRange = (id: string, patch: Partial<SurahRange>) => {
    onChange(
      ranges.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...patch };
        const ayahCount = getAyahCount(next.surah);
        if (ayahCount) {
          if (next.endAyah > ayahCount) next.endAyah = ayahCount;
          if (next.startAyah > ayahCount) next.startAyah = 1;
        }
        return next;
      }),
    );
  };

  const removeRange = (id: string) => {
    if (ranges.length <= 1) return;
    onChange(ranges.filter((r) => r.id !== id));
  };

  const addRange = () => {
    const last = ranges[ranges.length - 1];
    const surah = last?.surah ?? 1;
    const ayahCount = getAyahCount(surah) ?? 7;
    onChange([
      ...ranges,
      {
        id: `range-${Date.now()}`,
        surah,
        startAyah: 1,
        endAyah: Math.min(10, ayahCount),
      },
    ]);
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading surahs…</p>;
  }

  return (
    <div className="space-y-4">
      {ranges.map((range, index) => {
        const meta = surahs.find((s) => s.number === range.surah);
        const ayahCount = meta?.ayahCount ?? 0;
        const valid = ayahCount > 0 && validateRange(range, ayahCount);
        const verseCount = valid ? range.endAyah - range.startAyah + 1 : 0;

        return (
          <div
            key={range.id}
            className="rounded-lg border border-border bg-stone-50/50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted">
                Passage {index + 1}
              </span>
              {ranges.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRange(range.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <label className="block text-sm text-muted">Surah</label>
            <select
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
              value={range.surah}
              onChange={(e) =>
                updateRange(range.id, { surah: Number(e.target.value) })
              }
            >
              {surahs.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.nameEn} ({s.number}) — {s.ayahCount} ayahs
                </option>
              ))}
            </select>

            <div className="mt-3 flex gap-3">
              <label className="flex-1 text-sm">
                From ayah
                <input
                  type="number"
                  min={1}
                  max={ayahCount || undefined}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5"
                  value={range.startAyah}
                  onChange={(e) =>
                    updateRange(range.id, {
                      startAyah: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label className="flex-1 text-sm">
                To ayah
                <input
                  type="number"
                  min={range.startAyah}
                  max={ayahCount || undefined}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5"
                  value={range.endAyah}
                  onChange={(e) =>
                    updateRange(range.id, { endAyah: Number(e.target.value) })
                  }
                />
              </label>
            </div>

            <p className="mt-2 text-xs text-muted">
              {valid ? `${verseCount} verses` : "Invalid range"}
            </p>
          </div>
        );
      })}

      <Button type="button" variant="secondary" className="w-full" onClick={addRange}>
        + Add another surah
      </Button>
    </div>
  );
}
