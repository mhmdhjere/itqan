"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

type WeakAyah = {
  surah: number;
  ayah: number;
  surahName: string;
  mistakeCount: number;
  persistent: boolean;
};

export function WeakAyatWidget({ studentId }: { studentId: string }) {
  const [items, setItems] = useState<WeakAyah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/students/${studentId}/weak-ayat?limit=3`)
      .then((res) => (res.ok ? res.json() : { weakAyat: [] }))
      .then((data) => setItems(data.weakAyat ?? []))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return <p className="text-sm text-muted">Loading weak ayat…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        No recurring weak ayat yet. Keep recording sessions.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={`${item.surah}-${item.ayah}`}
          className="flex items-center justify-between text-sm"
        >
          <span>
            {item.surahName} {item.ayah}
            {item.persistent && (
              <span className="ml-1 text-amber-600" title="Persistent weak ayah">
                ●
              </span>
            )}
          </span>
          <span className="font-medium text-accent">
            {item.mistakeCount} mistakes
          </span>
        </li>
      ))}
      <li>
        <Link
          href={`/students/${studentId}/weak-ayat`}
          className="text-sm text-accent hover:underline"
        >
          View all weak ayat →
        </Link>
      </li>
    </ul>
  );
}
