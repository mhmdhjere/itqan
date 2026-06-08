import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { verseStatusDefinitions } from "@/db/schema";
import { requireAdminSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { writeConfigAuditLog } from "@/lib/config/audit";
import { invalidateActiveConfigCache } from "@/lib/config/service";

const patchSchema = z
  .object({
    labelEn: z.string().min(1).max(128).optional(),
    labelAr: z.string().max(128).optional().nullable(),
    scorePoints: z.number().int().min(0).max(100).optional(),
    color: z.string().max(32).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(verseStatusDefinitions)
    .where(eq(verseStatusDefinitions.id, id))
    .limit(1);

  if (!existing) return notFound();

  if (parsed.data.isActive === false && existing.isDefaultImplicit) {
    return badRequest("Cannot deactivate the default implicit status");
  }

  const [updated] = await db
    .update(verseStatusDefinitions)
    .set(parsed.data)
    .where(eq(verseStatusDefinitions.id, id))
    .returning();

  for (const [field, newValue] of Object.entries(parsed.data)) {
    const oldValue = existing[field as keyof typeof existing];
    if (oldValue !== newValue) {
      await writeConfigAuditLog({
        adminUserId: authResult.adminId,
        entityType: "verse_status",
        entityId: existing.slug,
        field,
        oldValue,
        newValue,
      });
    }
  }

  invalidateActiveConfigCache();

  return NextResponse.json({
    verseStatus: {
      id: updated.id,
      slug: updated.slug,
      labelEn: updated.labelEn,
      labelAr: updated.labelAr,
      scorePoints: updated.scorePoints,
      color: updated.color,
      sortOrder: updated.sortOrder,
      isActive: updated.isActive,
      isDefaultImplicit: updated.isDefaultImplicit,
    },
  });
}
