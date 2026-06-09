"use client";

import { Button } from "@/components/ui/Button";
import { formatRelativeDate } from "@/lib/format";

export function ResumeSessionBanner({
  sessionId,
  startedAt,
  passageLabel,
}: {
  sessionId: string;
  startedAt: string;
  passageLabel: string;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-amber-900">Session in progress</p>
        <p className="text-sm text-amber-800">
          Started {formatRelativeDate(startedAt)} · {passageLabel}
        </p>
      </div>
      <Button href={`/session/${sessionId}/live`} size="sm">
        Resume session
      </Button>
    </div>
  );
}
