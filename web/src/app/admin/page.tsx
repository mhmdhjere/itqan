import Link from "next/link";
import { auth } from "@/auth";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { getAdminOverview } from "@/lib/queries/admin-stats";

export default async function AdminOverviewPage() {
  const session = await auth();
  const stats = await getAdminOverview();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Overview</h1>
      <p className="mt-2 text-muted">
        Welcome, {session?.user?.name}. Platform health and recent activity.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Teachers", value: stats.teacherCount },
          { label: "Active circles", value: stats.circleCount },
          { label: "Config changes (7d)", value: stats.configChanges7d },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Recent audit activity</h2>
          <Link
            href="/admin/audit"
            className="text-sm text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="mt-4">
          <AuditLogViewer compact initialEntries={stats.recentAudit} />
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/config"
          className="rounded-xl border border-border bg-surface p-4 text-sm hover:border-stone-300"
        >
          <span className="font-medium">Configuration</span>
          <p className="mt-1 text-muted">Mastery, review, live session, display</p>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-border bg-surface p-4 text-sm hover:border-stone-300"
        >
          <span className="font-medium">User management</span>
          <p className="mt-1 text-muted">Invite, suspend, change roles</p>
        </Link>
      </div>
    </div>
  );
}
