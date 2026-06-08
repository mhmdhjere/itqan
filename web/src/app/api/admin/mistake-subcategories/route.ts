import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { mistakeSubcategories } from "@/db/schema";
import { requireAdminSession } from "@/lib/api/auth";
import { badRequest, notFound } from "@/lib/api/errors";
import { writeConfigAuditLog } from "@/lib/config/audit";
import { invalidateActiveConfigCache } from "@/lib/config/service";
import {
  createMistakeSubcategory,
  getMistakeCategoryById,
} from "@/lib/queries/mistake-taxonomy";
import { createMistakeSubcategorySchema } from "@/lib/validations/mistake";

export async function POST(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = createMistakeSubcategorySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const category = await getMistakeCategoryById(parsed.data.categoryId);
  if (!category) return notFound();

  const db = getDb();
  const [existing] = await db
    .select({ id: mistakeSubcategories.id })
    .from(mistakeSubcategories)
    .where(eq(mistakeSubcategories.slug, parsed.data.slug))
    .limit(1);

  if (existing) {
    return badRequest("A subcategory with this slug already exists");
  }

  const created = await createMistakeSubcategory(parsed.data);

  await writeConfigAuditLog({
    adminUserId: authResult.adminId,
    entityType: "mistake_subcategory",
    entityId: created.slug,
    field: "created",
    newValue: {
      labelEn: created.labelEn,
      slug: created.slug,
      categoryId: created.categoryId,
    },
  });

  invalidateActiveConfigCache();

  return NextResponse.json(
    {
      subcategory: {
        id: created.id,
        categoryId: created.categoryId,
        slug: created.slug,
        labelEn: created.labelEn,
        labelAr: created.labelAr,
        sortOrder: created.sortOrder,
        isActive: created.isActive,
      },
    },
    { status: 201 },
  );
}
