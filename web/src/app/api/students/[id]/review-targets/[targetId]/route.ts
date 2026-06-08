import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { notFound } from "@/lib/api/errors";
import { guardStudent } from "@/lib/api/guards";
import { deleteReviewTarget } from "@/lib/queries/plans";

type RouteContext = { params: Promise<{ id: string; targetId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id, targetId } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const deleted = await deleteReviewTarget(
    id,
    targetId,
    authResult.teacherId,
  );

  if (!deleted) return notFound();
  return NextResponse.json({ ok: true });
}
