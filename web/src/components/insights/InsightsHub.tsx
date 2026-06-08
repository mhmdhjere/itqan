"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { WeakAyatWidget } from "./WeakAyatWidget";

export function InsightsHub({
  studentId,
  flags,
}: {
  studentId: string;
  flags: {
    weakAyat?: boolean;
    reviewPlanner?: boolean;
    parentReports?: boolean;
  };
}) {
  const showAny =
    flags.weakAyat || flags.reviewPlanner || flags.parentReports;

  if (!showAny) return null;

  return (
    <Card className="mt-4">
      <h2 className="font-semibold">Insights</h2>
      <p className="mt-1 text-sm text-muted">
        Analytics and planning from session history.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {flags.weakAyat && (
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Weak ayat</h3>
              <Link
                href={`/students/${studentId}/weak-ayat`}
                className="text-xs text-accent hover:underline"
              >
                Open
              </Link>
            </div>
            <div className="mt-2">
              <WeakAyatWidget studentId={studentId} />
            </div>
          </div>
        )}

        {flags.reviewPlanner && (
          <div className="rounded-lg border border-border p-4">
            <h3 className="text-sm font-medium">Review plan</h3>
            <p className="mt-1 text-sm text-muted">
              Daily and weekly prioritized review.
            </p>
            <Link
              href={`/students/${studentId}/review-plan`}
              className="mt-2 inline-block text-sm text-accent hover:underline"
            >
              View review plan →
            </Link>
          </div>
        )}

        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium">Patterns</h3>
          <p className="mt-1 text-sm text-muted">
            Memorization, tajweed, and behavior trends.
          </p>
          <Link
            href={`/students/${studentId}/insights`}
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            View insights →
          </Link>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium">Progress timeline</h3>
          <p className="mt-1 text-sm text-muted">
            Milestones and activity over time.
          </p>
          <Link
            href={`/students/${studentId}/timeline`}
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            View timeline →
          </Link>
        </div>

        {flags.parentReports && (
          <div className="rounded-lg border border-border p-4 sm:col-span-2">
            <h3 className="text-sm font-medium">Parent report</h3>
            <p className="mt-1 text-sm text-muted">
              Generate and share progress reports with parents.
            </p>
            <Link
              href={`/students/${studentId}/reports`}
              className="mt-2 inline-block text-sm text-accent hover:underline"
            >
              Create report →
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
