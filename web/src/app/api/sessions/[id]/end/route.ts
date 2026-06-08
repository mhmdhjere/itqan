import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, forbidden, notFound } from "@/lib/api/errors";
import { endSession } from "@/lib/queries/sessions";
import { endSessionSchema } from "@/lib/validations/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = endSessionSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const result = await endSession(
    id,
    authResult.teacherId,
    parsed.data.durationSeconds,
  );

  if ("error" in result) {
    if (result.error === "forbidden") return forbidden();
    return notFound();
  }

  return NextResponse.json({
    summary: result.summary,
    durationSeconds: result.durationSeconds,
  });
}
