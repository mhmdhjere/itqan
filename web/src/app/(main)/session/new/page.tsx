"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { SurahRangeEditor } from "@/components/session/SurahRangeEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useStudent } from "@/lib/hooks/useStudent";
import { useSurahIndex } from "@/lib/hooks/useSurahIndex";
import type { MemorizationPlanDto, ReviewTargetDto } from "@/lib/queries/plans";
import {
  countVersesInRanges,
  decodeRanges,
  newRange,
  validateRange,
  type SurahRange,
} from "@/lib/session-ranges";

function rangesFromPlan(
  plan: MemorizationPlanDto,
  reviews: ReviewTargetDto[],
): SurahRange[] {
  const ranges: SurahRange[] = [
    newRange(plan.currentSurah, plan.currentStartAyah, plan.currentEndAyah),
  ];
  reviews.forEach((rt) => {
    ranges.push(newRange(rt.surah, rt.startAyah, rt.endAyah));
  });
  return ranges;
}

function rangesFromParams(searchParams: URLSearchParams): SurahRange[] | null {
  const rangesParam = searchParams.get("ranges");
  if (rangesParam) {
    const decoded = decodeRanges(rangesParam);
    if (decoded.length > 0) return decoded;
  }

  const surah = Number(searchParams.get("surah"));
  const start = Number(searchParams.get("start"));
  const end = Number(searchParams.get("end"));
  if (surah && start && end) {
    return [newRange(surah, start, end)];
  }

  return null;
}

function SessionSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const { student, loading, notFound } = useStudent(studentId);
  const { getAyahCount, loading: surahsLoading } = useSurahIndex();

  const [ranges, setRanges] = useState<SurahRange[]>([newRange(1, 1, 7)]);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fromParams = rangesFromParams(searchParams);
    if (fromParams) {
      setRanges(fromParams);
      setPlanLoaded(true);
      return;
    }

    Promise.all([
      fetch(`/api/students/${studentId}/memorization-plan`).then((r) => r.json()),
      fetch(`/api/students/${studentId}/review-targets`).then((r) => r.json()),
    ]).then(([planData, reviewData]) => {
      if (planData.plan) {
        setRanges(
          rangesFromPlan(planData.plan, reviewData.reviewTargets ?? []),
        );
        setHasPlan(true);
      }
      setPlanLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per student
  }, [studentId]);

  const allValid =
    !surahsLoading &&
    ranges.length > 0 &&
    ranges.every((r) => {
      const ayahCount = getAyahCount(r.surah);
      return ayahCount !== undefined && validateRange(r, ayahCount);
    });
  const totalVerses = countVersesInRanges(ranges, getAyahCount);

  const planHint = useMemo(() => {
    if (!hasPlan || !student) return null;
    return `Pre-filled from ${student.fullName}'s plan (current + review). Adjust or add passages.`;
  }, [hasPlan, student]);

  const resetToPlan = async () => {
    if (!studentId) return;
    const [planRes, reviewRes] = await Promise.all([
      fetch(`/api/students/${studentId}/memorization-plan`),
      fetch(`/api/students/${studentId}/review-targets`),
    ]);
    const planData = await planRes.json();
    const reviewData = await reviewRes.json();
    if (planData.plan) {
      setRanges(
        rangesFromPlan(planData.plan, reviewData.reviewTargets ?? []),
      );
    }
  };

  const beginSession = async () => {
    if (!studentId || !allValid) return;
    setStarting(true);
    setStartError(null);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          passages: ranges.map((r) => ({
            surah: r.surah,
            startAyah: r.startAyah,
            endAyah: r.endAyah,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStartError(data.error ?? "Could not start session");
        return;
      }

      const data = await res.json();
      router.push(`/session/${data.session.id}/live`);
    } catch {
      setStartError("Could not start session");
    } finally {
      setStarting(false);
    }
  };

  if (loading || !planLoaded || surahsLoading) {
    return <p className="p-6 text-muted">Loading…</p>;
  }

  if (notFound || !student) {
    return (
      <div className="p-6">
        <p>Student not found.</p>
        <Button href="/circles" className="mt-4">
          Back to circles
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
      <Link
        href={`/students/${studentId}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← Back
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Session Setup</h1>
      <p className="mt-1 text-sm text-muted">
        Add one or more surahs, each with its own ayah range.
      </p>

      <Card className="mt-4 space-y-4">
        <div>
          <label className="text-sm text-muted">Student</label>
          <p className="mt-1 font-medium">{student.fullName}</p>
        </div>

        <SurahRangeEditor ranges={ranges} onChange={setRanges} />

        <p className="text-sm font-medium text-foreground">
          {allValid
            ? `${totalVerses} verses across ${ranges.length} passage${ranges.length !== 1 ? "s" : ""}`
            : "Fix invalid ranges to continue"}
        </p>

        {planHint && (
          <div className="rounded-lg bg-accent-light px-3 py-2 text-sm text-accent">
            {planHint}
            <button
              type="button"
              className="ml-2 underline"
              onClick={resetToPlan}
            >
              Reset to plan
            </button>
          </div>
        )}

        {startError && (
          <p className="text-sm text-red-600">{startError}</p>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={!allValid || starting}
          onClick={beginSession}
        >
          {starting ? "Starting…" : "Begin Recitation"}
        </Button>
      </Card>
    </div>
  );
}

export default function SessionNewPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SessionSetupContent />
    </Suspense>
  );
}
