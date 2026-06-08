import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import { getActiveConfig } from "@/lib/config/service";
import { computeVerseScore } from "@/lib/mastery/scoring";
import { scoringPreviewSchema } from "@/lib/validations/scoring";

export async function POST(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = scoringPreviewSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const config = await getActiveConfig();
  const score = computeVerseScore(
    parsed.data.statusSlug,
    parsed.data.mistakes,
    config,
  );

  const status = config.verseStatuses.find(
    (s) => s.slug === parsed.data.statusSlug,
  );

  return NextResponse.json({
    score,
    statusSlug: parsed.data.statusSlug,
    statusLabel: status?.labelEn ?? parsed.data.statusSlug,
    basePoints: status?.scorePoints ?? 0,
    mistakeCount: parsed.data.mistakes.length,
    mistakePenalty:
      (config.config.mastery.mistake_penalty as number | undefined) ?? 5,
  });
}
