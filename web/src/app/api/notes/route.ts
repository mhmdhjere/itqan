import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { guardSession, guardStudent } from "@/lib/api/guards";
import { createNote, listNotesForRef } from "@/lib/queries/notes";
import { createNoteSchema } from "@/lib/validations/notes";

export async function GET(request: Request) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") as
    | "verse"
    | "session"
    | "student"
    | null;
  const refId = searchParams.get("refId");

  if (!scope || !refId) {
    return badRequest("scope and refId are required");
  }

  if (scope === "student") {
    const denied = await guardStudent(refId, authResult.teacherId);
    if (denied) return denied;
  } else if (scope === "session") {
    const denied = await guardSession(refId, authResult.teacherId);
    if (denied) return denied;
  }

  const notes = await listNotesForRef(scope, refId, authResult.teacherId);
  if (notes === null) return notFound();

  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid note");
  }

  if (parsed.data.scope === "verse") {
    return badRequest("Verse notes are saved via session verse updates");
  }

  if (parsed.data.scope === "student") {
    const denied = await guardStudent(parsed.data.refId, authResult.teacherId);
    if (denied) return denied;
  } else if (parsed.data.scope === "session") {
    const denied = await guardSession(parsed.data.refId, authResult.teacherId);
    if (denied) return denied;
  }

  const note = await createNote(
    parsed.data.scope,
    parsed.data.refId,
    parsed.data.body,
    authResult.teacherId,
  );

  if (!note) return notFound();

  return NextResponse.json({ note }, { status: 201 });
}
