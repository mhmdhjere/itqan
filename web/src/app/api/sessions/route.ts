import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { createSession, getSessionPassages } from "@/lib/queries/sessions";
import { createSessionSchema } from "@/lib/validations/session";

export async function POST(request: Request) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid session");
  }

  const session = await createSession(
    parsed.data.studentId,
    authResult.teacherId,
    parsed.data.passages,
    parsed.data.sessionType,
  );

  if (!session) return notFound();

  const passages = await getSessionPassages(session.id);

  return NextResponse.json(
    {
      session: {
        id: session.id,
        studentId: session.studentId,
        startedAt: session.startedAt.toISOString(),
        passages,
      },
    },
    { status: 201 },
  );
}
