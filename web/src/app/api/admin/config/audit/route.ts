import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/auth";
import { listAuditLog } from "@/lib/queries/audit-log";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const entityType = searchParams.get("entityType") ?? undefined;
  const adminUserId = searchParams.get("adminUserId") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "50");

  const entries = await listAuditLog({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
    entityType,
    adminUserId,
    limit: Number.isFinite(limit) ? Math.min(limit, 200) : 50,
  });

  return NextResponse.json({ entries });
}
