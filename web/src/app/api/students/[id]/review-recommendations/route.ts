import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { notFound } from "@/lib/api/errors";
import { guardStudent } from "@/lib/api/guards";
import { getReviewRecommendations } from "@/lib/queries/review-recommendations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const recommendations = await getReviewRecommendations(
    id,
    authResult.teacherId,
  );
  if (recommendations === null) return notFound();

  return NextResponse.json({ recommendations });
}
