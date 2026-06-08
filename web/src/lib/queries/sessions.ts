import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  circles,
  mistakes,
  notes,
  recitationSessions,
  sessionPassages,
  students,
  verseRecords,
} from "@/db/schema";
import { getActiveConfig } from "@/lib/config/service";
import { computeSessionSummary } from "@/lib/session-scoring";
import { passagesToRanges, verseKey } from "@/lib/session-ranges";
import type { VerseMark } from "@/lib/types";
import { isSessionMutable } from "@/lib/session-immutability";
import { refreshMasterySnapshotsForSession } from "./mastery-snapshots";
import { getStudentForTeacher } from "./students";
import { checkSessionOwnership } from "@/lib/api/ownership";

export type SessionPassageDto = {
  surah: number;
  startAyah: number;
  endAyah: number;
  sortOrder: number;
};

export type SessionListItemDto = {
  id: string;
  studentId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  exceptionCount: number;
  masteryScore: number | null;
  passages: SessionPassageDto[];
};

export type SessionDetailDto = {
  id: string;
  studentId: string;
  circleId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  passages: SessionPassageDto[];
  marks: Record<string, VerseMark>;
  summary: ReturnType<typeof computeSessionSummary> | null;
};

async function getOwnedSession(sessionId: string, teacherId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      session: recitationSessions,
      circleId: students.circleId,
    })
    .from(recitationSessions)
    .innerJoin(students, eq(students.id, recitationSessions.studentId))
    .innerJoin(circles, eq(circles.id, students.circleId))
    .where(
      and(
        eq(recitationSessions.id, sessionId),
        eq(recitationSessions.teacherId, teacherId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function createSession(
  studentId: string,
  teacherId: string,
  passages: { surah: number; startAyah: number; endAyah: number }[],
) {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const db = getDb();
  const [session] = await db
    .insert(recitationSessions)
    .values({
      studentId,
      circleId: student.circleId,
      teacherId,
    })
    .returning();

  await db.insert(sessionPassages).values(
    passages.map((p, i) => ({
      sessionId: session.id,
      sortOrder: i,
      surah: p.surah,
      startAyah: p.startAyah,
      endAyah: p.endAyah,
    })),
  );

  return session;
}

export async function getSessionPassages(
  sessionId: string,
): Promise<SessionPassageDto[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(sessionPassages)
    .where(eq(sessionPassages.sessionId, sessionId))
    .orderBy(sessionPassages.sortOrder);

  return rows.map((r) => ({
    surah: r.surah,
    startAyah: r.startAyah,
    endAyah: r.endAyah,
    sortOrder: r.sortOrder,
  }));
}

export async function loadSessionMarks(
  sessionId: string,
): Promise<Record<string, VerseMark>> {
  const db = getDb();
  const records = await db
    .select()
    .from(verseRecords)
    .where(eq(verseRecords.sessionId, sessionId));

  if (records.length === 0) return {};

  const recordIds = records.map((r) => r.id);
  const mistakeRows = await db
    .select()
    .from(mistakes)
    .where(inArray(mistakes.verseRecordId, recordIds));

  const noteRows = await db
    .select()
    .from(notes)
    .where(
      and(eq(notes.scope, "verse"), inArray(notes.refId, recordIds)),
    );

  const mistakesByRecord = new Map<string, string[]>();
  for (const m of mistakeRows) {
    const list = mistakesByRecord.get(m.verseRecordId) ?? [];
    list.push(m.subcategorySlug);
    mistakesByRecord.set(m.verseRecordId, list);
  }

  const noteByRecord = new Map(
    noteRows.map((n) => [n.refId, n.body]),
  );

  const marks: Record<string, VerseMark> = {};
  for (const record of records) {
    const key = verseKey(record.surah, record.ayah);
    marks[key] = {
      surah: record.surah,
      ayah: record.ayah,
      status: record.statusSlug as VerseMark["status"],
      mistakes: mistakesByRecord.get(record.id) ?? [],
      note: noteByRecord.get(record.id),
    };
  }

  return marks;
}

export async function getSessionDetail(
  sessionId: string,
  teacherId: string,
): Promise<SessionDetailDto | null> {
  const owned = await getOwnedSession(sessionId, teacherId);
  if (!owned) return null;

  const passages = await getSessionPassages(sessionId);
  const marks = await loadSessionMarks(sessionId);
  const summaryJson = owned.session.summaryJson as ReturnType<
    typeof computeSessionSummary
  > | null;

  return {
    id: owned.session.id,
    studentId: owned.session.studentId,
    circleId: owned.session.circleId,
    startedAt: owned.session.startedAt.toISOString(),
    endedAt: owned.session.endedAt?.toISOString() ?? null,
    durationSeconds: owned.session.durationSeconds,
    passages,
    marks,
    summary: summaryJson,
  };
}

export type BatchUpdateResult =
  | { ok: true }
  | { error: "not_found" | "forbidden" | "ended" | "immutable" };

export async function batchUpdateVerses(
  sessionId: string,
  teacherId: string,
  verses: {
    surah: number;
    ayah: number;
    statusSlug: string;
    mistakes?: string[];
    note?: string | null;
  }[],
): Promise<BatchUpdateResult> {
  const access = await checkSessionOwnership(sessionId, teacherId);
  if (access === "not_found") return { error: "not_found" };
  if (access === "forbidden") return { error: "forbidden" };

  const owned = await getOwnedSession(sessionId, teacherId);
  if (!owned) return { error: "not_found" };
  if (owned.session.endedAt) return { error: "ended" };

  const config = await getActiveConfig();
  if (
    !isSessionMutable(
      owned.session.startedAt,
      owned.session.endedAt,
      config,
    )
  ) {
    return { error: "immutable" };
  }

  const db = getDb();

  for (const verse of verses) {
    const [existing] = await db
      .select()
      .from(verseRecords)
      .where(
        and(
          eq(verseRecords.sessionId, sessionId),
          eq(verseRecords.surah, verse.surah),
          eq(verseRecords.ayah, verse.ayah),
        ),
      )
      .limit(1);

    let recordId: string;
    if (existing) {
      await db
        .update(verseRecords)
        .set({
          statusSlug: verse.statusSlug,
          updatedAt: new Date(),
        })
        .where(eq(verseRecords.id, existing.id));
      recordId = existing.id;
      await db
        .delete(mistakes)
        .where(eq(mistakes.verseRecordId, existing.id));
    } else {
      const [created] = await db
        .insert(verseRecords)
        .values({
          sessionId,
          surah: verse.surah,
          ayah: verse.ayah,
          statusSlug: verse.statusSlug,
        })
        .returning();
      recordId = created.id;
    }

    const mistakeSlugs = verse.mistakes ?? [];
    if (mistakeSlugs.length > 0) {
      await db.insert(mistakes).values(
        mistakeSlugs.map((slug) => ({
          verseRecordId: recordId,
          subcategorySlug: slug,
        })),
      );
    }

    const [existingNote] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.scope, "verse"), eq(notes.refId, recordId)))
      .limit(1);

    if (verse.note?.trim()) {
      if (existingNote) {
        await db
          .update(notes)
          .set({ body: verse.note.trim() })
          .where(eq(notes.id, existingNote.id));
      } else {
        await db.insert(notes).values({
          scope: "verse",
          refId: recordId,
          body: verse.note.trim(),
          teacherId,
        });
      }
    } else if (existingNote) {
      await db.delete(notes).where(eq(notes.id, existingNote.id));
    }
  }

  return { ok: true };
}

