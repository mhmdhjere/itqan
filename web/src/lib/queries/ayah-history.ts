import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  mistakes,
  recitationSessions,
  sessionPassages,
  verseRecords,
} from "@/db/schema";
import type { AyahRecitationRecord } from "@/lib/mastery/scoring";
import { verseKey } from "@/lib/session-ranges";

export async function buildAyahHistory(
  studentId: string,
  limit = 50,
): Promise<AyahRecitationRecord[]> {
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
    .orderBy(desc(recitationSessions.endedAt))
    .limit(limit);

  if (sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id);
  const passages = await db
    .select()
    .from(sessionPassages)
    .where(inArray(sessionPassages.sessionId, sessionIds))
    .orderBy(sessionPassages.sortOrder);

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

  const recordsBySessionAyah = new Map<string, (typeof records)[0]>();
  for (const record of records) {
    recordsBySessionAyah.set(
      `${record.sessionId}:${verseKey(record.surah, record.ayah)}`,
      record,
    );
  }

  const passagesBySession = new Map<string, typeof passages>();
  for (const p of passages) {
    const list = passagesBySession.get(p.sessionId) ?? [];
    list.push(p);
    passagesBySession.set(p.sessionId, list);
  }

  const history: AyahRecitationRecord[] = [];

  for (const session of sessions) {
    const sessionPassagesList = passagesBySession.get(session.id) ?? [];
    const endedAt = session.endedAt!.toISOString();

    for (const passage of sessionPassagesList) {
      for (let ayah = passage.startAyah; ayah <= passage.endAyah; ayah++) {
        const key = `${session.id}:${verseKey(passage.surah, ayah)}`;
        const record = recordsBySessionAyah.get(key);

        history.push({
          sessionId: session.id,
          sessionEndedAt: endedAt,
          surah: passage.surah,
          ayah,
          statusSlug: record?.statusSlug ?? "correct",
          mistakes: record
            ? (mistakesByRecord.get(record.id) ?? [])
            : [],
        });
      }
    }
  }

  return history;
}
