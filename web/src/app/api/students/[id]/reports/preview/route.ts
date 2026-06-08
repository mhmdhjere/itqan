import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { guardStudent } from "@/lib/api/guards";
import { buildParentReport } from "@/lib/queries/parent-report";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) return badRequest("from and to dates are required");

  const periodStart = new Date(from);
  const periodEnd = new Date(to);
  if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
    return badRequest("Invalid date range");
  }

  const report = await buildParentReport(
    id,
    authResult.teacherId,
    periodStart,
    periodEnd,
  );
  if (!report) return notFound();

  return NextResponse.json({ report });
}
