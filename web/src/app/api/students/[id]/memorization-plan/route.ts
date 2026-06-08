import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import {
  getMemorizationPlan,
  upsertMemorizationPlan,
} from "@/lib/queries/plans";
import { getStudentForTeacher } from "@/lib/queries/students";
import { memorizationPlanSchema } from "@/lib/validations/plan";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const student = await getStudentForTeacher(id, authResult.teacherId);
  if (!student) return notFound();

  const plan = await getMemorizationPlan(id, authResult.teacherId);
  return NextResponse.json({ plan });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = memorizationPlanSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid plan");
  }

  const result = await upsertMemorizationPlan(id, authResult.teacherId, parsed.data);
  if (!result) return notFound();

  const plan = await getMemorizationPlan(id, authResult.teacherId);
  return NextResponse.json({ plan });
}
