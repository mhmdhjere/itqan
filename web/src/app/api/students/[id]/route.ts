import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students } from "@/db/schema";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { guardStudent } from "@/lib/api/guards";
import { getStudentForTeacher } from "@/lib/queries/students";
import { updateStudentSchema } from "@/lib/validations/student";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const student = await getStudentForTeacher(id, authResult.teacherId);
  if (!student) return notFound();

  return NextResponse.json({ student });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const existing = await getStudentForTeacher(id, authResult.teacherId);
  if (!existing) return notFound();

  const body = await request.json();
  const parsed = updateStudentSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const db = getDb();
  const [updated] = await db
    .update(students)
    .set({
      ...(parsed.data.fullName !== undefined
        ? { fullName: parsed.data.fullName }
        : {}),
      ...(parsed.data.contactInfo !== undefined
        ? { contactInfo: parsed.data.contactInfo }
        : {}),
      ...(parsed.data.archived !== undefined
        ? { archivedAt: parsed.data.archived ? new Date() : null }
        : {}),
    })
    .where(eq(students.id, id))
    .returning();

  const student = await getStudentForTeacher(updated.id, authResult.teacherId);
  return NextResponse.json({ student });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const existing = await getStudentForTeacher(id, authResult.teacherId);
  if (!existing) return notFound();

  const db = getDb();
  await db
    .update(students)
    .set({ archivedAt: new Date() })
    .where(eq(students.id, id));

  return NextResponse.json({ ok: true, archived: true });
}
