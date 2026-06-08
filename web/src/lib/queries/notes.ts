import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { notes, recitationSessions } from "@/db/schema";
import { getStudentForTeacher } from "./students";

export type NoteDto = {
  id: string;
  scope: "verse" | "session" | "student";
  refId: string;
  body: string;
  teacherId: string;
  createdAt: string;
};

async function verifyNoteRef(
  scope: "verse" | "session" | "student",
  refId: string,
  teacherId: string,
): Promise<boolean> {
  const db = getDb();

  if (scope === "student") {
    const student = await getStudentForTeacher(refId, teacherId);
    return !!student;
  }

  if (scope === "session") {
    const [row] = await db
      .select({ teacherId: recitationSessions.teacherId })
      .from(recitationSessions)
      .where(eq(recitationSessions.id, refId))
      .limit(1);
    return row?.teacherId === teacherId;
  }

  return false;
}

export async function createNote(
  scope: "verse" | "session" | "student",
  refId: string,
  body: string,
  teacherId: string,
): Promise<NoteDto | null> {
  if (scope === "verse") return null;

  const allowed = await verifyNoteRef(scope, refId, teacherId);
  if (!allowed) return null;

  const db = getDb();
  const [created] = await db
    .insert(notes)
    .values({ scope, refId, body: body.trim(), teacherId })
    .returning();

  return {
    id: created.id,
    scope: created.scope,
    refId: created.refId,
    body: created.body,
    teacherId: created.teacherId,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function listNotesForRef(
  scope: "verse" | "session" | "student",
  refId: string,
  teacherId: string,
): Promise<NoteDto[] | null> {
  const allowed = await verifyNoteRef(scope, refId, teacherId);
  if (!allowed) return null;

  const db = getDb();
  const rows = await db
    .select()
    .from(notes)
    .where(and(eq(notes.scope, scope), eq(notes.refId, refId)))
    .orderBy(desc(notes.createdAt));

  return rows.map((n) => ({
    id: n.id,
    scope: n.scope,
    refId: n.refId,
    body: n.body,
    teacherId: n.teacherId,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function listStudentNotes(
  studentId: string,
  teacherId: string,
): Promise<NoteDto[] | null> {
  return listNotesForRef("student", studentId, teacherId);
}
