"use client";

import type { ActiveConfig } from "@/lib/config/types";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function DetailPanel({
  surahName,
  ayah,
  ayahSnippet,
  selectedMistakes,
  note,
  activeConfig,
  onToggleMistake,
  onNoteChange,
  onDone,
  onClose,
}: {
  surahName: string;
  ayah: number;
  ayahSnippet: string;
  selectedMistakes: string[];
  note: string;
  activeConfig: ActiveConfig | null;
  onToggleMistake: (slug: string) => void;
  onNoteChange: (note: string) => void;
  onDone: () => void;
  onClose: () => void;
}) {
  const trapRef = useFocusTrap(true);
  const reducedMotion = useReducedMotion();
  const categories = activeConfig?.mistakeCategories ?? [];
  const subcategories = activeConfig?.mistakeSubcategories ?? [];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 lg:bg-black/10"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={trapRef}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-surface shadow-xl lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[360px] lg:max-h-none lg:rounded-none lg:rounded-l-2xl",
          !reducedMotion && "transition-transform duration-200 ease-out",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Verse detail: ${surahName} ayah ${ayah}`}
      >
        <div className="sticky top-0 border-b border-border bg-surface px-4 py-3">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-stone-300 lg:hidden" />
          <p className="text-sm font-medium">
            Ayah {ayah} · {surahName}
          </p>
          <p
            className="font-quran mt-1 truncate text-right text-base text-stone-700"
            dir="rtl"
          >
            {ayahSnippet}
          </p>
        </div>

        <div className="space-y-4 p-4">
          {categories.length === 0 ? (
            <p className="text-sm text-muted">Loading mistake types…</p>
          ) : (
            categories.map((cat) => {
              const chips = subcategories.filter(
                (m) => m.categorySlug === cat.slug,
              );
              return (
                <div key={cat.slug}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    {cat.labelEn}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => {
                      const active = selectedMistakes.includes(chip.slug);
                      return (
                        <button
                          key={chip.slug}
                          type="button"
                          onClick={() => onToggleMistake(chip.slug)}
                          aria-pressed={active}
                          className={`h-10 rounded-full px-3 text-sm transition-colors ${
                            active
                              ? "bg-accent text-white"
                              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                          }`}
                        >
                          {chip.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          <div>
            <label
              htmlFor="verse-note"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Note
            </label>
            <textarea
              id="verse-note"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              placeholder="Optional note for this ayah…"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onDone}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
