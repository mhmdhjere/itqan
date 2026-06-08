"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StudentFormModal } from "@/components/students/StudentFormModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/format";
import type { CircleDetail } from "@/lib/queries/circles";
import type { StudentListItem } from "@/lib/queries/students";
import { CircleFormModal } from "@/components/circles/CircleFormModal";

type CircleRosterProps = {
  circle: CircleDetail;
  students: StudentListItem[];
};

export function CircleRoster({ circle, students }: CircleRosterProps) {
  const [search, setSearch] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditCircle, setShowEditCircle] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.fullName.toLowerCase().includes(q));
  }, [students, search]);

  return (
    <>
      <Link href="/circles" className="text-sm text-muted hover:text-foreground">
        ← Circles
      </Link>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{circle.name}</h1>
          {circle.description && (
            <p className="text-sm text-muted">{circle.description}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowEditCircle(true)}>
            Edit
          </Button>
          <Button size="sm" onClick={() => setShowAddStudent(true)}>
            Add student
          </Button>
        </div>
      </div>

      <input
        type="search"
        placeholder="Search students..."
        className="mt-4 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <Card className="mt-4 text-center">
          <p className="text-muted">
            {students.length === 0
              ? "No students in this circle yet."
              : "No students match your search."}
          </p>
          {students.length === 0 && (
            <Button className="mt-4" onClick={() => setShowAddStudent(true)}>
              Add first student
            </Button>
          )}
        </Card>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((student) => (
            <Card key={student.id} className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent">
                {student.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <Link href={`/students/${student.id}`} className="min-w-0 flex-1">
                <p className="font-medium">{student.fullName}</p>
                <p className="text-xs text-muted">
                  {student.lastSessionAt
                    ? formatRelativeDate(student.lastSessionAt)
                    : "No sessions yet"}
                </p>
              </Link>
              <Button
                size="sm"
                variant="secondary"
                href={`/session/new?studentId=${student.id}`}
                aria-label={`Start session with ${student.fullName}`}
              >
                ▶
              </Button>
            </Card>
          ))}
        </div>
      )}

      <StudentFormModal
        open={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        circleId={circle.id}
      />
      <CircleFormModal
        open={showEditCircle}
        onClose={() => setShowEditCircle(false)}
        circle={circle}
      />
    </>
  );
}
