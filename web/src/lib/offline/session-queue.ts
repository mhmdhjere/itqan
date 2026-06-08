const QUEUE_PREFIX = "itqan:offline:";

export type QueuedVerseUpdate = {
  surah: number;
  ayah: number;
  statusSlug: string;
  mistakes?: string[];
  note?: string | null;
};

export type OfflineQueueEntry = {
  sessionId: string;
  verses: QueuedVerseUpdate[];
  updatedAt: string;
};

function queueKey(sessionId: string) {
  return `${QUEUE_PREFIX}${sessionId}`;
}

export function getOfflineQueue(sessionId: string): OfflineQueueEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(queueKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as OfflineQueueEntry;
  } catch {
    return null;
  }
}

export function enqueueVerseUpdates(
  sessionId: string,
  verses: QueuedVerseUpdate[],
): void {
  if (typeof window === "undefined" || verses.length === 0) return;

  const existing = getOfflineQueue(sessionId);
  const merged = new Map<string, QueuedVerseUpdate>();

  for (const v of existing?.verses ?? []) {
    merged.set(`${v.surah}:${v.ayah}`, v);
  }
  for (const v of verses) {
    merged.set(`${v.surah}:${v.ayah}`, v);
  }

  const entry: OfflineQueueEntry = {
    sessionId,
    verses: [...merged.values()],
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(queueKey(sessionId), JSON.stringify(entry));
}

export function clearOfflineQueue(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(queueKey(sessionId));
}

export async function flushOfflineQueue(
  sessionId: string,
): Promise<boolean> {
  const entry = getOfflineQueue(sessionId);
  if (!entry || entry.verses.length === 0) return true;

  const res = await fetch(`/api/sessions/${sessionId}/verses`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verses: entry.verses }),
  });

  if (res.ok) {
    clearOfflineQueue(sessionId);
    return true;
  }
  return false;
}
