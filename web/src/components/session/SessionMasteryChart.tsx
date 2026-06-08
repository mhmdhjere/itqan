"use client";

import type { SessionSummaryJson } from "@/lib/session-scoring";
import type { ActiveConfig } from "@/lib/config/types";

export function SessionMasteryChart({
  summary,
  config,
}: {
  summary: SessionSummaryJson;
  config: ActiveConfig | null;
}) {
  const statusCounts = [
    {
      slug: "reminder_required",
      count: summary.reminderCount,
      color: "#f59e0b",
    },
    {
      slug: "second_attempt",
      count: summary.secondAttemptCount,
      color: "#f97316",
    },
    {
      slug: "third_attempt",
      count: summary.thirdAttemptCount,
      color: "#ef4444",
    },
    {
      slug: "prompting_required",
      count: summary.promptingCount,
      color: "#dc2626",
    },
    {
      slug: "incomplete",
      count: summary.incompleteCount,
      color: "#9f1239",
    },
  ].filter((s) => s.count > 0);

  const correctCount = summary.versesRecited - summary.exceptionCount;
  const maxCount = Math.max(
    correctCount,
    ...statusCounts.map((s) => s.count),
    1,
  );

  const label = (slug: string) =>
    config?.verseStatuses.find((s) => s.slug === slug)?.labelEn ??
    slug.replace(/_/g, " ");

  const bars = [
    { label: "Correct (implicit)", count: correctCount, color: "#0d5c4b" },
    ...statusCounts.map((s) => ({
      label: label(s.slug),
      count: s.count,
      color: s.color,
    })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div className="flex-1">
          <div className="flex h-24 items-end gap-1">
            {bars.map((bar) => (
              <div
                key={bar.label}
                className="flex flex-1 flex-col items-center justify-end"
              >
                <span className="mb-1 text-xs font-medium text-foreground">
                  {bar.count}
                </span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${(bar.count / maxCount) * 100}%`,
                    minHeight: bar.count > 0 ? "4px" : "0",
                    backgroundColor: bar.color,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            {bars.map((bar) => (
              <p
                key={bar.label}
                className="flex-1 text-center text-[10px] leading-tight text-muted"
              >
                {bar.label}
              </p>
            ))}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-3xl font-bold text-accent">{summary.masteryScore}%</p>
          <p className="text-xs text-muted">weighted avg</p>
        </div>
      </div>
    </div>
  );
}
