export type ParentReportData = {
  studentName: string;
  circleName: string;
  periodStart: string;
  periodEnd: string;
  memorizedVerses: number;
  reviewedVerses: number;
  sessionCount: number;
  totalMinutes: number;
  masteryStart: number | null;
  masteryEnd: number | null;
  strengths: string[];
  improvements: string[];
  topWeakAyat: { surah: number; ayah: number; mistakeCount: number; surahName: string }[];
  teacherNotes: { body: string; createdAt: string }[];
};

export function formatReportPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth =
    s.getUTCFullYear() === e.getUTCFullYear() &&
    s.getUTCMonth() === e.getUTCMonth();
  if (sameMonth) {
    return s.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}
