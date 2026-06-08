import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeDate, formatSurahRange } from "@/lib/format";
import { SessionHistoryList } from "@/components/students/SessionHistoryList";
import {
  getMemorizationPlan,
  listReviewTargets,
} from "@/lib/queries/plans";
import { listStudentSessions } from "@/lib/queries/sessions";
import { getStudentForTeacher } from "@/lib/queries/students";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const student = await getStudentForTeacher(id, session.user.id);
  if (!student) notFound();

  const [plan, reviews, sessions] = await Promise.all([
    getMemorizationPlan(id, session.user.id),
    listReviewTargets(id, session.user.id),
    listStudentSessions(id, session.user.id, 20),
  ]);

  const sessionCount = sessions?.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Link
        href={`/circles/${student.circleId}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← {student.circleName}
      </Link>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{student.fullName}</h1>
          {student.contactInfo && (
            <p className="text-sm text-muted">{student.contactInfo}</p>
          )}
          {student.archivedAt && (
            <p className="mt-1 text-sm text-amber-700">Archived student</p>
          )}
        </div>
        <div className="text-right text-sm text-muted">
          {student.lastSessionAt
            ? `Last session ${formatRelativeDate(student.lastSessionAt)}`
            : "No sessions yet"}
        </div>
      </div>

      <Button
        href={`/session/new?studentId=${id}`}
        size="lg"
        className="mt-6 w-full sm:w-auto"
      >
        ▶ Start Session
      </Button>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Memorization Plan</h2>
          <Link
            href={`/students/${id}/plan`}
            className="text-sm text-accent hover:underline"
          >
            Edit plan
          </Link>
        </div>
        {plan ? (
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted">Current</dt>
              <dd className="font-medium">
                {formatSurahRange(
                  plan.currentSurah,
                  plan.currentStartAyah,
                  plan.currentEndAyah,
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Next</dt>
              <dd className="font-medium">
                {formatSurahRange(
                  plan.nextSurah,
                  plan.nextStartAyah,
                  plan.nextEndAyah,
                )}
              </dd>
            </div>
            {reviews && reviews.length > 0 && (
              <div>
                <dt className="text-muted">Review</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {reviews.map((r) => (
                    <Badge key={r.id} variant="muted">
                      {formatSurahRange(r.surah, r.startAyah, r.endAyah)}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted">
            No plan configured yet. Set current and next passages on the plan
            page.
          </p>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-muted">Verses recited</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold">{sessionCount}</p>
          <p className="text-xs text-muted">Sessions</p>
        </Card>
        <Card className="text-center">
          <p className="text-lg font-bold">
            {sessions?.[0]?.masteryScore != null
              ? `${sessions[0].masteryScore}%`
              : "—"}
          </p>
          <p className="text-xs text-muted">Last session</p>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Mastery Map</h2>
          <Link
            href={`/students/${id}/mastery-map`}
            className="text-sm text-accent hover:underline"
          >
            Open full map
          </Link>
        </div>
        <p className="mt-2 text-sm text-muted">
          Available after session data is recorded (Milestone 3).
        </p>
      </Card>

      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Sessions</h2>
          <Link
            href={`/students/${id}/history`}
            className="text-sm text-accent hover:underline"
          >
            See all
          </Link>
        </div>
        {sessions && sessions.length > 0 ? (
          <SessionHistoryList
            sessions={sessions}
            studentId={id}
            limit={3}
          />
        ) : (
          <p className="mt-2 text-sm text-muted">
            No sessions recorded yet. Start a live session to begin tracking.
          </p>
        )}
      </Card>
    </div>
  );
}
