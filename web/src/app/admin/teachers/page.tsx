export const dynamic = "force-dynamic";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/format";
import { listTeachersForAdmin } from "@/lib/queries/admin-teachers";

export default async function AdminTeachersPage() {
  const teachers = await listTeachersForAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Teachers</h1>
      <p className="mt-1 text-sm text-muted">
        Read-only oversight of teacher activity across the platform.
      </p>

      <div className="mt-6 space-y-3">
        {teachers.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No teachers registered yet.</p>
          </Card>
        ) : (
          teachers.map((teacher) => (
            <Link key={teacher.id} href={`/admin/teachers/${teacher.id}`}>
              <Card className="transition-colors hover:border-accent/40">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-muted">{teacher.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted">
                    <span>{teacher.circleCount} circles</span>
                    <span>{teacher.studentCount} students</span>
                    <span>
                      {teacher.lastSessionAt
                        ? `Last session ${formatRelativeDate(teacher.lastSessionAt)}`
                        : "No sessions"}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
