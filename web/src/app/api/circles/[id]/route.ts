import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { circles } from "@/db/schema";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { getCircleForTeacher } from "@/lib/queries/circles";
import { updateCircleSchema } from "@/lib/validations/circle";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const circle = await getCircleForTeacher(id, authResult.teacherId);
  if (!circle) return notFound();

  return NextResponse.json({ circle });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const existing = await getCircleForTeacher(id, authResult.teacherId);
  if (!existing) return notFound();

  const body = await request.json();
  const parsed = updateCircleSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const db = getDb();
  const [updated] = await db
    .update(circles)
    .set({
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description }
        : {}),
    })
    .where(
      and(eq(circles.id, id), eq(circles.teacherId, authResult.teacherId)),
    )
    .returning();

  const circle = await getCircleForTeacher(updated.id, authResult.teacherId);
  return NextResponse.json({ circle });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const existing = await getCircleForTeacher(id, authResult.teacherId);
  if (!existing) return notFound();

  const db = getDb();
  await db
    .delete(circles)
    .where(
      and(eq(circles.id, id), eq(circles.teacherId, authResult.teacherId)),
    );

  return NextResponse.json({ ok: true });
}
