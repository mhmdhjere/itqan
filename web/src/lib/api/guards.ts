import type { NextResponse } from "next/server";
import {
  checkSessionOwnership,
  checkStudentOwnership,
} from "@/lib/api/ownership";
import { forbidden, notFound } from "@/lib/api/errors";

export async function guardStudent(
  studentId: string,
  teacherId: string,
): Promise<NextResponse | null> {
  const result = await checkStudentOwnership(studentId, teacherId);
  if (result === "not_found") return notFound();
  if (result === "forbidden") return forbidden();
  return null;
}

export async function guardSession(
  sessionId: string,
  teacherId: string,
): Promise<NextResponse | null> {
  const result = await checkSessionOwnership(sessionId, teacherId);
  if (result === "not_found") return notFound();
  if (result === "forbidden") return forbidden();
  return null;
}
