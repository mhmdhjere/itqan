import { and, desc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { recitationSessions } from "@/db/schema";
import { getActiveConfig } from "@/lib/config/service";
import {
  aggregateMistakeBreakdown,
  computeStudentMasteryPercent,
  computeSurahMasteryScores,
  strongestWeakestSurah,
} from "@/lib/mastery/scoring";
import type { SessionSummaryJson } from "@/lib/session-scoring";
import { buildAyahHistory } from "./ayah-history";
import { getStudentForTeacher } from "./students";

export type StudentAnalyticsDto = {
  masteryPercent: number;
  masteryTrend: number;
  totalSessions: number;
  totalVersesRecited: number;
  commonMistake: string | null;
  topMistakes: { slug: string; label: string; count: number }[];
  mistakeBreakdown: { category: string; count: number }[];
  strongestSurah: { surah: number; score: number } | null;
  weakestSurah: { surah: number; score: number } | null;
  sessionTrend: { date: string; masteryScore: number }[];
};

export async function getStudentAnalytics(
  studentId: string,
  teacherId: string,
): Promise<StudentAnalyticsDto | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const config = await getActiveConfig();
  const db = getDb();

  const sessions = await db
    .select()
    .from(recitationSessions)
    .where(
      and(
        eq(recitationSessions.studentId, studentId),
        isNotNull(recitationSessions.endedAt),
      ),
    )
    .orderBy(desc(recitationSessions.endedAt))
    .limit(50);

  const history = await buildAyahHistory(studentId);
  const masteryPercent = computeStudentMasteryPercent(history, config);
  const surahScores = computeSurahMasteryScores(history, config);
  const { strongest, weakest } = strongestWeakestSurah(surahScores);

  const markedMistakes = history.flatMap((h) =>
    h.mistakes.map((slug) => ({ mistakes: [slug] })),
  );
  const mistakeBreakdown = aggregateMistakeBreakdown(markedMistakes, config);

  const mistakeCounts = new Map<string, number>();
  for (const h of history) {
    for (const slug of h.mistakes) {
      mistakeCounts.set(slug, (mistakeCounts.get(slug) ?? 0) + 1);
    }
  }

  const labelBySlug = new Map(
    config.mistakeSubcategories.map((s) => [s.slug, s.labelEn]),
  );

  const topMistakes = [...mistakeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({
      slug,
      label: labelBySlug.get(slug) ?? slug,
      count,
    }));

  const sessionSummaries = sessions
    .map((s) => ({
      date: s.endedAt!.toISOString(),
      masteryScore: (s.summaryJson as SessionSummaryJson | null)?.masteryScore ?? 0,
      versesRecited:
        (s.summaryJson as SessionSummaryJson | null)?.versesRecited ?? 0,
    }))
    .reverse();

  const recent = sessionSummaries.slice(-3);
  const previous = sessionSummaries.slice(-6, -3);
  const avg = (items: typeof recent) =>
    items.length > 0
      ? items.reduce((s, i) => s + i.masteryScore, 0) / items.length
      : 0;
  const masteryTrend = Math.round(avg(recent) - avg(previous));

  return {
    masteryPercent,
    masteryTrend,
    totalSessions: sessions.length,
    totalVersesRecited: sessionSummaries.reduce(
      (sum, s) => sum + s.versesRecited,
      0,
    ),
    commonMistake: topMistakes[0]?.label ?? null,
    topMistakes,
    mistakeBreakdown,
    strongestSurah: strongest
      ? { surah: strongest.surah, score: strongest.score }
      : null,
    weakestSurah: weakest ? { surah: weakest.surah, score: weakest.score } : null,
    sessionTrend: sessionSummaries.map((s) => ({
      date: s.date,
      masteryScore: s.masteryScore,
    })),
  };
}
