"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/format";

type Note = {
  id: string;
  body: string;
  createdAt: string;
};

export function StudentNotes({ studentId }: { studentId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/notes?scope=student&refId=${studentId}`,
    );
    if (res.ok) {
      const data = await res.json();
      setNotes(data.notes ?? []);
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const addNote = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: "student",
        refId: studentId,
        body: trimmed,
      }),
    });
    if (res.ok) {
      setBody("");
      await load();
    }
    setSaving(false);
  };

  return (
    <Card>
      <h2 className="font-semibold">Teacher notes</h2>
      <p className="mt-1 text-sm text-muted">
        Private notes about this student (not shown to students).
      </p>

      <div className="mt-4 flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note…"
          rows={2}
          className="min-h-[2.5rem] flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
        <Button size="sm" onClick={addNote} disabled={saving || !body.trim()}>
          {saving ? "Saving…" : "Add"}
        </Button>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-muted">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No notes yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border border-border bg-stone-50 px-3 py-2"
            >
              <p className="text-sm">{note.body}</p>
              <p className="mt-1 text-xs text-muted">
                {formatRelativeDate(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
