import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  mistakes,
  recitationSessions,
  verseRecords,
} from "@/db/schema";
import { getSurahMeta } from "@/lib/quran";
import {
  aggregateAyahMistakes,
  eventsForAyah,
  type AyahMistakeInput,
  type WeakAyahAggregate,
  type WeakAyahEvent,
} from "@/lib/insights/weak-ayat";
import { clusterWeakAyahsIntoRanges } from "@/lib/insights/cluster-ranges";
import { getStudentForTeacher } from "./students";

export type WeakAyahDto = WeakAyahAggregate & {
  surahName: string;
};

export type WeakAyahDetailDto = WeakAyahDto & {
  events: WeakAyahEvent[];
};

async function loadAyahMistakeRecords(
  studentId: string,
): Promise<AyahMistakeInput[]> {
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

  if (sessions.length === 0) return [];

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

  return records.map((r) => ({
    surah: r.surah,
    ayah: r.ayah,
    sessionId: r.sessionId,
    sessionEndedAt: endedBySession.get(r.sessionId) ?? "",
    statusSlug: r.statusSlug,
    mistakes: mistakesByRecord.get(r.id) ?? [],
  }));
}

export async function getWeakAyatForStudent(
  studentId: string,
  teacherId: string,
  limit = 20,
): Promise<WeakAyahDto[] | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const records = await loadAyahMistakeRecords(studentId);
  const aggregated = aggregateAyahMistakes(records).slice(0, limit);

  return aggregated.map((item) => ({
    ...item,
    surahName: getSurahMeta(item.surah).nameEn,
  }));
}

export async function getWeakAyahDetail(
  studentId: string,
  teacherId: string,
  surah: number,
  ayah: number,
): Promise<WeakAyahDetailDto | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const records = await loadAyahMistakeRecords(studentId);
  const aggregated = aggregateAyahMistakes(records).find(
    (a) => a.surah === surah && a.ayah === ayah,
  );
  if (!aggregated) return null;

  return {
    ...aggregated,
    surahName: getSurahMeta(surah).nameEn,
    events: eventsForAyah(records, surah, ayah),
  };
}

export async function generateReviewPassages(
  studentId: string,
  teacherId: string,
  maxAyahs = 10,
) {
  const weak = await getWeakAyatForStudent(studentId, teacherId, maxAyahs);
  if (!weak) return null;

  const passages = clusterWeakAyahsIntoRanges(
    weak.map((w) => ({ surah: w.surah, ayah: w.ayah })),
    (s) => getSurahMeta(s).ayahCount,
    { clusterGap: 50, maxAyahs },
  );

  return { passages, sessionType: "review" as const };
}
