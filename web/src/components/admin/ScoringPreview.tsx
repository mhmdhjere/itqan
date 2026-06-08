"use client";

import { useEffect, useState } from "react";
import { useActiveConfig } from "@/lib/hooks/useActiveConfig";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ScoringPreview() {
  const { config, loading } = useActiveConfig();
  const [statusSlug, setStatusSlug] = useState("second_attempt");
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (config?.verseStatuses.length) {
      setStatusSlug(config.verseStatuses[1]?.slug ?? "second_attempt");
    }
  }, [config]);

  const runPreview = async () => {
    setPreviewing(true);
    try {
      const res = await fetch("/api/admin/scoring-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusSlug, mistakes: selectedMistakes }),
      });
      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
      }
    } finally {
      setPreviewing(false);
    }
  };

  if (loading) return <p className="text-muted">Loading config…</p>;

  const subcategories = config?.mistakeSubcategories ?? [];

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <div>
          <label className="text-sm font-medium">Verse status</label>
          <select
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            value={statusSlug}
            onChange={(e) => setStatusSlug(e.target.value)}
          >
            {config?.verseStatuses.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.labelEn} ({s.scorePoints} pts)
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium">Mistake tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {subcategories.map((chip) => {
              const active = selectedMistakes.includes(chip.slug);
              return (
                <button
                  key={chip.slug}
                  type="button"
                  onClick={() =>
                    setSelectedMistakes((prev) =>
                      prev.includes(chip.slug)
                        ? prev.filter((s) => s !== chip.slug)
                        : [...prev, chip.slug],
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
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

        <Button onClick={runPreview} disabled={previewing}>
          {previewing ? "Calculating…" : "Calculate score"}
        </Button>
      </Card>

      <Card className="flex flex-col items-center justify-center py-8 text-center">
        {score !== null ? (
          <>
            <p className="text-5xl font-bold text-accent">{score}</p>
            <p className="mt-2 text-sm text-muted">verse score (0–100)</p>
            <p className="mt-4 text-xs text-muted">
              Penalty:{" "}
              {(config?.config.mastery.mistake_penalty as number) ?? 5} pts per
              mistake tag
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">
            Select a status and optional mistakes, then calculate.
          </p>
        )}
      </Card>
    </div>
  );
}
