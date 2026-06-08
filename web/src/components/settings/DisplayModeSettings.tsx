"use client";

import { Card } from "@/components/ui/Card";
import { useTeacherPreferences } from "@/lib/hooks/useTeacherPreferences";
import type { QuranDisplayMode } from "@/lib/mushaf/types";
import { cn } from "@/lib/utils";

export function DisplayModeSettings() {
  const { mode, setMode, loaded } = useTeacherPreferences();

  const options: { value: QuranDisplayMode; label: string; desc: string }[] = [
    {
      value: "structured",
      label: "Structured",
      desc: "One ayah per row — best for tracking and quick taps.",
    },
    {
      value: "mushaf",
      label: "Mushaf",
      desc: "Madinah page layout — authentic read-along experience.",
    },
  ];

  return (
    <Card className="mt-4">
      <h2 className="font-medium">Quran display</h2>
      <p className="mt-1 text-sm text-muted">
        Default view for live recitation sessions.
      </p>
      <div className="mt-4 space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
              mode === opt.value
                ? "border-accent bg-accent-light/40"
                : "border-border hover:bg-stone-50",
              !loaded && "pointer-events-none opacity-60",
            )}
          >
            <input
              type="radio"
              name="quran_display_mode"
              value={opt.value}
              checked={mode === opt.value}
              onChange={() => void setMode(opt.value)}
              className="mt-1"
            />
            <span>
              <span className="font-medium">{opt.label}</span>
              <span className="mt-0.5 block text-sm text-muted">{opt.desc}</span>
            </span>
          </label>
        ))}
      </div>
    </Card>
  );
}
