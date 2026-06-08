import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { notFound } from "@/lib/api/errors";
import { getSessionDetail } from "@/lib/queries/sessions";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const session = await getSessionDetail(id, authResult.teacherId);
  if (!session) return notFound();

  return NextResponse.json({ session });
}
