"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

type CategoryPattern = {
  category: string;
  label: string;
  percent: number;
  topSubcategory: { slug: string; label: string; percent: number } | null;
  trendDelta: number | null;
};

export function InsightsPage({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [categories, setCategories] = useState<CategoryPattern[]>([]);
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/students/${studentId}/weakness-patterns?days=${days}`)
      .then((res) => res.json())
      .then((data) => setCategories(data.patterns?.categories ?? []))
      .finally(() => setLoading(false));
  }, [studentId, days]);

  const topMem = categories.find((c) => c.category === "memorization");
  const topTaj = categories.find((c) => c.category === "tajweed");
  const topBeh = categories.find((c) => c.category === "behavior");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <Link
        href={`/students/${studentId}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← {studentName}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Weakness patterns</h1>

      <div className="mt-4 flex gap-2">
        {[30, 90, 365].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-full px-3 py-1 text-sm ${
              days === d
                ? "bg-accent text-white"
                : "bg-stone-100 text-stone-700"
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : categories.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-muted">No mistake patterns yet.</p>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HighlightCard
              title="Memorization"
              item={topMem?.topSubcategory}
              percent={topMem?.percent}
              trend={topMem?.trendDelta}
            />
            <HighlightCard
              title="Tajweed"
              item={topTaj?.topSubcategory}
              percent={topTaj?.percent}
              trend={topTaj?.trendDelta}
            />
            <HighlightCard
              title="Behavior"
              item={topBeh?.topSubcategory}
              percent={topBeh?.percent}
              trend={topBeh?.trendDelta}
            />
          </div>

          <Card className="mt-6 space-y-4">
            <h2 className="font-semibold">By category</h2>
            {categories.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between text-sm">
                  <span>{cat.label}</span>
                  <span className="font-medium">{cat.percent}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
                {cat.topSubcategory && (
                  <p className="mt-1 text-xs text-muted">
                    Top: {cat.topSubcategory.label} ({cat.topSubcategory.percent}
                    %)
                    {cat.trendDelta !== null && (
                      <span
                        className={
                          cat.trendDelta > 0 ? "text-amber-600" : "text-emerald-600"
                        }
                      >
                        {" "}
                        {cat.trendDelta > 0 ? "▲" : "▼"} {Math.abs(cat.trendDelta)}
                        %
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

function HighlightCard({
  title,
  item,
  percent,
  trend,
}: {
  title: string;
  item?: { label: string } | null;
  percent?: number;
  trend?: number | null;
}) {
  return (
    <Card className="text-center">
      <p className="text-xs text-muted">{title}</p>
      <p className="mt-1 text-sm font-semibold">
        {item?.label ?? "—"}
      </p>
      {percent !== undefined && (
        <p className="text-lg font-bold text-accent">{percent}%</p>
      )}
      {trend !== null && trend !== undefined && (
        <p className="text-xs text-muted">
          {trend > 0 ? "+" : ""}
          {trend}% vs prior period
        </p>
      )}
    </Card>
  );
}
