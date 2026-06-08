"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ParentReportView } from "@/components/insights/ParentReportView";
import type { ParentReportData } from "@/lib/insights/parent-report";

export default function SharedReportPage() {
  const params = useParams<{ token: string }>();
  const [report, setReport] = useState<ParentReportData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/share/${params.token}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => setReport(data.report))
      .catch(() => setError(true));
  }, [params.token]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p>Report not found or link has expired.</p>
      </div>
    );
  }

  if (!report) {
    return <p className="p-8 text-center text-muted">Loading report…</p>;
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <ParentReportView report={report} />
    </div>
  );
}
