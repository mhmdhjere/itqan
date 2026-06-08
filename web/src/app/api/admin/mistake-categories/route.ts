import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { mistakeCategories } from "@/db/schema";
import { requireAdminSession } from "@/lib/api/auth";
import { badRequest } from "@/lib/api/errors";
import { writeConfigAuditLog } from "@/lib/config/audit";
import { invalidateActiveConfigCache } from "@/lib/config/service";
import {
  createMistakeCategory,
  listMistakeTaxonomy,
} from "@/lib/queries/mistake-taxonomy";
import { createMistakeCategorySchema } from "@/lib/validations/mistake";

export async function GET() {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const categories = await listMistakeTaxonomy();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = createMistakeCategorySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: mistakeCategories.id })
    .from(mistakeCategories)
    .where(eq(mistakeCategories.slug, parsed.data.slug))
    .limit(1);

  if (existing) {
    return badRequest("A category with this slug already exists");
  }

  const created = await createMistakeCategory(parsed.data);

  await writeConfigAuditLog({
    adminUserId: authResult.adminId,
    entityType: "mistake_category",
    entityId: created.slug,
    field: "created",
    newValue: {
      labelEn: created.labelEn,
      slug: created.slug,
    },
  });

  invalidateActiveConfigCache();

  return NextResponse.json(
    {
      category: {
        id: created.id,
        slug: created.slug,
        labelEn: created.labelEn,
        labelAr: created.labelAr,
        sortOrder: created.sortOrder,
        isActive: created.isActive,
        subcategories: [],
      },
    },
    { status: 201 },
  );
}
