"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/format";

type TimelineEvent = {
  type: string;
  occurredAt: string;
  title: string;
  description?: string;
};

type HeatmapDay = { date: string; sessionCount: number };

export function TimelinePage({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [byMonth, setByMonth] = useState<
    { month: string; events: TimelineEvent[] }[]
  >([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `/api/students/${studentId}/timeline${showHeatmap ? "?include=heatmap" : ""}`;
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setByMonth(data.timeline?.byMonth ?? []);
        if (data.timeline?.heatmap) setHeatmap(data.timeline.heatmap);
      })
      .finally(() => setLoading(false));
  }, [studentId, showHeatmap]);

  const maxCount = Math.max(1, ...heatmap.map((d) => d.sessionCount));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <Link
        href={`/students/${studentId}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← {studentName}
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Progress timeline</h1>
        <button
          type="button"
          onClick={() => setShowHeatmap((v) => !v)}
          className="text-sm text-accent hover:underline"
        >
          {showHeatmap ? "Hide" : "Show"} activity heatmap
        </button>
      </div>

      {showHeatmap && heatmap.length > 0 && (
        <Card className="mt-4 overflow-x-auto">
          <p className="mb-2 text-xs text-muted">Sessions per day (12 months)</p>
          <div className="flex flex-wrap gap-0.5">
            {heatmap.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.sessionCount} sessions`}
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor:
                    day.sessionCount === 0
                      ? "#f5f5f4"
                      : `rgba(13, 92, 75, ${0.2 + (day.sessionCount / maxCount) * 0.8})`,
                }}
              />
            ))}
          </div>
        </Card>
      )}

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : byMonth.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-muted">No milestones yet.</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-6">
          {byMonth.map((group) => (
            <section key={group.month}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {new Date(`${group.month}-01`).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <ul className="mt-3 space-y-3 border-l-2 border-accent/30 pl-4">
                {group.events.map((ev, i) => (
                  <li key={`${ev.occurredAt}-${i}`}>
                    <p className="font-medium">{ev.title}</p>
                    {ev.description && (
                      <p className="text-sm text-muted">{ev.description}</p>
                    )}
                    <p className="text-xs text-muted">
                      {formatRelativeDate(ev.occurredAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
