"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { SessionMasteryChart } from "@/components/session/SessionMasteryChart";
import { AiSummaryCard } from "@/components/insights/AiSummaryCard";
import { SessionTypeBadge } from "@/components/insights/SessionTypeBadge";
import { SessionNoteSection } from "@/components/session/SessionNoteSection";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useActiveConfig } from "@/lib/hooks/useActiveConfig";
import { useSurahIndex } from "@/lib/hooks/useSurahIndex";
import { useSession } from "@/lib/hooks/useSession";
import { useStudent } from "@/lib/hooks/useStudent";
import { formatRangesLabel, passagesToRanges } from "@/lib/session-ranges";
import type { VerseStatusSlug } from "@/lib/types";
import { getStatusBorderColor } from "@/lib/utils";

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins} min`;
}

function SummaryContent() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const { session, loading, notFound } = useSession(sessionId);
  const { config } = useActiveConfig();
  const { getSurahName } = useSurahIndex();
  const studentId = session?.studentId ?? null;
  const { student } = useStudent(studentId);
  const [showMarked, setShowMarked] = useState(false);

  if (loading) {
    return <p className="p-8 text-center text-muted">Loading summary…</p>;
  }

  if (notFound || !session?.summary) {
    return (
      <div className="p-8 text-center">
        <p>Session summary not found.</p>
        <Button href="/circles" className="mt-4">
          Back to circles
        </Button>
      </div>
    );
  }

  const summary = session.summary;
  const ranges = passagesToRanges(session.passages);
  const rangeLabel = formatRangesLabel(ranges, getSurahName);

  const statusLabel = (slug: string) =>
    config?.verseStatuses.find((s) => s.slug === slug)?.labelEn ?? slug;

  const mistakeLabel = (slug: string) =>
    config?.mistakeSubcategories.find((s) => s.slug === slug)?.labelEn ?? slug;

  const totalMistakes = summary.mistakeBreakdown.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-semibold">
          Session complete
          <SessionTypeBadge sessionType={session.sessionType} />
        </h1>
        <p className="mt-1 text-sm text-muted">
          {formatDuration(session.durationSeconds)} · {rangeLabel}
        </p>
      </div>

      <Card className="mt-6">
        <h2 className="font-semibold">Session mastery</h2>
        <div className="mt-4">
          <SessionMasteryChart summary={summary} config={config} />
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="py-3 text-center">
          <p className="text-xl font-bold">{summary.versesRecited}</p>
          <p className="text-xs text-muted">Verses</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-xl font-bold">{summary.exceptionCount}</p>
          <p className="text-xs text-muted">Exceptions</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-xl font-bold">{summary.reminderCount}</p>
          <p className="text-xs text-muted">Reminders</p>
        </Card>
        <Card className="py-3 text-center">
          <p className="text-xl font-bold">{summary.promptingCount}</p>
          <p className="text-xs text-muted">Prompts</p>
        </Card>
      </div>

      {summary.mistakeBreakdown.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-semibold">Mistakes by type</h2>
          <div className="mt-3 space-y-2">
            {summary.mistakeBreakdown.map((item) => {
              const percent =
                totalMistakes > 0
                  ? Math.round((item.count / totalMistakes) * 100)
                  : 0;
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{item.category}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <button
          type="button"
          className="flex w-full items-center justify-between font-semibold"
          onClick={() => setShowMarked(!showMarked)}
        >
          Marked verses ({summary.markedVerses.length})
          <span>{showMarked ? "▲" : "▼"}</span>
        </button>
        {showMarked && (
          <ul className="mt-3 space-y-2">
            {summary.markedVerses.map((v) => (
              <li
                key={`${v.surah}:${v.ayah}`}
                className={`rounded-lg border-l-4 px-3 py-2 text-sm ${getStatusBorderColor(v.status as VerseStatusSlug)}`}
              >
                <span className="font-medium">
                  {v.surah}:{v.ayah}
                </span>
                <span className="text-muted"> — {statusLabel(v.status)}</span>
                {v.mistakes.length > 0 && (
                  <span className="block text-xs text-muted">
                    {v.mistakes.map(mistakeLabel).join(", ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <SessionNoteSection sessionId={sessionId} />
      <AiSummaryCard sessionId={sessionId} />

      <div className="mt-6 space-y-3">
        <Button className="w-full" size="lg" href={`/students/${studentId}`}>
          Back to {student?.fullName ?? "student"}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          href={`/session/new?studentId=${studentId}`}
        >
          Start another session
        </Button>
        <Link
          href={`/students/${studentId}/history`}
          className="block text-center text-sm text-accent hover:underline"
        >
          View session history
        </Link>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={<div className="p-8 text-center">Loading summary...</div>}
      >
        <SummaryContent />
      </Suspense>
    </div>
  );
}
