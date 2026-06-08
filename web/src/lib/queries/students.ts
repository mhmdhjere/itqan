import { and, desc, eq, isNull, max } from "drizzle-orm";
import { getDb } from "@/db";
import { circles, recitationSessions, students } from "@/db/schema";

export type StudentListItem = {
  id: string;
  circleId: string;
  fullName: string;
  contactInfo: string | null;
  lastSessionAt: string | null;
  createdAt: string;
};

export type StudentDetail = StudentListItem & {
  circleName: string;
  archivedAt: string | null;
};

export async function listStudentsForCircle(
  circleId: string,
  teacherId: string,
  { includeArchived = false } = {},
): Promise<StudentListItem[]> {
  const db = getDb();

  const conditions = [
    eq(students.circleId, circleId),
    eq(circles.teacherId, teacherId),
  ];

  if (!includeArchived) {
    conditions.push(isNull(students.archivedAt));
  }

  const rows = await db
    .select({
      id: students.id,
      circleId: students.circleId,
      fullName: students.fullName,
      contactInfo: students.contactInfo,
      createdAt: students.createdAt,
      lastSessionAt: max(recitationSessions.endedAt),
    })
    .from(students)
    .innerJoin(circles, eq(circles.id, students.circleId))
    .leftJoin(
      recitationSessions,
      eq(recitationSessions.studentId, students.id),
    )
    .where(and(...conditions))
    .groupBy(students.id)
    .orderBy(desc(students.createdAt));

  return rows.map((row) => ({
    id: row.id,
    circleId: row.circleId,
    fullName: row.fullName,
    contactInfo: row.contactInfo,
    lastSessionAt: row.lastSessionAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getStudentForTeacher(studentId: string, teacherId: string) {
  const db = getDb();

  const [row] = await db
    .select({
      id: students.id,
      circleId: students.circleId,
      fullName: students.fullName,
      contactInfo: students.contactInfo,
      createdAt: students.createdAt,
      archivedAt: students.archivedAt,
      circleName: circles.name,
      lastSessionAt: max(recitationSessions.endedAt),
    })
    .from(students)
    .innerJoin(circles, eq(circles.id, students.circleId))
    .leftJoin(
      recitationSessions,
      eq(recitationSessions.studentId, students.id),
    )
    .where(and(eq(students.id, studentId), eq(circles.teacherId, teacherId)))
    .groupBy(students.id, circles.name)
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    circleId: row.circleId,
    fullName: row.fullName,
    contactInfo: row.contactInfo,
    circleName: row.circleName,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    lastSessionAt: row.lastSessionAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  } satisfies StudentDetail;
}
