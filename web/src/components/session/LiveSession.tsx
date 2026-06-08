"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveConfig } from "@/lib/hooks/useActiveConfig";
import { useSessionAutosave } from "@/lib/hooks/useSessionAutosave";
import { useSessionTimer } from "@/lib/hooks/useSessionTimer";
import { useStudent } from "@/lib/hooks/useStudent";
import {
  countVersesInRanges,
  formatRangesLabel,
  parseVerseKey,
  type SurahRange,
  verseKey,
} from "@/lib/session-ranges";
import { useLiveSessionStore } from "@/lib/stores/live-session-store";
import { formatTimer } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DetailPanel } from "./DetailPanel";
import { QuranCanvas } from "./QuranCanvas";

export function LiveSession({
  sessionId,
  studentId,
  ranges,
  initialMarks = {},
}: {
  sessionId: string;
  studentId: string;
  ranges: SurahRange[];
  initialMarks?: Record<string, import("@/lib/types").VerseMark>;
}) {
  const router = useRouter();
  const { student } = useStudent(studentId);
  const { config: activeConfig } = useActiveConfig();
  const totalVerses = countVersesInRanges(ranges);

  const marks = useLiveSessionStore((s) => s.marks);
  const focusedKey = useLiveSessionStore((s) => s.focusedKey);
  const init = useLiveSessionStore((s) => s.init);
  const applyMark = useLiveSessionStore((s) => s.applyMark);
  const saveDetail = useLiveSessionStore((s) => s.saveDetail);
  const undo = useLiveSessionStore((s) => s.undo);
  const setFocusedKey = useLiveSessionStore((s) => s.setFocusedKey);
  const setUndoDepth = useLiveSessionStore((s) => s.setUndoDepth);
  const canUndo = useLiveSessionStore((s) => s.canUndo);
  const reset = useLiveSessionStore((s) => s.reset);

  const [detailMistakes, setDetailMistakes] = useState<string[]>([]);
  const [detailNote, setDetailNote] = useState("");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [ending, setEnding] = useState(false);

  const undoDepth =
    (activeConfig?.config.live.undo_depth as number | undefined) ?? 20;
  const seconds = useSessionTimer(true);
  const { flush } = useSessionAutosave(sessionId, marks);

  useEffect(() => {
    init(sessionId, initialMarks, undoDepth);
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per session
  }, [sessionId]);

  useEffect(() => {
    setUndoDepth(undoDepth);
  }, [undoDepth, setUndoDepth]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (Object.keys(marks).length > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [marks]);

  const exceptionCount = useMemo(
    () => Object.values(marks).filter((m) => m.status !== "correct").length,
    [marks],
  );

  const openDetail = useCallback(
    (surah: number, ayah: number) => {
      const key = verseKey(surah, ayah);
      const existing = marks[key];
      setFocusedKey(key);
      setDetailMistakes(existing?.mistakes ?? []);
      setDetailNote(existing?.note ?? "");
    },
    [marks, setFocusedKey],
  );

  const handleAyahClick = useCallback(
    (surah: number, ayah: number) => {
      const key = verseKey(surah, ayah);
      const current = marks[key]?.status;

      if (!current) {
        applyMark(surah, ayah, "second_attempt");
        return;
      }
      if (current === "second_attempt") {
        applyMark(surah, ayah, "third_attempt");
        return;
      }
      openDetail(surah, ayah);
    },
    [marks, applyMark, openDetail],
  );

  const handleDetailDone = () => {
    if (focusedKey === null) return;
    saveDetail(focusedKey, detailMistakes, detailNote);
    setDetailMistakes([]);
    setDetailNote("");
  };

  const endSession = async () => {
    setEnding(true);
    await flush();
    const res = await fetch(`/api/sessions/${sessionId}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationSeconds: seconds }),
    });
    if (res.ok) {
      router.push(`/session/${sessionId}/summary`);
    } else {
      setEnding(false);
      setShowEndConfirm(false);
    }
  };

  const detailSurah =
    focusedKey !== null ? parseVerseKey(focusedKey).surah : null;
  const detailAyah =
    focusedKey !== null ? parseVerseKey(focusedKey).ayah : null;
  const [detailSnippet, setDetailSnippet] = useState("");
  const [detailSurahName, setDetailSurahName] = useState("");

  useEffect(() => {
    if (detailSurah === null || detailAyah === null) return;
    fetch(`/api/quran/${detailSurah}`)
      .then((res) => res.json())
      .then((data) => {
        setDetailSurahName(data.surah?.nameEn ?? `Surah ${detailSurah}`);
        const ayah = data.ayahs?.find(
          (a: { ayah: number }) => a.ayah === detailAyah,
        );
        setDetailSnippet(ayah?.text?.slice(0, 60) ?? "");
      })
      .catch(() => {
        setDetailSurahName(`Surah ${detailSurah}`);
        setDetailSnippet("");
      });
  }, [detailSurah, detailAyah]);

  return (
    <div className="flex h-dvh flex-col bg-quran-bg">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {student?.fullName ?? "Student"}
          </p>
          <p
            className="truncate text-xs text-muted"
            title={formatRangesLabel(ranges)}
          >
            {ranges.length === 1
              ? formatRangesLabel(ranges)
              : `${ranges.length} passages · ${totalVerses} verses`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-sm text-muted">
          <span aria-label="Session timer">{formatTimer(seconds)}</span>
          <span aria-label="Exception count">
            <span className="font-medium text-foreground">{exceptionCount}</span>{" "}
            marked
          </span>
        </div>
      </header>

      <p className="shrink-0 border-b border-border bg-stone-50 px-4 py-1.5 text-center text-xs text-muted">
        Tap ayah: 2nd attempt → 3rd attempt → mistakes
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <QuranCanvas
          ranges={ranges}
          marks={marks}
          activeConfig={activeConfig}
          onAyahClick={handleAyahClick}
        />
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t border-border bg-surface px-4 py-3">
        <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo()}>
          Undo
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowEndConfirm(true)}
        >
          End Session
        </Button>
      </footer>

      {focusedKey !== null && detailSurah !== null && detailAyah !== null && (
        <DetailPanel
          surahName={detailSurahName || `Surah ${detailSurah}`}
          ayah={detailAyah}
          ayahSnippet={detailSnippet}
          selectedMistakes={detailMistakes}
          note={detailNote}
          activeConfig={activeConfig}
          onToggleMistake={(slug) =>
            setDetailMistakes((prev) =>
              prev.includes(slug)
                ? prev.filter((s) => s !== slug)
                : [...prev, slug],
            )
          }
          onNoteChange={setDetailNote}
          onDone={handleDetailDone}
          onClose={() => setFocusedKey(null)}
        />
      )}

      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div
            className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl"
            role="dialog"
          >
            <h2 className="text-lg font-semibold">End session?</h2>
            <p className="mt-2 text-sm text-muted">
              {exceptionCount} verse{exceptionCount !== 1 ? "s" : ""} marked
              across {ranges.length} passage{ranges.length !== 1 ? "s" : ""}.
              Remaining verses will be recorded as correct.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowEndConfirm(false)}
                disabled={ending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={endSession}
                disabled={ending}
              >
                {ending ? "Saving…" : "End & Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
