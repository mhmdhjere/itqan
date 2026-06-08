import { and, desc, eq, gte, isNotNull, lte } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { getDb } from "@/db";
import {
  notes,
  parentReportShares,
  recitationSessions,
  sessionPassages,
} from "@/db/schema";
import { getSurahMeta } from "@/lib/quran";
import type { ParentReportData } from "@/lib/insights/parent-report";
import { getStudentAnalytics } from "./analytics";
import { getWeakAyatForStudent } from "./weak-ayat";
import { getWeaknessPatternsForStudent } from "./weakness-patterns";
import { getStudentForTeacher } from "./students";

export async function buildParentReport(
  studentId: string,
  teacherId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<ParentReportData | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const db = getDb();
  const sessions = await db
    .select()
    .from(recitationSessions)
    .where(
      and(
        eq(recitationSessions.studentId, studentId),
        isNotNull(recitationSessions.endedAt),
        gte(recitationSessions.endedAt, periodStart),
        lte(recitationSessions.endedAt, periodEnd),
      ),
    )
    .orderBy(desc(recitationSessions.endedAt));

  let memorizedVerses = 0;
  let reviewedVerses = 0;
  let totalMinutes = 0;
  const memorizedAyahs = new Set<string>();
  const reviewedAyahs = new Set<string>();

  for (const session of sessions) {
    totalMinutes += Math.round((session.durationSeconds ?? 0) / 60);
    const passages = await db
      .select()
      .from(sessionPassages)
      .where(eq(sessionPassages.sessionId, session.id));

    for (const p of passages) {
      for (let ayah = p.startAyah; ayah <= p.endAyah; ayah++) {
        const key = `${p.surah}:${ayah}`;
        if (session.sessionType === "review") {
          reviewedAyahs.add(key);
        } else {
          memorizedAyahs.add(key);
        }
      }
    }
  }

  memorizedVerses = memorizedAyahs.size;
  reviewedVerses = reviewedAyahs.size;

  const analytics = await getStudentAnalytics(studentId, teacherId);
  const weakAyat = await getWeakAyatForStudent(studentId, teacherId, 3);
  const patterns = await getWeaknessPatternsForStudent(studentId, teacherId, 90);

  const noteRows = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.teacherId, teacherId),
        gte(notes.createdAt, periodStart),
        lte(notes.createdAt, periodEnd),
      ),
    )
    .orderBy(desc(notes.createdAt));

  const studentNotes = noteRows
    .filter((n) => n.scope === "student" && n.refId === studentId)
    .map((n) => ({
      body: n.body,
      createdAt: n.createdAt.toISOString(),
    }));

  const strengths: string[] = [];
  if (analytics?.strongestSurah) {
    const meta = getSurahMeta(analytics.strongestSurah.surah);
    strengths.push(
      `Strong performance in ${meta.nameEn} (${analytics.strongestSurah.score}% avg)`,
    );
  }
  if (analytics && analytics.masteryTrend > 0) {
    strengths.push(`Mastery improved by ${analytics.masteryTrend}% recently`);
  }

  const improvements: string[] = [];
  if (patterns?.weakestCategory && patterns.categories[0]?.topSubcategory) {
    improvements.push(
      `Focus on ${patterns.categories[0].topSubcategory.label} (${patterns.categories[0].percent}% of mistakes)`,
    );
  }
  if (analytics?.weakestSurah) {
    const meta = getSurahMeta(analytics.weakestSurah.surah);
    improvements.push(
      `Additional review needed in ${meta.nameEn}`,
    );
  }

  return {
    studentName: student.fullName,
    circleName: student.circleName,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    memorizedVerses,
    reviewedVerses,
    sessionCount: sessions.length,
    totalMinutes,
    masteryStart: analytics?.sessionTrend[0]?.masteryScore ?? null,
    masteryEnd:
      analytics?.sessionTrend[analytics.sessionTrend.length - 1]
        ?.masteryScore ?? analytics?.masteryPercent ?? null,
    strengths,
    improvements,
    topWeakAyat: (weakAyat ?? []).map((w) => ({
      surah: w.surah,
      ayah: w.ayah,
      mistakeCount: w.mistakeCount,
      surahName: w.surahName,
    })),
    teacherNotes: studentNotes,
  };
}

export async function createReportShare(
  studentId: string,
  teacherId: string,
  periodStart: Date,
  periodEnd: Date,
  expiresInDays = 30,
) {
  const report = await buildParentReport(
    studentId,
    teacherId,
    periodStart,
    periodEnd,
  );
  if (!report) return null;

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const db = getDb();
  const [share] = await db
    .insert(parentReportShares)
    .values({
      studentId,
      teacherId,
      token,
      periodStart,
      periodEnd,
      payloadJson: report,
      expiresAt,
    })
    .returning();

  return { token: share.token, expiresAt: share.expiresAt?.toISOString() };
}

export async function getReportByToken(token: string) {
  const db = getDb();
  const [share] = await db
    .select()
    .from(parentReportShares)
    .where(eq(parentReportShares.token, token))
    .limit(1);

  if (!share) return null;
  if (share.expiresAt && share.expiresAt < new Date()) return null;

  return share.payloadJson as ParentReportData;
}
