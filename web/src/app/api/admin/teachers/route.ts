import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/auth";
import { listTeachersForAdmin } from "@/lib/queries/admin-teachers";

export async function GET() {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const teachers = await listTeachersForAdmin();
  return NextResponse.json({ teachers });
}
