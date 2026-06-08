"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { encodeRanges, newRange } from "@/lib/session-ranges";

function passageLabel(item: PlanItem) {
  if (item.startAyah === item.endAyah) {
    return `${item.surahName} ${item.startAyah}`;
  }
  return `${item.surahName} ${item.startAyah}–${item.endAyah}`;
}

type PlanItem = {
  surah: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  priority: number;
  estimatedMinutes: number;
  reasons: string[];
};

export function ReviewPlanPage({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [today, setToday] = useState<PlanItem[]>([]);
  const [week, setWeek] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/students/${studentId}/review-plan`)
      .then((res) => res.json())
      .then((data) => {
        setToday(data.plan?.today ?? []);
        setWeek(data.plan?.week ?? []);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const startPassage = (item: PlanItem) => {
    const range = newRange(item.surah, item.startAyah, item.endAyah);
    const encoded = encodeRanges([range]);
    window.location.href = `/session/new?studentId=${studentId}&type=review&ranges=${encoded}`;
  };

  const startTodayPlan = () => {
    if (today.length === 0) return;
    const ranges = today.map((item) =>
      newRange(item.surah, item.startAyah, item.endAyah),
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
      <h1 className="mt-4 text-2xl font-semibold">Review plan</h1>
      <p className="text-sm text-muted">
        Prioritized passages for today and this week.
      </p>

      {loading ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : (
        <>
          <Card className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Today&apos;s plan</h2>
              {today.length > 0 && (
                <Button size="sm" onClick={startTodayPlan}>
                  Start today&apos;s plan
                </Button>
              )}
            </div>
            {today.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No review due today.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {today.map((item, i) => (
                  <li
                    key={`${item.surah}-${item.startAyah}`}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {i + 1}. {passageLabel(item)}
                      </p>
                      <p className="text-xs text-muted">
                        Priority {item.priority} · ~{item.estimatedMinutes} min
                      </p>
                      {item.reasons.length > 0 && (
                        <p className="mt-1 text-xs text-accent">
                          {item.reasons.join(" · ")}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => startPassage(item)}
                    >
                      Start
                    </Button>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card className="mt-4">
            <h2 className="font-semibold">This week</h2>
            {week.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No items scheduled.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {week.map((item) => (
                  <li
                    key={`w-${item.surah}-${item.startAyah}`}
                    className="flex justify-between"
                  >
                    <span>{passageLabel(item)}</span>
                    <span className="text-muted">P{item.priority}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
