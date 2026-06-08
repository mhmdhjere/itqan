import { count, desc, eq, max, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  circles,
  recitationSessions,
  students,
  users,
} from "@/db/schema";

export type TeacherListItem = {
  id: string;
  name: string;
  email: string;
  circleCount: number;
  studentCount: number;
  lastSessionAt: string | null;
  lastLoginAt: string | null;
};

export type TeacherCircleItem = {
  id: string;
  name: string;
  description: string | null;
  studentCount: number;
  lastSessionAt: string | null;
  createdAt: string;
};

export async function listTeachersForAdmin(): Promise<TeacherListItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      lastLoginAt: users.lastLoginAt,
      circleCount: count(sql`distinct ${circles.id}`),
      studentCount: count(sql`distinct ${students.id}`),
      lastSessionAt: max(recitationSessions.endedAt),
    })
    .from(users)
    .leftJoin(circles, eq(circles.teacherId, users.id))
    .leftJoin(students, eq(students.circleId, circles.id))
    .leftJoin(
      recitationSessions,
      eq(recitationSessions.teacherId, users.id),
    )
    .where(eq(users.role, "teacher"))
    .groupBy(users.id)
    .orderBy(desc(users.lastLoginAt));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    circleCount: Number(r.circleCount),
    studentCount: Number(r.studentCount),
    lastSessionAt: r.lastSessionAt?.toISOString() ?? null,
    lastLoginAt: r.lastLoginAt?.toISOString() ?? null,
  }));
}

export async function getTeacherForAdmin(teacherId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, teacherId))
    .limit(1);

  if (!row || row.role !== "teacher") return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listTeacherCirclesForAdmin(
  teacherId: string,
): Promise<TeacherCircleItem[] | null> {
  const teacher = await getTeacherForAdmin(teacherId);
  if (!teacher) return null;

  const db = getDb();
  const rows = await db
    .select({
      id: circles.id,
      name: circles.name,
      description: circles.description,
      createdAt: circles.createdAt,
      studentCount: count(students.id),
      lastSessionAt: max(recitationSessions.endedAt),
    })
    .from(circles)
    .leftJoin(students, eq(students.circleId, circles.id))
    .leftJoin(
      recitationSessions,
      eq(recitationSessions.circleId, circles.id),
    )
    .where(eq(circles.teacherId, teacherId))
    .groupBy(circles.id)
    .orderBy(desc(circles.createdAt));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    studentCount: Number(r.studentCount),
    lastSessionAt: r.lastSessionAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}
