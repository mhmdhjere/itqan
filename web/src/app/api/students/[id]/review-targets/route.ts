import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import {
  createReviewTarget,
  listReviewTargets,
} from "@/lib/queries/plans";
import { getStudentForTeacher } from "@/lib/queries/students";
import { reviewTargetSchema } from "@/lib/validations/plan";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const student = await getStudentForTeacher(id, authResult.teacherId);
  if (!student) return notFound();

  const targets = await listReviewTargets(id, authResult.teacherId);
  return NextResponse.json({ reviewTargets: targets ?? [] });
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = reviewTargetSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid review target");
  }

  const created = await createReviewTarget(id, authResult.teacherId, parsed.data);
  if (!created) return notFound();

  return NextResponse.json(
    {
      reviewTarget: {
        id: created.id,
        studentId: created.studentId,
        surah: created.surah,
        startAyah: created.startAyah,
        endAyah: created.endAyah,
        priority: created.priority,
        source: created.source,
        lastReviewedAt: created.lastReviewedAt?.toISOString() ?? null,
      },
    },
    { status: 201 },
  );
}
