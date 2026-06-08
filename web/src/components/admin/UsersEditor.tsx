"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { AdminUserDto } from "@/lib/queries/admin-users";

export function UsersEditor() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [invite, setInvite] = useState({
    email: "",
    name: "",
    password: "",
    role: "teacher" as "teacher" | "admin",
  });

  function loadUsers() {
    return fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []));
  }

  useEffect(() => {
    loadUsers().finally(() => setLoading(false));
  }, []);

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invite),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create user");
      return;
    }

    setShowInvite(false);
    setInvite({ email: "", name: "", password: "", role: "teacher" });
    await loadUsers();
  }

  async function updateUser(
    id: string,
    patch: { role?: "teacher" | "admin"; status?: "active" | "suspended" },
  ) {
    setSavingId(id);
    setError(null);

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    setSavingId(null);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Update failed");
      return;
    }

    const data = await res.json();
    setUsers((rows) =>
      rows.map((row) => (row.id === id ? data.user : row)),
    );
  }

  if (loading) return <p className="text-muted">Loading users…</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{users.length} accounts</p>
        <Button size="sm" onClick={() => setShowInvite(true)}>
          Invite user
        </Button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {showInvite && (
        <Card className="mt-4">
          <h2 className="font-semibold">Invite user</h2>
          <form onSubmit={handleInvite} className="mt-3 space-y-3">
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={invite.email}
              onChange={(e) =>
                setInvite({ ...invite, email: e.target.value })
              }
            />
            <input
              required
              placeholder="Full name"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={invite.name}
              onChange={(e) => setInvite({ ...invite, name: e.target.value })}
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Temporary password"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={invite.password}
              onChange={(e) =>
                setInvite({ ...invite, password: e.target.value })
              }
            />
            <select
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              value={invite.role}
              onChange={(e) =>
                setInvite({
                  ...invite,
                  role: e.target.value as "teacher" | "admin",
                })
              }
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit">Create</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowInvite(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-4 space-y-2">
        {users.map((user) => (
          <Card key={user.id} className="flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted">{user.email}</p>
              <p className="mt-1 text-xs text-muted">
                {user.lastLoginAt
                  ? `Last login ${new Date(user.lastLoginAt).toLocaleDateString()}`
                  : "Never signed in"}
              </p>
            </div>
            <select
              className="rounded-lg border border-border px-2 py-1.5 text-sm"
              value={user.role}
              disabled={savingId === user.id}
              onChange={(e) =>
                updateUser(user.id, {
                  role: e.target.value as "teacher" | "admin",
                })
              }
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="rounded-lg border border-border px-2 py-1.5 text-sm"
              value={user.status}
              disabled={savingId === user.id}
              onChange={(e) =>
                updateUser(user.id, {
                  status: e.target.value as "active" | "suspended",
                })
              }
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </Card>
        ))}
      </div>
    </div>
  );
}
