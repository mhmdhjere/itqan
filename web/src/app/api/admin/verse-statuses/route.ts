import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { verseStatusDefinitions } from "@/db/schema";
import { requireAdminSession } from "@/lib/api/auth";

export async function GET() {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const db = getDb();
  const rows = await db
    .select()
    .from(verseStatusDefinitions)
    .orderBy(asc(verseStatusDefinitions.sortOrder));

  return NextResponse.json({
    verseStatuses: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      labelEn: row.labelEn,
      labelAr: row.labelAr,
      scorePoints: row.scorePoints,
      color: row.color,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      isDefaultImplicit: row.isDefaultImplicit,
    })),
  });
}
