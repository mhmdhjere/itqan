"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/format";
import { encodeRanges, newRange } from "@/lib/session-ranges";

type WeakAyah = {
  surah: number;
  ayah: number;
  surahName: string;
  mistakeCount: number;
  persistent: boolean;
  lastMistakeAt: string;
};

type WeakAyahEvent = {
  sessionId: string;
  sessionEndedAt: string;
  statusSlug: string;
  mistakes: string[];
};

export function WeakAyatPage({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [items, setItems] = useState<WeakAyah[]>([]);
  const [selected, setSelected] = useState<{
    surah: number;
    ayah: number;
    events: WeakAyahEvent[];
    surahName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/students/${studentId}/weak-ayat?limit=20`)
      .then((res) => res.json())
      .then((data) => setItems(data.weakAyat ?? []))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (surah: number, ayah: number) => {
    const res = await fetch(
      `/api/students/${studentId}/weak-ayat?surah=${surah}&ayah=${ayah}`,
    );
    if (!res.ok) return;
    const data = await res.json();
    setSelected({
      surah,
      ayah,
      surahName: data.ayah.surahName,
      events: data.ayah.events,
    });
  };

  const generateReview = async () => {
    setGenerating(true);
    const res = await fetch(
      `/api/students/${studentId}/review-sessions/generate`,
      { method: "POST", headers: { "Content-Type": "application/json" } },
    );
    setGenerating(false);
    if (!res.ok) return;
    const data = await res.json();
    const ranges = data.passages.map(
      (p: { surah: number; startAyah: number; endAyah: number }) =>
        newRange(p.surah, p.startAyah, p.endAyah),
    );
    const encoded = encodeRanges(ranges);
    window.location.href = `/session/new?studentId=${studentId}&type=review&ranges=${encoded}`;
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <Link
        href={`/students/${studentId}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← {studentName}
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Weak ayat</h1>
          <p className="text-sm text-muted">
            Ayat with recurring mistakes across sessions.
          </p>
        </div>
        {items.length > 0 && (
          <Button size="sm" onClick={generateReview} disabled={generating}>
            {generating ? "Generating…" : "Generate review"}
          </Button>
        )}
      </div>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-muted">No weak ayat recorded yet.</p>
        </Card>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((item) => (
            <li key={`${item.surah}-${item.ayah}`}>
              <button
                type="button"
                onClick={() => openDetail(item.surah, item.ayah)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left hover:border-accent/40"
              >
                <div>
                  <p className="font-medium">
                    {item.surahName} {item.ayah}
                    {item.persistent && (
                      <span className="ml-2 text-xs text-amber-700">
                        Persistent
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    Last {formatRelativeDate(item.lastMistakeAt)}
                  </p>
                </div>
                <span className="text-lg font-semibold text-accent">
                  {item.mistakeCount}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <Card className="max-h-[80vh] w-full max-w-md overflow-y-auto">
            <h2 className="font-semibold">
              {selected.surahName} {selected.ayah}
            </h2>
            <ul className="mt-4 space-y-3">
              {selected.events.map((ev) => (
                <li key={ev.sessionId} className="text-sm">
                  <Link
                    href={`/session/${ev.sessionId}/summary`}
                    className="font-medium text-accent hover:underline"
                  >
                    {formatRelativeDate(ev.sessionEndedAt)}
                  </Link>
                  <p className="text-muted">{ev.statusSlug.replace(/_/g, " ")}</p>
                  {ev.mistakes.length > 0 && (
                    <p className="text-xs text-muted">
                      {ev.mistakes.join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
