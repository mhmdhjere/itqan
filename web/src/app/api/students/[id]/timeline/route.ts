import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { notFound } from "@/lib/api/errors";
import { guardStudent } from "@/lib/api/guards";
import { getTimelineForStudent } from "@/lib/queries/timeline";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardStudent(id, authResult.teacherId);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const includeHeatmap = searchParams.get("include") === "heatmap";

  const timeline = await getTimelineForStudent(
    id,
    authResult.teacherId,
    includeHeatmap,
  );
  if (!timeline) return notFound();

  return NextResponse.json({ timeline });
}
