import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { batchUpdateVerses } from "@/lib/queries/sessions";
import { batchVersesSchema } from "@/lib/validations/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = batchVersesSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid verses");
  }

  const result = await batchUpdateVerses(
    id,
    authResult.teacherId,
    parsed.data.verses,
  );

  if (!result) return notFound();
  return NextResponse.json({ ok: true });
}
