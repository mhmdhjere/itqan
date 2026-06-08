import { NextResponse } from "next/server";
import { notFound } from "@/lib/api/errors";
import { getReportByToken } from "@/lib/queries/parent-report";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const report = await getReportByToken(token);
  if (!report) return notFound();
  return NextResponse.json({ report });
}