export type EndSessionResult =
  | { summary: ReturnType<typeof computeSessionSummary>; durationSeconds: number }
  | { error: "not_found" | "forbidden" | "ended" };

export async function endSession(
  sessionId: string,
  teacherId: string,
  durationSeconds?: number,
): Promise<EndSessionResult> {
  const access = await checkSessionOwnership(sessionId, teacherId);
  if (access === "not_found") return { error: "not_found" };
  if (access === "forbidden") return { error: "forbidden" };

  const owned = await getOwnedSession(sessionId, teacherId);
  if (!owned) return { error: "not_found" };
  if (owned.session.endedAt) return { error: "ended" };

  const passages = await getSessionPassages(sessionId);
  const ranges = passagesToRanges(passages);
  const marks = await loadSessionMarks(sessionId);
  const config = await getActiveConfig();
  const summary = computeSessionSummary(ranges, marks, config);

  const db = getDb();
  const endedAt = new Date();
  const duration =
    durationSeconds ??
    Math.floor(
      (endedAt.getTime() - owned.session.startedAt.getTime()) / 1000,
    );

  await db
    .update(recitationSessions)
    .set({
      endedAt,
      durationSeconds: duration,
      summaryJson: summary,
    })
    .where(eq(recitationSessions.id, sessionId));

  const affectedAyahs: { surah: number; ayah: number }[] = [];
  for (const passage of passages) {
    for (let ayah = passage.startAyah; ayah <= passage.endAyah; ayah++) {
      affectedAyahs.push({ surah: passage.surah, ayah });
    }
  }
  await refreshMasterySnapshotsForSession(
    owned.session.studentId,
    affectedAyahs,
  );

  return { summary, durationSeconds: duration };
}

export async function listStudentSessions(
  studentId: string,
  teacherId: string,
  limit = 20,
): Promise<SessionListItemDto[] | null> {
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
    .orderBy(desc(recitationSessions.endedAt))
    .limit(limit);

  const result: SessionListItemDto[] = [];
  for (const session of sessions) {
    const passages = await getSessionPassages(session.id);
    const summary = session.summaryJson as {
      exceptionCount?: number;
      masteryScore?: number;
    } | null;

    result.push({
      id: session.id,
      studentId: session.studentId,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString() ?? null,
      durationSeconds: session.durationSeconds,
      exceptionCount: summary?.exceptionCount ?? 0,
      masteryScore: summary?.masteryScore ?? null,
      passages,
    });
  }

  return result;
}

export async function getDraftSessionForStudent(
  studentId: string,
  teacherId: string,
): Promise<SessionListItemDto | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const db = getDb();
  const [session] = await db
    .select()
    .from(recitationSessions)
    .where(
      and(
        eq(recitationSessions.studentId, studentId),
        isNull(recitationSessions.endedAt),
      ),
    )
    .orderBy(desc(recitationSessions.startedAt))
    .limit(1);

  if (!session) return null;

  const passages = await getSessionPassages(session.id);
  return {
    id: session.id,
    studentId: session.studentId,
    startedAt: session.startedAt.toISOString(),
    endedAt: null,
    durationSeconds: session.durationSeconds,
    exceptionCount: 0,
    masteryScore: null,
    passages,
  };
}
