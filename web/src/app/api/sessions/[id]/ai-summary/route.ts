import { NextResponse } from "next/server";
import { requireTeacherSession } from "@/lib/api/auth";
import { guardSession } from "@/lib/api/guards";
import { getActiveConfig } from "@/lib/config/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireTeacherSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const denied = await guardSession(id, authResult.teacherId);
  if (denied) return denied;

  const config = await getActiveConfig();
  if (!config.config.features.ai_session_summary) {
    return NextResponse.json(
      { error: "AI session summary is not enabled" },
      { status: 501 },
    );
  }

  return NextResponse.json(
    { error: "AI session summary not yet implemented" },
    { status: 501 },
  );
}

export async function POST(_request: Request, context: RouteContext) {
  return GET(_request, context);
}
