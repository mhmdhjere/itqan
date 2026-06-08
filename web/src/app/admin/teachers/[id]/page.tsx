export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/format";
import {
  getTeacherForAdmin,
  listTeacherCirclesForAdmin,
} from "@/lib/queries/admin-teachers";

export default async function AdminTeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [teacher, circles] = await Promise.all([
    getTeacherForAdmin(id),
    listTeacherCirclesForAdmin(id),
  ]);

  if (!teacher || !circles) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/teachers"
        className="text-sm text-muted hover:text-foreground"
      >
        ← All teachers
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">{teacher.name}</h1>
      <p className="text-sm text-muted">{teacher.email}</p>
      <p className="mt-1 text-sm text-muted">
        {teacher.lastLoginAt
          ? `Last login ${formatRelativeDate(teacher.lastLoginAt)}`
          : "Never logged in"}
      </p>

      <h2 className="mt-8 text-lg font-semibold">Circles</h2>
      <div className="mt-4 space-y-3">
        {circles.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No circles yet.</p>
          </Card>
        ) : (
          circles.map((circle) => (
            <Card key={circle.id}>
              <p className="font-medium">{circle.name}</p>
              {circle.description && (
                <p className="mt-1 text-sm text-muted">{circle.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
                <span>{circle.studentCount} students</span>
                <span>
                  {circle.lastSessionAt
                    ? `Last session ${formatRelativeDate(circle.lastSessionAt)}`
                    : "No sessions"}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
