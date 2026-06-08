import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { writeConfigAuditLog } from "@/lib/config/audit";
import { invalidateActiveConfigCache } from "@/lib/config/service";
import {
  getMistakeSubcategoryById,
  updateMistakeSubcategory,
} from "@/lib/queries/mistake-taxonomy";
import { updateMistakeSubcategorySchema } from "@/lib/validations/mistake";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  const existing = await getMistakeSubcategoryById(id);
  if (!existing) return notFound();

  const body = await request.json();
  const parsed = updateMistakeSubcategorySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const updated = await updateMistakeSubcategory(id, parsed.data);
  if (!updated) return notFound();

  for (const [field, newValue] of Object.entries(parsed.data)) {
    const oldValue = existing[field as keyof typeof existing];
    if (oldValue !== newValue) {
      await writeConfigAuditLog({
        adminUserId: authResult.adminId,
        entityType: "mistake_subcategory",
        entityId: existing.slug,
        field,
        oldValue,
        newValue,
      });
    }
  }

  invalidateActiveConfigCache();

  return NextResponse.json({
    subcategory: {
      id: updated.id,
      categoryId: updated.categoryId,
      slug: updated.slug,
      labelEn: updated.labelEn,
      labelAr: updated.labelAr,
      sortOrder: updated.sortOrder,
      isActive: updated.isActive,
    },
  });
}
