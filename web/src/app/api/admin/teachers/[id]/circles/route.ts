import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/auth";
import { notFound } from "@/lib/api/errors";
import { listTeacherCirclesForAdmin } from "@/lib/queries/admin-teachers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const circles = await listTeacherCirclesForAdmin(id);
  if (circles === null) return notFound();

  return NextResponse.json({ circles });
}
