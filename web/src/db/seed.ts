import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  appConfig,
  featureFlags,
  mistakeCategories,
  mistakeSubcategories,
  users,
  verseStatusDefinitions,
} from "@/db/schema";
import {
  defaultAppConfig,
  defaultFeatureFlags,
  defaultMistakeCategories,
  defaultMistakeSubcategories,
  defaultVerseStatuses,
} from "@/lib/config/defaults";

async function seedUser({
  email,
  password,
  name,
  role,
}: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "teacher";
}) {
  const db = getDb();
  const passwordHash = await bcrypt.hash(password, 12);
  const normalizedEmail = email.toLowerCase();

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, name, role, status: "active" })
      .where(eq(users.id, existing.id));
    console.log(`Updated ${role} user: ${normalizedEmail}`);
    return existing.id;
  }

  const [created] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      name,
      passwordHash,
      role,
      status: "active",
    })
    .returning({ id: users.id });

  console.log(`Created ${role} user: ${normalizedEmail}`);
  return created.id;
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Platform Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  return seedUser({ email, password, name, role: "admin" });
}

async function seedTeacher() {
  const email = process.env.TEACHER_EMAIL ?? "teacher@example.com";
  const password = process.env.TEACHER_PASSWORD ?? "change-me";
  const name = process.env.TEACHER_NAME ?? "Ustadh Ahmad";

  return seedUser({ email, password, name, role: "teacher" });
}

async function seedAppConfig() {
  const db = getDb();
  for (const entry of defaultAppConfig) {
    await db
      .insert(appConfig)
      .values({
        key: entry.key,
        valueJson: entry.value,
        valueType: entry.valueType,
        category: entry.category,
        label: entry.label,
        description: entry.description ?? null,
      })
      .onConflictDoUpdate({
        target: appConfig.key,
        set: {
          valueJson: entry.value,
          valueType: entry.valueType,
          category: entry.category,
          label: entry.label,
          description: entry.description ?? null,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`Seeded ${defaultAppConfig.length} app config keys`);
}

async function seedFeatureFlags() {
  const db = getDb();
  for (const flag of defaultFeatureFlags) {
    await db
      .insert(featureFlags)
      .values({
        key: flag.key,
        enabled: flag.enabled,
        description: flag.description,
        scope: "global",
      })
      .onConflictDoUpdate({
        target: featureFlags.key,
        set: {
          enabled: flag.enabled,
          description: flag.description,
        },
      });
  }
  console.log(`Seeded ${defaultFeatureFlags.length} feature flags`);
}

async function seedVerseStatuses() {
  const db = getDb();
  for (const status of defaultVerseStatuses) {
    const [existing] = await db
      .select()
      .from(verseStatusDefinitions)
      .where(eq(verseStatusDefinitions.slug, status.slug))
      .limit(1);

    if (existing) {
      await db
        .update(verseStatusDefinitions)
        .set({
          labelEn: status.labelEn,
          labelAr: status.labelAr,
          scorePoints: status.scorePoints,
          color: status.color,
          sortOrder: status.sortOrder,
          isDefaultImplicit: status.isDefaultImplicit,
          isActive: true,
        })
        .where(eq(verseStatusDefinitions.id, existing.id));
    } else {
      await db.insert(verseStatusDefinitions).values({
        slug: status.slug,
        labelEn: status.labelEn,
        labelAr: status.labelAr,
        scorePoints: status.scorePoints,
        color: status.color,
        sortOrder: status.sortOrder,
        isDefaultImplicit: status.isDefaultImplicit,
        isActive: true,
      });
    }
  }
  console.log(`Seeded ${defaultVerseStatuses.length} verse statuses`);
}

async function seedMistakeTaxonomy() {
  const db = getDb();
  const categoryIds = new Map<string, string>();

  for (const category of defaultMistakeCategories) {
    const [existing] = await db
      .select()
      .from(mistakeCategories)
      .where(eq(mistakeCategories.slug, category.slug))
      .limit(1);

    if (existing) {
      await db
        .update(mistakeCategories)
        .set({
          labelEn: category.labelEn,
          labelAr: category.labelAr,
          sortOrder: category.sortOrder,
          isActive: true,
        })
        .where(eq(mistakeCategories.id, existing.id));
      categoryIds.set(category.slug, existing.id);
    } else {
      const [created] = await db
        .insert(mistakeCategories)
        .values({
          slug: category.slug,
          labelEn: category.labelEn,
          labelAr: category.labelAr,
          sortOrder: category.sortOrder,
          isActive: true,
        })
        .returning({ id: mistakeCategories.id });
      categoryIds.set(category.slug, created.id);
    }
  }

  for (const sub of defaultMistakeSubcategories) {
    const categoryId = categoryIds.get(sub.categorySlug);
    if (!categoryId) continue;

    const [existing] = await db
      .select()
      .from(mistakeSubcategories)
      .where(eq(mistakeSubcategories.slug, sub.slug))
      .limit(1);

    if (existing) {
      await db
        .update(mistakeSubcategories)
        .set({
          categoryId,
          labelEn: sub.labelEn,
          sortOrder: sub.sortOrder,
          isActive: true,
        })
        .where(eq(mistakeSubcategories.id, existing.id));
    } else {
      await db.insert(mistakeSubcategories).values({
        categoryId,
        slug: sub.slug,
        labelEn: sub.labelEn,
        sortOrder: sub.sortOrder,
        isActive: true,
      });
    }
  }

  console.log(
    `Seeded ${defaultMistakeCategories.length} categories and ${defaultMistakeSubcategories.length} subcategories`,
  );
}

async function main() {
  console.log("Starting database seed...");
  await seedAdmin();
  await seedTeacher();
  await seedAppConfig();
  await seedFeatureFlags();
  await seedVerseStatuses();
  await seedMistakeTaxonomy();
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
