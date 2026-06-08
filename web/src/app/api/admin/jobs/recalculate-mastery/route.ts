import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import { refreshAllMasterySnapshots } from "@/lib/queries/mastery-snapshots";
import { z } from "zod";

const bodySchema = z.object({
  studentId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid request");
  }

  if (parsed.data.studentId) {
    await refreshAllMasterySnapshots(parsed.data.studentId);
    return NextResponse.json({
      status: "completed",
      message: `Mastery snapshots refreshed for student ${parsed.data.studentId}`,
    });
  }

  return NextResponse.json({
    status: "queued",
    message:
      "Recalculate job accepted. Provide studentId to refresh a single student.",
  });
}
