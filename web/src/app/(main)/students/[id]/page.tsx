import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MasteryMapThumbnail } from "@/components/mastery/MasteryMapThumbnail";
import { MasteryRing } from "@/components/students/MasteryRing";
import { ReviewRecommendationsInline } from "@/components/students/ReviewRecommendations";
import { ResumeSessionBanner } from "@/components/students/ResumeSessionBanner";
import { SessionHistoryList } from "@/components/students/SessionHistoryList";
import { StudentNotes } from "@/components/students/StudentNotes";
import { getActiveConfig } from "@/lib/config/service";
import { getStudentMasteryMap } from "@/lib/queries/mastery-map";
import { formatRelativeDate, formatSurahRange } from "@/lib/format";
import { getStudentAnalytics } from "@/lib/queries/analytics";
import {
  getMemorizationPlan,
  listReviewTargets,
} from "@/lib/queries/plans";
import {
  getDraftSessionForStudent,
  listStudentSessions,
} from "@/lib/queries/sessions";
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

  const [plan, reviews, sessions, analytics, masteryMap, activeConfig, draftSession] =
    await Promise.all([
      getMemorizationPlan(id, session.user.id),
      listReviewTargets(id, session.user.id),
      listStudentSessions(id, session.user.id, 20),
      getStudentAnalytics(id, session.user.id),
      getStudentMasteryMap(id, session.user.id),
      getActiveConfig(),
      getDraftSessionForStudent(id, session.user.id),
    ]);

  const masteryMapEnabled =
    activeConfig.config.features.mastery_map !== false;
  const reviewAutoEnabled = activeConfig.config.features.review_auto !== false;

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

      {analytics && analytics.totalSessions > 0 && (
        <Card className="mt-6 flex flex-col items-center py-6 sm:flex-row sm:justify-around sm:gap-8">
          <MasteryRing
            percent={analytics.masteryPercent}
            trend={analytics.masteryTrend}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 text-center sm:mt-0">
            {analytics.strongestSurah && (
              <div>
                <p className="text-xs text-muted">Strongest surah</p>
                <p className="text-lg font-bold text-emerald-700">
                  {analytics.strongestSurah.surah}
                </p>
                <p className="text-xs text-muted">
                  {analytics.strongestSurah.score}% avg
                </p>
              </div>
            )}
            {analytics.weakestSurah &&
              analytics.weakestSurah.surah !== analytics.strongestSurah?.surah && (
                <div>
                  <p className="text-xs text-muted">Needs work</p>
                  <p className="text-lg font-bold text-amber-700">
                    {analytics.weakestSurah.surah}
                  </p>
                  <p className="text-xs text-muted">
                    {analytics.weakestSurah.score}% avg
                  </p>
                </div>
              )}
          </div>
        </Card>
      )}

      {draftSession && (
        <ResumeSessionBanner
          sessionId={draftSession.id}
          startedAt={draftSession.startedAt}
          passageLabel={draftSession.passages
            .map((p) =>
              formatSurahRange(p.surah, p.startAyah, p.endAyah),
            )
            .join(", ")}
        />
      )}

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
          <p className="text-2xl font-bold">
            {analytics?.totalVersesRecited ?? "—"}
          </p>
          <p className="text-xs text-muted">Verses recited</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold">
            {analytics?.totalSessions ?? 0}
          </p>
          <p className="text-xs text-muted">Sessions</p>
        </Card>
        <Card className="text-center">
          <p className="text-lg font-bold truncate px-1">
            {analytics?.commonMistake ?? "—"}
          </p>
          <p className="text-xs text-muted">Common mistake</p>
        </Card>
      </div>

      {reviewAutoEnabled && (
        <Card className="mt-4">
          <ReviewRecommendationsInline studentId={id} />
        </Card>
      )}

      {masteryMapEnabled && (
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
          <div className="mt-3">
            {masteryMap ? (
              <MasteryMapThumbnail studentId={id} surahs={masteryMap.surahs} />
            ) : (
              <p className="text-sm text-muted">No map data yet.</p>
            )}
          </div>
        </Card>
      )}

      <div className="mt-4">
        <StudentNotes studentId={id} />
      </div>

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
