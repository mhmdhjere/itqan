"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useActiveConfig } from "@/lib/hooks/useActiveConfig";

export function AiSummaryCard({ sessionId }: { sessionId: string }) {
  const { config } = useActiveConfig();
  const [status, setStatus] = useState<"idle" | "loading" | "unavailable">(
    "idle",
  );

  const enabled = config?.config.features.ai_session_summary === true;

  useEffect(() => {
    if (!enabled) return;
    setStatus("loading");
    fetch(`/api/sessions/${sessionId}/ai-summary`)
      .then(() => setStatus("unavailable"))
      .catch(() => setStatus("unavailable"));
  }, [sessionId, enabled]);

  if (!enabled) return null;

  return (
    <Card className="mt-4 border-dashed">
      <h2 className="font-semibold">AI insights</h2>
      {status === "loading" && (
        <p className="mt-2 text-sm text-muted">Generating insights…</p>
      )}
      {status === "unavailable" && (
        <p className="mt-2 text-sm text-muted">
          AI session summary is coming soon. Review before sharing with parents.
        </p>
      )}
    </Card>
  );
}
