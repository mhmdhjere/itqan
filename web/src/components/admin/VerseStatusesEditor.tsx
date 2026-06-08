"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type VerseStatusRow = {
  id: string;
  slug: string;
  labelEn: string;
  scorePoints: number;
  color: string;
  sortOrder: number;
  isActive: boolean;
  isDefaultImplicit: boolean;
};

export function VerseStatusesEditor() {
  const [statuses, setStatuses] = useState<VerseStatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/verse-statuses")
      .then((res) => res.json())
      .then((data) => setStatuses(data.verseStatuses))
      .finally(() => setLoading(false));
  }, []);

  function updateLocal(id: string, patch: Partial<VerseStatusRow>) {
    setStatuses((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  async function saveRow(row: VerseStatusRow) {
    setSavingId(row.id);
    const res = await fetch(`/api/admin/verse-statuses/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        labelEn: row.labelEn,
        scorePoints: row.scorePoints,
        color: row.color,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
      }),
    });
    setSavingId(null);
    if (res.ok) {
      const data = await res.json();
      updateLocal(row.id, data.verseStatus);
    }
  }

  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <div className="space-y-3">
      {statuses.map((row) => (
        <Card key={row.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted">{row.slug}</span>
            {row.isDefaultImplicit && (
              <span className="text-xs text-accent">Default implicit</span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Label
              <input
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                value={row.labelEn}
                onChange={(e) => updateLocal(row.id, { labelEn: e.target.value })}
              />
            </label>
            <label className="text-sm">
              Score points
              <input
                type="number"
                min={0}
                max={100}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                value={row.scorePoints}
                onChange={(e) =>
                  updateLocal(row.id, { scorePoints: Number(e.target.value) })
                }
              />
            </label>
            <label className="text-sm">
              Color
              <input
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                value={row.color}
                onChange={(e) => updateLocal(row.id, { color: e.target.value })}
              />
            </label>
            <label className="text-sm">
              Sort order
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                value={row.sortOrder}
                onChange={(e) =>
                  updateLocal(row.id, { sortOrder: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={row.isActive}
                disabled={row.isDefaultImplicit}
                onChange={(e) =>
                  updateLocal(row.id, { isActive: e.target.checked })
                }
              />
              Active
            </label>
            <Button
              size="sm"
              disabled={savingId === row.id}
              onClick={() => saveRow(row)}
            >
              {savingId === row.id ? "Saving…" : "Save"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
