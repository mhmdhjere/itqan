"use client";

import Link from "next/link";
import { useState } from "react";
import { ParentReportView } from "@/components/insights/ParentReportView";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ParentReportData } from "@/lib/insights/parent-report";

function monthRange(): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function ReportsPage({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [report, setReport] = useState<ParentReportData | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(() => monthRange().from.slice(0, 10));
  const [to, setTo] = useState(() => monthRange().to.slice(0, 10));

  const loadPreview = async () => {
    setLoading(true);
    setShareUrl(null);
    const res = await fetch(
      `/api/students/${studentId}/reports/preview?from=${from}T00:00:00Z&to=${to}T23:59:59Z`,
    );
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setReport(data.report);
    }
  };

  const createShare = async () => {
    const res = await fetch(`/api/students/${studentId}/reports/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${from}T00:00:00Z`,
        to: `${to}T23:59:59Z`,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const url = `${window.location.origin}/reports/share/${data.share.token}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
    }
  };

  const printReport = () => window.print();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link
        href={`/students/${studentId}`}
        className="text-sm text-muted hover:text-foreground print:hidden"
      >
        ← {studentName}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold print:hidden">
        Parent report
      </h1>

      <Card className="mt-4 print:hidden">
        <div className="flex flex-wrap gap-4">
          <label className="text-sm">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 block rounded border border-border px-2 py-1"
            />
          </label>
          <label className="text-sm">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 block rounded border border-border px-2 py-1"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={loadPreview} disabled={loading}>
            {loading ? "Loading…" : "Preview report"}
          </Button>
          {report && (
            <>
              <Button variant="secondary" onClick={printReport}>
                Print / Save PDF
              </Button>
              <Button variant="secondary" onClick={createShare}>
                Copy share link
              </Button>
            </>
          )}
        </div>
        {shareUrl && (
          <p className="mt-2 text-xs text-muted">Link copied: {shareUrl}</p>
        )}
      </Card>

      {report && (
        <div className="mt-6">
          <ParentReportView report={report} />
        </div>
      )}
    </div>
  );
}
