import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students } from "@/db/schema";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertCircleOwned } from "@/lib/queries/circles";
import { listStudentsForCircle } from "@/lib/queries/students";
import { createStudentSchema } from "@/lib/validations/student";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const circle = await assertCircleOwned(id, authResult.teacherId);
  if (!circle) return notFound();

  const roster = await listStudentsForCircle(id, authResult.teacherId);
  return NextResponse.json({ students: roster });
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const circle = await assertCircleOwned(id, authResult.teacherId);
  if (!circle) return notFound();

  const body = await request.json();
  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const db = getDb();
  const [created] = await db
    .insert(students)
    .values({
      circleId: id,
      fullName: parsed.data.fullName,
      contactInfo: parsed.data.contactInfo ?? null,
    })
    .returning();

  return NextResponse.json(
    {
      student: {
        id: created.id,
        circleId: created.circleId,
        fullName: created.fullName,
        contactInfo: created.contactInfo,
        lastSessionAt: null,
        createdAt: created.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
