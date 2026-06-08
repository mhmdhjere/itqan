import { getSurahMeta } from "@/lib/quran";

export type TimelineEventType =
  | "session_complete"
  | "surah_started"
  | "surah_completed"
  | "juz_milestone"
  | "mastery_improvement"
  | "review_milestone";

export type TimelineEvent = {
  type: TimelineEventType;
  occurredAt: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

export type HeatmapDay = {
  date: string;
  sessionCount: number;
};

type SessionInput = {
  id: string;
  endedAt: string;
  sessionType?: string;
  masteryScore?: number;
  passages: { surah: number; startAyah: number; endAyah: number }[];
};

type SnapshotInput = {
  surah: number;
  ayah: number;
  state: string;
  score: number;
};

export function buildTimelineEvents(
  sessions: SessionInput[],
  snapshots: SnapshotInput[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const surahsStarted = new Set<number>();
  const surahsCompleted = new Set<number>();

  const sortedSessions = [...sessions].sort((a, b) =>
    a.endedAt.localeCompare(b.endedAt),
  );

  for (const session of sortedSessions) {
    events.push({
      type: "session_complete",
      occurredAt: session.endedAt,
      title:
        session.sessionType === "review"
          ? "Review session completed"
          : "Recitation session completed",
      metadata: {
        sessionId: session.id,
        masteryScore: session.masteryScore,
      },
    });

    for (const passage of session.passages) {
      if (!surahsStarted.has(passage.surah)) {
        surahsStarted.add(passage.surah);
        const meta = getSurahMeta(passage.surah);
        events.push({
          type: "surah_started",
          occurredAt: session.endedAt,
          title: `Started Surah ${meta.nameEn}`,
          metadata: { surah: passage.surah },
        });
      }
    }
  }

  const bySurah = new Map<number, SnapshotInput[]>();
  for (const snap of snapshots) {
    const list = bySurah.get(snap.surah) ?? [];
    list.push(snap);
    bySurah.set(snap.surah, list);
  }

  for (const [surah, cells] of bySurah) {
    if (surahsCompleted.has(surah)) continue;
    const meta = getSurahMeta(surah);
    const memorized = cells.filter((c) => c.state === "memorized").length;
    if (memorized >= meta.ayahCount * 0.9) {
      surahsCompleted.add(surah);
      const lastSession = sortedSessions.findLast((s) =>
        s.passages.some((p) => p.surah === surah),
      );
      events.push({
        type: "surah_completed",
        occurredAt: lastSession?.endedAt ?? new Date().toISOString(),
        title: `Completed Surah ${meta.nameEn}`,
        metadata: { surah },
      });
    }
  }

  const reviewSessions = sortedSessions.filter((s) => s.sessionType === "review");
  if (reviewSessions.length >= 5) {
    events.push({
      type: "review_milestone",
      occurredAt: reviewSessions[4].endedAt,
      title: "5 review sessions completed",
      description: "Consistent review practice",
    });
  }

  const masterySessions = sortedSessions.filter(
    (s) => (s.masteryScore ?? 0) >= 80,
  );
  if (masterySessions.length >= 3) {
    const recent = masterySessions.slice(-3);
    const avg =
      recent.reduce((s, x) => s + (x.masteryScore ?? 0), 0) / recent.length;
    events.push({
      type: "mastery_improvement",
      occurredAt: recent[recent.length - 1].endedAt,
      title: "Strong recent performance",
      description: `Average ${Math.round(avg)}% over last 3 sessions`,
    });
  }

  return events.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export function buildActivityHeatmap(
  sessions: { endedAt: string }[],
  months = 12,
): HeatmapDay[] {
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - months);
  start.setHours(0, 0, 0, 0);

  const counts = new Map<string, number>();
  for (const session of sessions) {
    const d = new Date(session.endedAt);
    if (d < start) continue;
    const key = d.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days: HeatmapDay[] = [];
  const cursor = new Date(start);
  while (cursor <= now) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ date: key, sessionCount: counts.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function groupEventsByMonth(
  events: TimelineEvent[],
): { month: string; events: TimelineEvent[] }[] {
  const groups = new Map<string, TimelineEvent[]>();
  for (const event of events) {
    const month = event.occurredAt.slice(0, 7);
    const list = groups.get(month) ?? [];
    list.push(event);
    groups.set(month, list);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, evts]) => ({ month, events: evts }));
}
