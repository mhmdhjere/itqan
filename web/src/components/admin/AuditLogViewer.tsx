"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { AuditLogEntry } from "@/lib/queries/audit-log";
import type { AdminUserDto } from "@/lib/queries/admin-users";

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

type AuditLogViewerProps = {
  compact?: boolean;
  initialEntries?: AuditLogEntry[];
};

export function AuditLogViewer({
  compact = false,
  initialEntries,
}: AuditLogViewerProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>(
    initialEntries ?? [],
  );
  const [admins, setAdmins] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(!initialEntries);
  const [entityType, setEntityType] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (entityType) params.set("entityType", entityType);
    if (adminUserId) params.set("adminUserId", adminUserId);
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    if (compact) params.set("limit", "5");

    const res = await fetch(`/api/admin/config/audit?${params}`);
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLoading(false);
  }, [entityType, adminUserId, from, to, compact]);

  useEffect(() => {
    if (!compact) {
      fetch("/api/admin/users")
        .then((res) => res.json())
        .then((data) => setAdmins(data.users ?? []));
    }
  }, [compact]);

  useEffect(() => {
    if (!initialEntries) {
      loadEntries();
    }
  }, [initialEntries, loadEntries]);

  return (
    <div>
      {!compact && (
        <Card className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            Entity type
            <select
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
            >
              <option value="">All</option>
              <option value="app_config">Config</option>
              <option value="verse_status">Verse status</option>
              <option value="mistake_category">Mistake category</option>
              <option value="mistake_subcategory">Mistake subcategory</option>
              <option value="user">User</option>
            </select>
          </label>
          <label className="text-sm">
            Admin
            <select
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              value={adminUserId}
              onChange={(e) => setAdminUserId(e.target.value)}
            >
              <option value="">All</option>
              {admins
                .filter((a) => a.role === "admin")
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-sm">
            From
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="text-sm">
            To
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button size="sm" variant="secondary" onClick={loadEntries}>
              Apply filters
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading audit log…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted">No audit entries found.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry.id} className="text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {entry.entityType}
                    {entry.entityId ? ` · ${entry.entityId}` : ""}
                  </p>
                  <p className="text-xs text-muted">
                    {entry.adminName ?? "System"} ·{" "}
                    {new Date(entry.changedAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-xs">
                  {entry.field}
                </span>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="rounded bg-red-50 px-2 py-1.5 text-xs">
                  <span className="text-muted">Old: </span>
                  {formatValue(entry.oldValue)}
                </div>
                <div className="rounded bg-emerald-50 px-2 py-1.5 text-xs">
                  <span className="text-muted">New: </span>
                  {formatValue(entry.newValue)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
