"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FeatureFlagDto } from "@/lib/config/feature-flags";

export function FeatureFlagsEditor() {
  const [flags, setFlags] = useState<FeatureFlagDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/feature-flags")
      .then((res) => res.json())
      .then((data) => setFlags(data.flags ?? []))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)),
    );
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/feature-flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flags: flags.map((f) => ({ key: f.key, enabled: f.enabled })),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) return <p className="text-muted">Loading flags…</p>;

  return (
    <Card className="mt-6 space-y-4">
      {flags.map((flag) => (
        <label
          key={flag.key}
          className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0"
        >
          <div>
            <p className="font-medium">{flag.key.replace("features.", "")}</p>
            {flag.description && (
              <p className="text-sm text-muted">{flag.description}</p>
            )}
          </div>
          <input
            type="checkbox"
            checked={flag.enabled}
            onChange={() => toggle(flag.key)}
            className="mt-1 h-4 w-4"
          />
        </label>
      ))}
      <Button onClick={save} disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved" : "Save flags"}
      </Button>
    </Card>
  );
}
