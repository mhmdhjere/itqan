import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  mistakes,
  recitationSessions,
  verseRecords,
} from "@/db/schema";
import { getActiveConfig } from "@/lib/config/service";
import {
  aggregateWeaknessPatterns,
  type WeaknessPatternsResult,
} from "@/lib/insights/weakness-patterns";
import { getStudentForTeacher } from "./students";

export async function getWeaknessPatternsForStudent(
  studentId: string,
  teacherId: string,
  days = 90,
): Promise<WeaknessPatternsResult | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const db = getDb();
  const sessions = await db
    .select({ id: recitationSessions.id, endedAt: recitationSessions.endedAt })
    .from(recitationSessions)
    .where(
      and(
        eq(recitationSessions.studentId, studentId),
        isNotNull(recitationSessions.endedAt),
      ),
    )
    .orderBy(desc(recitationSessions.endedAt));

  if (sessions.length === 0) {
    const config = await getActiveConfig();
    return aggregateWeaknessPatterns([], config, days);
  }

  const sessionIds = sessions.map((s) => s.id);
  const endedBySession = new Map(
    sessions.map((s) => [s.id, s.endedAt!.toISOString()]),
  );

  const records = await db
    .select()
    .from(verseRecords)
    .where(inArray(verseRecords.sessionId, sessionIds));

  const recordIds = records.map((r) => r.id);
  const mistakeRows =
    recordIds.length > 0
      ? await db
          .select()
          .from(mistakes)
          .where(inArray(mistakes.verseRecordId, recordIds))
      : [];

  const mistakesByRecord = new Map<string, string[]>();
  for (const m of mistakeRows) {
    const list = mistakesByRecord.get(m.verseRecordId) ?? [];
    list.push(m.subcategorySlug);
    mistakesByRecord.set(m.verseRecordId, list);
  }

  const mistakeRecords = records
    .filter((r) => (mistakesByRecord.get(r.id) ?? []).length > 0)
    .map((r) => ({
      mistakes: mistakesByRecord.get(r.id) ?? [],
      recordedAt: endedBySession.get(r.sessionId) ?? "",
    }));

  const config = await getActiveConfig();
  return aggregateWeaknessPatterns(mistakeRecords, config, days);
}
