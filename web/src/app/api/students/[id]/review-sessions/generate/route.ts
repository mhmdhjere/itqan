import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { notFound } from "@/lib/api/errors";
import { guardStudent } from "@/lib/api/guards";
import { generateReviewPassages } from "@/lib/queries/weak-ayat";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const maxAyahs = Number(body.maxAyahs ?? 10);

  const result = await generateReviewPassages(
    id,
    authResult.teacherId,
    Number.isFinite(maxAyahs) ? maxAyahs : 10,
  );
  if (!result) return notFound();

  return NextResponse.json(result);
}
