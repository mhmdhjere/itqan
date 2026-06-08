import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { notFound } from "@/lib/api/errors";
import { guardStudent } from "@/lib/api/guards";
import { getWeaknessPatternsForStudent } from "@/lib/queries/weakness-patterns";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? "90");

  const patterns = await getWeaknessPatternsForStudent(
    id,
    authResult.teacherId,
    Number.isFinite(days) ? days : 90,
  );
  if (patterns === null) return notFound();

  return NextResponse.json({ patterns });
}
