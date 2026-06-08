import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { memorizationPlans, reviewTargets } from "@/db/schema";
import { getStudentForTeacher } from "./students";

export type MemorizationPlanDto = {
  studentId: string;
  currentSurah: number;
  currentStartAyah: number;
  currentEndAyah: number;
  nextSurah: number;
  nextStartAyah: number;
  nextEndAyah: number;
  updatedAt: string;
};

export type ReviewTargetDto = {
  id: string;
  studentId: string;
  surah: number;
  startAyah: number;
  endAyah: number;
  priority: number;
  source: "manual" | "algorithm";
  lastReviewedAt: string | null;
};

export async function getMemorizationPlan(
  studentId: string,
  teacherId: string,
): Promise<MemorizationPlanDto | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const db = getDb();
  const [plan] = await db
    .select()
    .from(memorizationPlans)
    .where(eq(memorizationPlans.studentId, studentId))
    .limit(1);

  if (!plan) return null;

  return {
    studentId: plan.studentId,
    currentSurah: plan.currentSurah,
    currentStartAyah: plan.currentStartAyah,
    currentEndAyah: plan.currentEndAyah,
    nextSurah: plan.nextSurah,
    nextStartAyah: plan.nextStartAyah,
    nextEndAyah: plan.nextEndAyah,
    updatedAt: plan.updatedAt.toISOString(),
  };
}

export async function upsertMemorizationPlan(
  studentId: string,
  teacherId: string,
  data: Omit<MemorizationPlanDto, "studentId" | "updatedAt">,
) {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const db = getDb();
  const [existing] = await db
    .select()
    .from(memorizationPlans)
    .where(eq(memorizationPlans.studentId, studentId))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(memorizationPlans)
      .set({
        currentSurah: data.currentSurah,
        currentStartAyah: data.currentStartAyah,
        currentEndAyah: data.currentEndAyah,
        nextSurah: data.nextSurah,
        nextStartAyah: data.nextStartAyah,
        nextEndAyah: data.nextEndAyah,
        updatedAt: new Date(),
      })
      .where(eq(memorizationPlans.studentId, studentId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(memorizationPlans)
    .values({
      studentId,
      currentSurah: data.currentSurah,
      currentStartAyah: data.currentStartAyah,
      currentEndAyah: data.currentEndAyah,
      nextSurah: data.nextSurah,
      nextStartAyah: data.nextStartAyah,
      nextEndAyah: data.nextEndAyah,
    })
    .returning();

  return created;
}

export async function listReviewTargets(
  studentId: string,
  teacherId: string,
): Promise<ReviewTargetDto[] | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const db = getDb();
  const rows = await db
    .select()
    .from(reviewTargets)
    .where(eq(reviewTargets.studentId, studentId));

  return rows.map((row) => ({
    id: row.id,
    studentId: row.studentId,
    surah: row.surah,
    startAyah: row.startAyah,
    endAyah: row.endAyah,
    priority: row.priority,
    source: row.source,
    lastReviewedAt: row.lastReviewedAt?.toISOString() ?? null,
  }));
}

export async function createReviewTarget(
  studentId: string,
  teacherId: string,
  data: {
    surah: number;
    startAyah: number;
    endAyah: number;
    source?: "manual" | "algorithm";
  },
) {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const db = getDb();
  const [created] = await db
    .insert(reviewTargets)
    .values({
      studentId,
      surah: data.surah,
      startAyah: data.startAyah,
      endAyah: data.endAyah,
      source: data.source ?? "manual",
    })
    .returning();

  return created;
}

export async function deleteReviewTarget(
  studentId: string,
  targetId: string,
  teacherId: string,
) {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return false;

  const db = getDb();
  const result = await db
    .delete(reviewTargets)
    .where(
      and(
        eq(reviewTargets.id, targetId),
        eq(reviewTargets.studentId, studentId),
      ),
    )
    .returning({ id: reviewTargets.id });

  return result.length > 0;
}
