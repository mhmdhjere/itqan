import type { ActiveConfig } from "@/lib/config/types";
import {
  aggregateMistakeBreakdown,
  computeSessionMastery,
  computeVerseScore,
} from "@/lib/mastery/scoring";
import { getSurahMeta } from "@/lib/quran";
import type { SurahRange } from "@/lib/session-ranges";
import { countVersesInRanges, verseKey } from "@/lib/session-ranges";
import type { VerseMark, VerseStatusSlug } from "@/lib/types";

export type SessionSummaryJson = {
  versesRecited: number;
  exceptionCount: number;
  reminderCount: number;
  secondAttemptCount: number;
  thirdAttemptCount: number;
  promptingCount: number;
  incompleteCount: number;
  masteryScore: number;
  mistakeBreakdown: { category: string; count: number }[];
  markedVerses: {
    surah: number;
    ayah: number;
    status: string;
    mistakes: string[];
  }[];
};

export function computeSessionSummary(
  ranges: SurahRange[],
  marks: Record<string, VerseMark>,
  config: ActiveConfig | null,
): SessionSummaryJson {
  const versesRecited = countVersesInRanges(ranges, (surah) =>
    getSurahMeta(surah).ayahCount,
  );
  const markedList = Object.values(marks);
  const exceptionCount = markedList.length;

  const counts = {
    reminderCount: 0,
    secondAttemptCount: 0,
    thirdAttemptCount: 0,
    promptingCount: 0,
    incompleteCount: 0,
  };

  const verseInputs: { statusSlug: string; mistakes: string[] }[] = [];

  for (const range of ranges) {
    for (let ayah = range.startAyah; ayah <= range.endAyah; ayah++) {
      const key = verseKey(range.surah, ayah);
      const mark = marks[key];
      const statusSlug = mark?.status ?? "correct";
      const mistakes = mark?.mistakes ?? [];

      verseInputs.push({ statusSlug, mistakes });

      if (mark) {
        const status = mark.status as VerseStatusSlug;
        if (status === "reminder_required") counts.reminderCount++;
        else if (status === "second_attempt") counts.secondAttemptCount++;
        else if (status === "third_attempt") counts.thirdAttemptCount++;
        else if (status === "prompting_required") counts.promptingCount++;
        else if (status === "incomplete") counts.incompleteCount++;
      }
    }
  }

  const masteryScore = computeSessionMastery(verseInputs, config);
  const mistakeBreakdown = aggregateMistakeBreakdown(
    markedList.map((m) => ({ mistakes: m.mistakes ?? [] })),
    config,
  );

  return {
    versesRecited,
    exceptionCount,
    ...counts,
    masteryScore,
    mistakeBreakdown,
    markedVerses: markedList.map((m) => ({
      surah: m.surah,
      ayah: m.ayah,
      status: m.status,
      mistakes: m.mistakes ?? [],
    })),
  };
}

export { computeVerseScore };
