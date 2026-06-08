import { and, desc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  recitationSessions,
  sessionPassages,
  studentMasterySnapshots,
} from "@/db/schema";
import {
  buildActivityHeatmap,
  buildTimelineEvents,
  groupEventsByMonth,
  type HeatmapDay,
  type TimelineEvent,
} from "@/lib/insights/timeline";
import type { SessionSummaryJson } from "@/lib/session-scoring";
import { getStudentForTeacher } from "./students";
import { getSessionPassages } from "./sessions";

export type TimelineDto = {
  events: TimelineEvent[];
  byMonth: { month: string; events: TimelineEvent[] }[];
  heatmap?: HeatmapDay[];
};

export async function getTimelineForStudent(
  studentId: string,
  teacherId: string,
  includeHeatmap = false,
): Promise<TimelineDto | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const db = getDb();
  const sessions = await db
    .select()
    .from(recitationSessions)
    .where(
      and(
        eq(recitationSessions.studentId, studentId),
        isNotNull(recitationSessions.endedAt),
      ),
    )
    .orderBy(desc(recitationSessions.endedAt));

  const sessionInputs = await Promise.all(
    sessions.map(async (s) => {
      const passages = await getSessionPassages(s.id);
      const summary = s.summaryJson as SessionSummaryJson | null;
      return {
        id: s.id,
        endedAt: s.endedAt!.toISOString(),
        sessionType: s.sessionType,
        masteryScore: summary?.masteryScore,
        passages,
      };
    }),
  );

  const snapshots = await db
    .select()
    .from(studentMasterySnapshots)
    .where(eq(studentMasterySnapshots.studentId, studentId));

  const events = buildTimelineEvents(sessionInputs, snapshots);
  const byMonth = groupEventsByMonth(events);

  const result: TimelineDto = { events, byMonth };
  if (includeHeatmap) {
    result.heatmap = buildActivityHeatmap(
      sessions.map((s) => ({ endedAt: s.endedAt!.toISOString() })),
    );
  }

  return result;
}
