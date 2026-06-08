import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { circles } from "@/db/schema";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import { listCirclesForTeacher } from "@/lib/queries/circles";
import { createCircleSchema } from "@/lib/validations/circle";

export async function GET() {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const circlesList = await listCirclesForTeacher(authResult.teacherId);
  return NextResponse.json({ circles: circlesList });
}

export async function POST(request: Request) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = createCircleSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const db = getDb();
  const [created] = await db
    .insert(circles)
    .values({
      teacherId: authResult.teacherId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    .returning();

  return NextResponse.json(
    {
      circle: {
        id: created.id,
        name: created.name,
        description: created.description,
        studentCount: 0,
        lastSessionAt: null,
        createdAt: created.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
