import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import type { QuranDisplayMode } from "@/lib/mushaf/types";

export type UserPreferences = {
  quran_display_mode?: QuranDisplayMode;
};

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferences> {
  const db = getDb();
  const [row] = await db
    .select({ preferencesJson: users.preferencesJson })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return (row?.preferencesJson as UserPreferences | null) ?? {};
}

export async function updateUserPreferences(
  userId: string,
  patch: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const db = getDb();
  const current = await getUserPreferences(userId);
  const next = { ...current, ...patch };

  await db
    .update(users)
    .set({ preferencesJson: next })
    .where(eq(users.id, userId));

  return next;
}
