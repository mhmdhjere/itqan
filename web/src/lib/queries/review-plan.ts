import { and, desc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { recitationSessions } from "@/db/schema";
import { getActiveConfig } from "@/lib/config/service";
import { getSurahMeta } from "@/lib/quran";
import { buildReviewPlanItems } from "@/lib/insights/review-plan";
import { verseKey } from "@/lib/session-ranges";
import { buildAyahHistory } from "./ayah-history";
import { getReviewRecommendations } from "./review-recommendations";
import { getWeakAyatForStudent } from "./weak-ayat";
import { getStudentForTeacher } from "./students";

export type ReviewPlanDto = {
  today: ReviewPlanItemDto[];
  week: ReviewPlanItemDto[];
  avgSecondsPerVerse: number;
};

export type ReviewPlanItemDto = {
  surah: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  priority: number;
  estimatedMinutes: number;
  reasons: string[];
  masteryScore: number;
  mistakeFrequency: number;
  daysSinceLastReview: number;
};

export async function estimateAvgSecondsPerVerse(
  studentId: string,
): Promise<number> {
  const db = getDb();
  const sessions = await db
    .select({
      durationSeconds: recitationSessions.durationSeconds,
      summaryJson: recitationSessions.summaryJson,
    })
    .from(recitationSessions)
    .where(
      and(
        eq(recitationSessions.studentId, studentId),
        isNotNull(recitationSessions.endedAt),
      ),
    )
    .orderBy(desc(recitationSessions.endedAt))
    .limit(20);

  let totalVerses = 0;
  let totalSeconds = 0;
  for (const s of sessions) {
    const summary = s.summaryJson as { versesRecited?: number } | null;
    const verses = summary?.versesRecited ?? 0;
    if (verses > 0 && s.durationSeconds) {
      totalVerses += verses;
      totalSeconds += s.durationSeconds;
    }
  }

  if (totalVerses === 0) return 30;
  return Math.round(totalSeconds / totalVerses);
}

export async function getReviewPlanForStudent(
  studentId: string,
  teacherId: string,
): Promise<ReviewPlanDto | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const [config, recommendations, weakAyat, history, avgPace] =
    await Promise.all([
      getActiveConfig(),
      getReviewRecommendations(studentId, teacherId),
      getWeakAyatForStudent(studentId, teacherId, 15),
      buildAyahHistory(studentId, 100),
      estimateAvgSecondsPerVerse(studentId),
    ]);

  const weakRank = new Map(
    (weakAyat ?? []).map((w, i) => [verseKey(w.surah, w.ayah), i + 1]),
  );

  const byAyah = new Map<string, typeof history>();
  for (const record of history) {
    const key = verseKey(record.surah, record.ayah);
    const list = byAyah.get(key) ?? [];
    list.push(record);
    byAyah.set(key, list);
  }

  const passages =
    recommendations?.map((r) => {
      const key = verseKey(r.surah, r.startAyah);
      const ayahHistory = byAyah.get(key) ?? [];
      const rank = weakRank.get(key);
      return {
        surah: r.surah,
        startAyah: r.startAyah,
        endAyah: r.endAyah,
        mistakeFrequency: r.mistakeFrequency,
        masteryScore: r.masteryScore,
        daysSinceLastReview: r.daysSinceLastReview,
        weakAyahRankBonus: rank ? Math.max(0, 10 - rank) : 0,
        trendBonus:
          r.masteryScore < 70 ? 2 : r.daysSinceLastReview > 45 ? 1 : 0,
      };
    }) ?? [];

  const today = buildReviewPlanItems(passages, config, avgPace, 5);
  const week = buildReviewPlanItems(passages, config, avgPace, 15);

  const toDto = (items: typeof today): ReviewPlanItemDto[] =>
    items.map((item) => ({
      surah: item.surah,
      surahName: getSurahMeta(item.surah).nameEn,
      startAyah: item.startAyah,
      endAyah: item.endAyah,
      priority: Math.round(item.priority * 10),
      estimatedMinutes: item.estimatedMinutes,
      reasons: item.reasons,
      masteryScore: item.masteryScore,
      mistakeFrequency: item.mistakeFrequency,
      daysSinceLastReview: item.daysSinceLastReview,
    }));

  return {
    today: toDto(today),
    week: toDto(week),
    avgSecondsPerVerse: avgPace,
  };
}

export async function countStudentsWithReviewDueToday(
  studentIds: string[],
  teacherId: string,
): Promise<number> {
  let count = 0;
  for (const id of studentIds) {
    const plan = await getReviewPlanForStudent(id, teacherId);
    if (plan && plan.today.length > 0) count += 1;
  }
  return count;
}
