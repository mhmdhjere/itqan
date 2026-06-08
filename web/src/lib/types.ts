export type VerseStatusSlug =
  | "correct"
  | "reminder_required"
  | "second_attempt"
  | "third_attempt"
  | "prompting_required"
  | "incomplete";

export type MasteryMapState =
  | "memorized"
  | "needs_review"
  | "frequently_weak"
  | "not_recited";

export type MistakeCategory = "memorization" | "tajweed" | "behavior";

export interface Circle {
  id: string;
  name: string;
  description: string;
  studentCount: number;
  lastSessionAt: string | null;
}

export interface Student {
  id: string;
  circleId: string;
  fullName: string;
  contactInfo: string;
  masteryPercent: number;
  masteryTrend: number;
  lastSessionAt: string | null;
  totalVerses: number;
  totalSessions: number;
  commonMistake: string;
}

export interface MemorizationPlan {
  studentId: string;
  currentSurah: number;
  currentStartAyah: number;
  currentEndAyah: number;
  nextSurah: number;
  nextStartAyah: number;
  nextEndAyah: number;
}

export interface ReviewTarget {
  id: string;
  studentId: string;
  surah: number;
  startAyah: number;
  endAyah: number;
  source: "manual" | "algorithm";
}

export interface SurahMeta {
  number: number;
  nameEn: string;
  nameAr: string;
  ayahCount: number;
}

export interface Ayah {
  surah: number;
  ayah: number;
  text: string;
}

export interface VerseStatusDefinition {
  slug: VerseStatusSlug;
  label: string;
  color: string;
  scorePoints: number;
}

export interface MistakeSubcategory {
  slug: string;
  label: string;
  category: MistakeCategory;
}

export interface SessionSummary {
  id: string;
  studentId: string;
  surah: number;
  startAyah: number;
  endAyah: number;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  versesRecited: number;
  exceptionCount: number;
  reminderCount: number;
  secondAttemptCount: number;
  promptingCount: number;
  incompleteCount: number;
  masteryScore: number;
  mistakeBreakdown: { category: MistakeCategory; percent: number }[];
  markedVerses: {
    ayah: number;
    status: VerseStatusSlug;
    mistakes: string[];
  }[];
}

export interface SessionListItem {
  id: string;
  studentId: string;
  date: string;
  surah: number;
  startAyah: number;
  endAyah: number;
  masteryScore: number;
  exceptionCount: number;
}

export interface SurahMasteryCell {
  surah: number;
  state: MasteryMapState;
  score: number;
}

export interface AyahMasteryCell {
  ayah: number;
  state: MasteryMapState;
  score: number;
  lastRecitedAt: string | null;
  topMistakes: string[];
}

export interface VerseMark {
  surah: number;
  ayah: number;
  status: VerseStatusSlug;
  mistakes: string[];
  note?: string;
}

export interface SurahRangeInput {
  surah: number;
  startAyah: number;
  endAyah: number;
}
