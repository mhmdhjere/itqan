import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { studentMasterySnapshots } from "@/db/schema";
import { getActiveConfig } from "@/lib/config/service";
import { assignMasteryMapState } from "@/lib/mastery/map-state";
import { verseKey } from "@/lib/session-ranges";
import { buildAyahHistory } from "./ayah-history";

export async function refreshMasterySnapshotsForSession(
  studentId: string,
  affectedAyahs: { surah: number; ayah: number }[],
) {
  if (affectedAyahs.length === 0) return;

  const config = await getActiveConfig();
  const history = await buildAyahHistory(studentId, 50);

  const byAyah = new Map<string, typeof history>();
  for (const record of history) {
    const key = verseKey(record.surah, record.ayah);
    const list = byAyah.get(key) ?? [];
    list.push(record);
    byAyah.set(key, list);
  }

  const db = getDb();

  for (const { surah, ayah } of affectedAyahs) {
    const key = verseKey(surah, ayah);
    const ayahHistory = byAyah.get(key) ?? [];
    const result = assignMasteryMapState(ayahHistory, config);

    const [existing] = await db
      .select()
      .from(studentMasterySnapshots)
      .where(
        and(
          eq(studentMasterySnapshots.studentId, studentId),
          eq(studentMasterySnapshots.surah, surah),
          eq(studentMasterySnapshots.ayah, ayah),
        ),
      )
      .limit(1);

    const values = {
      state: result.state,
      score: result.score,
      topMistakes: result.topMistakes,
      lastRecitedAt: result.lastRecitedAt
        ? new Date(result.lastRecitedAt)
        : null,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(studentMasterySnapshots)
        .set(values)
        .where(eq(studentMasterySnapshots.id, existing.id));
    } else if (result.state !== "not_recited") {
      await db.insert(studentMasterySnapshots).values({
        studentId,
        surah,
        ayah,
        ...values,
      });
    }
  }
}

export async function refreshAllMasterySnapshots(studentId: string) {
  const history = await buildAyahHistory(studentId, 100);
  const ayahs = [
    ...new Set(history.map((h) => verseKey(h.surah, h.ayah))),
  ].map((key) => {
    const [surah, ayah] = key.split(":").map(Number);
    return { surah, ayah };
  });

  await refreshMasterySnapshotsForSession(studentId, ayahs);
}

export async function listMasterySnapshots(studentId: string) {
  const db = getDb();
  return db
    .select()
    .from(studentMasterySnapshots)
    .where(eq(studentMasterySnapshots.studentId, studentId));
}

export async function deleteSnapshotsForAyahs(
  studentId: string,
  ayahs: { surah: number; ayah: number }[],
) {
  if (ayahs.length === 0) return;
  const db = getDb();
  for (const { surah, ayah } of ayahs) {
    await db
      .delete(studentMasterySnapshots)
      .where(
        and(
          eq(studentMasterySnapshots.studentId, studentId),
          eq(studentMasterySnapshots.surah, surah),
          eq(studentMasterySnapshots.ayah, ayah),
        ),
      );
  }
}
