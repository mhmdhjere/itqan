import type { ActiveConfig } from "@/lib/config/types";
import type { SurahRange } from "@/lib/session-ranges";
import { countVersesInRanges, verseKey } from "@/lib/session-ranges";
import type { VerseMark } from "@/lib/types";

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
  const versesRecited = countVersesInRanges(ranges);
  const statusPoints = new Map(
    config?.verseStatuses.map((s) => [s.slug, s.scorePoints]) ?? [],
  );
  const mistakePenalty =
    (config?.config.mastery.mistake_penalty as number | undefined) ?? 5;

  const categoryBySlug = new Map(
    config?.mistakeSubcategories.map((s) => [s.slug, s.categorySlug]) ?? [],
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

  const mistakeCounts = new Map<string, number>();
  let scoreSum = 0;

  for (const range of ranges) {
    for (let ayah = range.startAyah; ayah <= range.endAyah; ayah++) {
      const key = verseKey(range.surah, ayah);
      const mark = marks[key];
      if (!mark) {
        scoreSum += statusPoints.get("correct") ?? 100;
        continue;
      }

      const base = statusPoints.get(mark.status) ?? 0;
      const penalty = (mark.mistakes?.length ?? 0) * mistakePenalty;
      scoreSum += Math.max(base - penalty, 0);

      if (mark.status === "reminder_required") counts.reminderCount++;
      else if (mark.status === "second_attempt") counts.secondAttemptCount++;
      else if (mark.status === "third_attempt") counts.thirdAttemptCount++;
      else if (mark.status === "prompting_required") counts.promptingCount++;
      else if (mark.status === "incomplete") counts.incompleteCount++;

      for (const m of mark.mistakes ?? []) {
        const cat = categoryBySlug.get(m) ?? "other";
        mistakeCounts.set(cat, (mistakeCounts.get(cat) ?? 0) + 1);
      }
    }
  }

  const masteryScore =
    versesRecited > 0 ? Math.round(scoreSum / versesRecited) : 100;

  return {
    versesRecited,
    exceptionCount,
    ...counts,
    masteryScore,
    mistakeBreakdown: [...mistakeCounts.entries()].map(([category, count]) => ({
      category,
      count,
    })),
    markedVerses: markedList.map((m) => ({
      surah: m.surah,
      ayah: m.ayah,
      status: m.status,
      mistakes: m.mistakes ?? [],
    })),
  };
}
