import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { circles, recitationSessions, students } from "@/db/schema";

export type OwnershipResult = "ok" | "not_found" | "forbidden";

export async function checkStudentOwnership(
  studentId: string,
  teacherId: string,
): Promise<OwnershipResult> {
  const db = getDb();
  const [student] = await db
    .select({ circleId: students.circleId })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) return "not_found";

  const [circle] = await db
    .select({ teacherId: circles.teacherId })
    .from(circles)
    .where(eq(circles.id, student.circleId))
    .limit(1);

  if (!circle) return "not_found";
  if (circle.teacherId !== teacherId) return "forbidden";
  return "ok";
}

export async function checkSessionOwnership(
  sessionId: string,
  teacherId: string,
): Promise<OwnershipResult> {
  const db = getDb();
  const [session] = await db
    .select({ teacherId: recitationSessions.teacherId })
    .from(recitationSessions)
    .where(eq(recitationSessions.id, sessionId))
    .limit(1);

  if (!session) return "not_found";
  if (session.teacherId !== teacherId) return "forbidden";
  return "ok";
}
