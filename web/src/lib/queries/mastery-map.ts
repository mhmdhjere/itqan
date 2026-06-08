import { getActiveConfig } from "@/lib/config/service";
import {
  buildMasteryMapFromHistory,
  computeSurahAggregate,
} from "@/lib/mastery/map-state";
import { getSurahIndex } from "@/lib/quran";
import type { AyahMasteryCell, MasteryMapState, SurahMasteryCell } from "@/lib/types";
import { buildAyahHistory } from "./ayah-history";
import { listMasterySnapshots } from "./mastery-snapshots";
import { getStudentForTeacher } from "./students";

export type MasteryMapDto = {
  surahs: SurahMasteryCell[];
  ayahs: Record<number, AyahMasteryCell[]>;
};

export async function getStudentMasteryMap(
  studentId: string,
  teacherId: string,
): Promise<MasteryMapDto | null> {
  const student = await getStudentForTeacher(studentId, teacherId);
  if (!student) return null;

  const config = await getActiveConfig();
  const snapshots = await listMasterySnapshots(studentId);
  const surahIndex = getSurahIndex();

  if (snapshots.length > 0) {
    const ayahsBySurah: Record<number, AyahMasteryCell[]> = {};

    for (const meta of surahIndex) {
      const ayahCells: AyahMasteryCell[] = [];
      for (let ayah = 1; ayah <= meta.ayahCount; ayah++) {
        const snap = snapshots.find(
          (s) => s.surah === meta.number && s.ayah === ayah,
        );
        ayahCells.push({
          ayah,
          state: (snap?.state as MasteryMapState) ?? "not_recited",
          score: snap?.score ?? 0,
          lastRecitedAt: snap?.lastRecitedAt?.toISOString() ?? null,
          topMistakes: snap?.topMistakes ?? [],
        });
      }
      ayahsBySurah[meta.number] = ayahCells;
    }

    const surahs = surahIndex.map((meta) => {
      const cells = ayahsBySurah[meta.number] ?? [];
      const recited = cells.filter((c) => c.state !== "not_recited");
      const aggregate = computeSurahAggregate(recited);
      return {
        surah: meta.number,
        state: aggregate.state,
        score: aggregate.score,
      };
    });

    return { surahs, ayahs: ayahsBySurah };
  }

  const history = await buildAyahHistory(studentId);
  const { surahs, ayahsBySurah } = buildMasteryMapFromHistory(history, config);
  const ayahs: Record<number, AyahMasteryCell[]> = {};
  for (const [surah, cells] of ayahsBySurah) {
    ayahs[surah] = cells;
  }

  return { surahs, ayahs };
}

export async function getAyahMapDetail(
  studentId: string,
  teacherId: string,
  surah: number,
  ayah: number,
) {
  const map = await getStudentMasteryMap(studentId, teacherId);
  if (!map) return null;
  return map.ayahs[surah]?.find((a) => a.ayah === ayah) ?? null;
}
