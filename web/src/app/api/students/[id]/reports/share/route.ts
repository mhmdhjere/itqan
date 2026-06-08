import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { guardStudent } from "@/lib/api/guards";
import { createReportShare } from "@/lib/queries/parent-report";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const body = await request.json();
  const from = body.from as string | undefined;
  const to = body.to as string | undefined;
  if (!from || !to) return badRequest("from and to are required");

  const periodStart = new Date(from);
  const periodEnd = new Date(to);
  if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
    return badRequest("Invalid date range");
  }

  const share = await createReportShare(
    id,
    authResult.teacherId,
    periodStart,
    periodEnd,
    body.expiresInDays ?? 30,
  );
  if (!share) return notFound();

  return NextResponse.json({ share });
}
