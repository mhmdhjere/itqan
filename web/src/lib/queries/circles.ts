import { and, count, desc, eq, isNull, max, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { circles, recitationSessions, students } from "@/db/schema";

export type CircleListItem = {
  id: string;
  name: string;
  description: string | null;
  studentCount: number;
  lastSessionAt: string | null;
  createdAt: string;
};

export type CircleDetail = CircleListItem & {
  teacherId: string;
};

export async function listCirclesForTeacher(
  teacherId: string,
): Promise<CircleListItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: circles.id,
      name: circles.name,
      description: circles.description,
      createdAt: circles.createdAt,
      studentCount: sql<number>`cast(count(distinct ${students.id}) filter (where ${students.archivedAt} is null) as int)`,
      lastSessionAt: max(recitationSessions.endedAt),
    })
    .from(circles)
    .leftJoin(
      students,
      and(eq(students.circleId, circles.id), isNull(students.archivedAt)),
    )
    .leftJoin(recitationSessions, eq(recitationSessions.circleId, circles.id))
    .where(eq(circles.teacherId, teacherId))
    .groupBy(circles.id)
    .orderBy(desc(circles.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    studentCount: row.studentCount ?? 0,
    lastSessionAt: row.lastSessionAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getCircleForTeacher(circleId: string, teacherId: string) {
  const db = getDb();

  const [circle] = await db
    .select()
    .from(circles)
    .where(and(eq(circles.id, circleId), eq(circles.teacherId, teacherId)))
    .limit(1);

  if (!circle) return null;

  const [countRow] = await db
    .select({ studentCount: count() })
    .from(students)
    .where(and(eq(students.circleId, circleId), isNull(students.archivedAt)));

  const [sessionRow] = await db
    .select({ lastSessionAt: max(recitationSessions.endedAt) })
    .from(recitationSessions)
    .where(eq(recitationSessions.circleId, circleId));

  return {
    id: circle.id,
    name: circle.name,
    description: circle.description,
    teacherId: circle.teacherId,
    studentCount: countRow?.studentCount ?? 0,
    lastSessionAt: sessionRow?.lastSessionAt?.toISOString() ?? null,
    createdAt: circle.createdAt.toISOString(),
  } satisfies CircleDetail;
}

export async function assertCircleOwned(circleId: string, teacherId: string) {
  const circle = await getCircleForTeacher(circleId, teacherId);
  return circle;
}
