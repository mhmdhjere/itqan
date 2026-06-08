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

export function SessionNoteSection({ sessionId }: { sessionId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/notes?scope=session&refId=${sessionId}`,
    );
    if (res.ok) {
      const data = await res.json();
      setNotes(data.notes ?? []);
    }
    setLoading(false);
  }, [sessionId]);

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
        scope: "session",
        refId: sessionId,
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
    <Card className="mt-6">
      <h2 className="font-semibold">Session note</h2>
      {loading ? (
        <p className="mt-2 text-sm text-muted">Loading…</p>
      ) : notes.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="text-sm">
              <p>{note.body}</p>
              <p className="text-xs text-muted">
                {formatRelativeDate(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Reflections on this session…"
          rows={2}
          className="min-h-[2.5rem] flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
        <Button size="sm" onClick={addNote} disabled={saving || !body.trim()}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
