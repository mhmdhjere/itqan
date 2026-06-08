import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { mistakeCategories, mistakeSubcategories } from "@/db/schema";

export type MistakeSubcategoryDto = {
  id: string;
  categoryId: string;
  slug: string;
  labelEn: string;
  labelAr: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type MistakeCategoryTreeDto = {
  id: string;
  slug: string;
  labelEn: string;
  labelAr: string | null;
  sortOrder: number;
  isActive: boolean;
  subcategories: MistakeSubcategoryDto[];
};

export async function listMistakeTaxonomy(): Promise<MistakeCategoryTreeDto[]> {
  const db = getDb();

  const categories = await db
    .select()
    .from(mistakeCategories)
    .orderBy(asc(mistakeCategories.sortOrder));

  const subcategories = await db
    .select()
    .from(mistakeSubcategories)
    .orderBy(asc(mistakeSubcategories.sortOrder));

  const subsByCategory = new Map<string, MistakeSubcategoryDto[]>();
  for (const sub of subcategories) {
    const list = subsByCategory.get(sub.categoryId) ?? [];
    list.push({
      id: sub.id,
      categoryId: sub.categoryId,
      slug: sub.slug,
      labelEn: sub.labelEn,
      labelAr: sub.labelAr,
      sortOrder: sub.sortOrder,
      isActive: sub.isActive,
    });
    subsByCategory.set(sub.categoryId, list);
  }

  return categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    labelEn: cat.labelEn,
    labelAr: cat.labelAr,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    subcategories: subsByCategory.get(cat.id) ?? [],
  }));
}

export async function getMistakeCategoryById(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(mistakeCategories)
    .where(eq(mistakeCategories.id, id))
    .limit(1);
  return row ?? null;
}

export async function getMistakeSubcategoryById(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(mistakeSubcategories)
    .where(eq(mistakeSubcategories.id, id))
    .limit(1);
  return row ?? null;
}

export async function createMistakeCategory(data: {
  slug: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder?: number;
}) {
  const db = getDb();
  const [created] = await db
    .insert(mistakeCategories)
    .values({
      slug: data.slug,
      labelEn: data.labelEn,
      labelAr: data.labelAr ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    })
    .returning();
  return created;
}

export async function updateMistakeCategory(
  id: string,
  data: {
    labelEn?: string;
    labelAr?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  const db = getDb();
  const [updated] = await db
    .update(mistakeCategories)
    .set(data)
    .where(eq(mistakeCategories.id, id))
    .returning();
  return updated ?? null;
}

export async function createMistakeSubcategory(data: {
  categoryId: string;
  slug: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder?: number;
}) {
  const db = getDb();
  const [created] = await db
    .insert(mistakeSubcategories)
    .values({
      categoryId: data.categoryId,
      slug: data.slug,
      labelEn: data.labelEn,
      labelAr: data.labelAr ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
    })
    .returning();
  return created;
}

export async function updateMistakeSubcategory(
  id: string,
  data: {
    labelEn?: string;
    labelAr?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  const db = getDb();
  const [updated] = await db
    .update(mistakeSubcategories)
    .set(data)
    .where(eq(mistakeSubcategories.id, id))
    .returning();
  return updated ?? null;
}
