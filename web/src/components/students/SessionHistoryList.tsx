import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate, formatSurahRange } from "@/lib/format";
import type { SessionListItemDto } from "@/lib/queries/sessions";

function formatPassages(
  passages: SessionListItemDto["passages"],
): string {
  if (passages.length === 0) return "—";
  if (passages.length === 1) {
    const p = passages[0];
    return formatSurahRange(p.surah, p.startAyah, p.endAyah);
  }
  return `${passages.length} passages`;
}

export function SessionHistoryList({
  sessions,
  studentId,
  limit,
}: {
  sessions: SessionListItemDto[];
  studentId: string;
  limit?: number;
}) {
  const items = limit ? sessions.slice(0, limit) : sessions;

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        No sessions recorded yet. Start a live session to begin tracking.
      </p>
    );
  }

  return (
    <ul className="mt-3 divide-y divide-border">
      {items.map((session) => (
        <li key={session.id} className="py-3 first:pt-0 last:pb-0">
          <Link
            href={`/session/${session.id}/summary`}
            className="flex items-center justify-between gap-3 hover:text-accent"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {formatPassages(session.passages)}
              </p>
              <p className="text-xs text-muted">
                {session.endedAt
                  ? formatRelativeDate(session.endedAt)
                  : "In progress"}
                {session.exceptionCount > 0 &&
                  ` · ${session.exceptionCount} exceptions`}
              </p>
            </div>
            {session.masteryScore !== null && (
              <span className="shrink-0 text-sm font-semibold text-accent">
                {session.masteryScore}%
              </span>
            )}
          </Link>
        </li>
      ))}
      {limit && sessions.length > limit && (
        <li className="pt-2">
          <Link
            href={`/students/${studentId}/history`}
            className="text-sm text-accent hover:underline"
          >
            See all {sessions.length} sessions
          </Link>
        </li>
      )}
    </ul>
  );
}

export function SessionHistoryEmpty() {
  return (
    <Card className="text-center">
      <p className="text-sm text-muted">
        No sessions recorded yet. Complete a live session to see history here.
      </p>
    </Card>
  );
}
