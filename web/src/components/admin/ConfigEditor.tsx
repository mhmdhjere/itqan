"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { AdminConfigRow } from "@/lib/config/admin";

const GROUP_LABELS: Record<string, string> = {
  mastery: "Mastery scoring",
  review: "Review engine",
  live_session: "Live session UX",
  display: "Quran display",
  system: "System",
};

type ConfigEditorProps = {
  categories: string[];
};

export function ConfigEditor({ categories }: ConfigEditorProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "mastery");
  const [config, setConfig] = useState<Record<string, AdminConfigRow[]>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data: { config: Record<string, AdminConfigRow[]> }) => {
        setConfig(data.config);
        const flat: Record<string, string> = {};
        for (const rows of Object.values(data.config)) {
          for (const row of rows) {
            flat[row.key] = String(row.value);
          }
        }
        setValues(flat);
      })
      .finally(() => setLoading(false));
  }, []);

  const rows = config[activeCategory] ?? [];

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const updates = rows.map((row) => {
      const raw = values[row.key];
      let value: unknown = raw;
      if (row.valueType === "number") value = Number(raw);
      if (row.valueType === "boolean") value = raw === "true";
      return { key: row.key, value };
    });

    const res = await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    setSaving(false);
    setMessage(res.ok ? "Saved — teacher app reflects within 60s" : "Save failed");
  }

  if (loading) {
    return <p className="text-muted">Loading configuration…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {GROUP_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="mt-6">
        <Card className="space-y-4">
          <h2 className="font-semibold">{GROUP_LABELS[activeCategory]}</h2>
          {rows.map((row) => (
            <div key={row.key}>
              <label className="mb-1 block text-sm font-medium">{row.label}</label>
              {row.description && (
                <p className="mb-1 text-xs text-muted">{row.description}</p>
              )}
              {row.valueType === "boolean" ? (
                <select
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  value={values[row.key] ?? "false"}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [row.key]: e.target.value }))
                  }
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              ) : (
                <input
                  type={row.valueType === "number" ? "number" : "text"}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  value={values[row.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [row.key]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save group"}
            </Button>
            {message && <span className="text-sm text-muted">{message}</span>}
          </div>
        </Card>
      </form>
    </div>
  );
}
