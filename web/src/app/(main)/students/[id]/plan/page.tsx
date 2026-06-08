"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ReviewRecommendations } from "@/components/students/ReviewRecommendations";
import { formatSurahRange } from "@/lib/format";
import { useStudent } from "@/lib/hooks/useStudent";
import type { MemorizationPlanDto, ReviewTargetDto } from "@/lib/queries/plans";
import type { SurahMeta } from "@/lib/types";

const DEFAULT_PLAN = {
  currentSurah: 1,
  currentStartAyah: 1,
  currentEndAyah: 7,
  nextSurah: 2,
  nextStartAyah: 1,
  nextEndAyah: 5,
};

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { student, loading: studentLoading, notFound } = useStudent(studentId);

  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [reviews, setReviews] = useState<ReviewTargetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newReview, setNewReview] = useState({
    surah: 87,
    startAyah: 1,
    endAyah: 19,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/quran/surahs").then((r) => r.json()),
      fetch(`/api/students/${studentId}/memorization-plan`).then((r) => r.json()),
      fetch(`/api/students/${studentId}/review-targets`).then((r) => r.json()),
    ])
      .then(([surahData, planData, reviewData]) => {
        setSurahs(surahData.surahs ?? []);
        if (planData.plan) {
          const p = planData.plan as MemorizationPlanDto;
          setPlan({
            currentSurah: p.currentSurah,
            currentStartAyah: p.currentStartAyah,
            currentEndAyah: p.currentEndAyah,
            nextSurah: p.nextSurah,
            nextStartAyah: p.nextStartAyah,
            nextEndAyah: p.nextEndAyah,
          });
        }
        setReviews(reviewData.reviewTargets ?? []);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  function getAyahCount(surah: number) {
    return surahs.find((s) => s.number === surah)?.ayahCount ?? 999;
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/students/${studentId}/memorization-plan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
      return;
    }

    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  async function addReviewTarget() {
    const res = await fetch(`/api/students/${studentId}/review-targets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });
    if (res.ok) {
      const data = await res.json();
      setReviews((prev) => [...prev, data.reviewTarget]);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to add review target");
    }
  }

  async function removeReviewTarget(targetId: string) {
    const res = await fetch(
      `/api/students/${studentId}/review-targets/${targetId}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== targetId));
    }
  }

  if (studentLoading || loading) {
    return <p className="p-6 text-muted">Loading…</p>;
  }

  if (notFound || !student) {
    return <p className="p-6">Student not found.</p>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
      <Link
        href={`/students/${studentId}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← {student.fullName}
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Memorization Plan</h1>

      <form onSubmit={handleSave}>
        <Card className="mt-4 space-y-4">
          <fieldset>
            <legend className="text-sm font-semibold">Current memorization</legend>
            <div className="mt-2 space-y-2">
              <select
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                value={plan.currentSurah}
                onChange={(e) =>
                  setPlan({ ...plan, currentSurah: Number(e.target.value) })
                }
              >
                {surahs.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.nameEn}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <label className="flex-1 text-sm">
                  From
                  <input
                    type="number"
                    min={1}
                    max={getAyahCount(plan.currentSurah)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                    value={plan.currentStartAyah}
                    onChange={(e) =>
                      setPlan({
                        ...plan,
                        currentStartAyah: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="flex-1 text-sm">
                  To
                  <input
                    type="number"
                    min={plan.currentStartAyah}
                    max={getAyahCount(plan.currentSurah)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                    value={plan.currentEndAyah}
                    onChange={(e) =>
                      setPlan({
                        ...plan,
                        currentEndAyah: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold">Next target</legend>
            <div className="mt-2 space-y-2">
              <select
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                value={plan.nextSurah}
                onChange={(e) =>
                  setPlan({ ...plan, nextSurah: Number(e.target.value) })
                }
              >
                {surahs.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.nameEn}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <label className="flex-1 text-sm">
                  From
                  <input
                    type="number"
                    min={1}
                    max={getAyahCount(plan.nextSurah)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                    value={plan.nextStartAyah}
                    onChange={(e) =>
                      setPlan({
                        ...plan,
                        nextStartAyah: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="flex-1 text-sm">
                  To
                  <input
                    type="number"
                    min={plan.nextStartAyah}
                    max={getAyahCount(plan.nextSurah)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                    value={plan.nextEndAyah}
                    onChange={(e) =>
                      setPlan({ ...plan, nextEndAyah: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved" : "Save plan"}
          </Button>
        </Card>
      </form>

      <Card className="mt-4 space-y-3">
        <h2 className="font-semibold">Suggested review</h2>
        <ReviewRecommendations
          studentId={studentId}
          limit={5}
          onPin={() => {
            fetch(`/api/students/${studentId}/review-targets`)
              .then((r) => r.json())
              .then((data) => setReviews(data.reviewTargets ?? []));
          }}
        />
      </Card>

      <Card className="mt-4 space-y-3">
        <h2 className="font-semibold">Pinned review targets</h2>
        <div className="flex flex-wrap gap-2">
          {reviews.map((r) => (
            <Badge key={r.id} variant="muted" className="gap-2">
              {formatSurahRange(r.surah, r.startAyah, r.endAyah)}
              <button
                type="button"
                className="text-muted hover:text-foreground"
                onClick={() => removeReviewTarget(r.id)}
                aria-label="Remove"
              >
                ×
              </button>
            </Badge>
          ))}
          {reviews.length === 0 && (
            <p className="text-sm text-muted">No review targets yet.</p>
          )}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            Surah
            <select
              className="mt-1 block rounded-lg border border-border px-2 py-1.5 text-sm"
              value={newReview.surah}
              onChange={(e) =>
                setNewReview({ ...newReview, surah: Number(e.target.value) })
              }
            >
              {surahs.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            From
            <input
              type="number"
              min={1}
              className="mt-1 block w-16 rounded-lg border border-border px-2 py-1.5 text-sm"
              value={newReview.startAyah}
              onChange={(e) =>
                setNewReview({
                  ...newReview,
                  startAyah: Number(e.target.value),
                })
              }
            />
          </label>
          <label className="text-sm">
            To
            <input
              type="number"
              min={1}
              className="mt-1 block w-16 rounded-lg border border-border px-2 py-1.5 text-sm"
              value={newReview.endAyah}
              onChange={(e) =>
                setNewReview({
                  ...newReview,
                  endAyah: Number(e.target.value),
                })
              }
            />
          </label>
          <Button type="button" size="sm" variant="secondary" onClick={addReviewTarget}>
            Add
          </Button>
        </div>
      </Card>

      <Button
        className="mt-6 w-full"
        href={`/session/new?studentId=${studentId}`}
      >
        Start session with current plan
      </Button>
    </div>
  );
}
