"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatSurahRange } from "@/lib/format";
import type { ReviewRecommendationDto } from "@/lib/queries/review-recommendations";

export function ReviewRecommendations({
  studentId,
  limit = 3,
  onPin,
}: {
  studentId: string;
  limit?: number;
  onPin?: () => void;
}) {
  const [items, setItems] = useState<ReviewRecommendationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/students/${studentId}/review-recommendations`)
      .then((res) => (res.ok ? res.json() : { recommendations: [] }))
      .then((data) => setItems(data.recommendations ?? []))
      .finally(() => setLoading(false));
  }, [studentId]);

  const pinRecommendation = async (rec: ReviewRecommendationDto) => {
    const res = await fetch(`/api/students/${studentId}/review-targets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surah: rec.surah,
        startAyah: rec.startAyah,
        endAyah: rec.endAyah,
        source: "algorithm",
      }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((item) =>
          item.surah === rec.surah &&
          item.startAyah === rec.startAyah &&
          item.endAyah === rec.endAyah
            ? { ...item, alreadyPinned: true }
            : item,
        ),
      );
      onPin?.();
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading suggestions…</p>;
  }

  const visible = items.filter((i) => !i.alreadyPinned).slice(0, limit);

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted">
        No review suggestions right now. Keep recording sessions to surface weak
        passages.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {visible.map((rec) => (
        <li
          key={`${rec.surah}-${rec.startAyah}-${rec.endAyah}`}
          className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
        >
          <div>
            <p className="font-medium">
              {formatSurahRange(rec.surah, rec.startAyah, rec.endAyah)}
            </p>
            <p className="text-xs text-muted">
              Urgency {rec.urgency.toFixed(1)} · {rec.masteryScore}% mastery
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => pinRecommendation(rec)}
          >
            Pin
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function ReviewRecommendationsInline({
  studentId,
}: {
  studentId: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">Suggested review</h3>
        <Badge variant="muted">Auto</Badge>
      </div>
      <div className="mt-2">
        <ReviewRecommendations studentId={studentId} limit={3} />
      </div>
    </div>
  );
}
