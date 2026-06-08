import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  SessionHistoryEmpty,
  SessionHistoryList,
} from "@/components/students/SessionHistoryList";
import { listStudentSessions } from "@/lib/queries/sessions";
import { getStudentForTeacher } from "@/lib/queries/students";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const student = await getStudentForTeacher(id, session.user.id);
  if (!student) notFound();

  const sessions = await listStudentSessions(id, session.user.id, 50);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <Link
        href={`/students/${id}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← {student.fullName}
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Session History</h1>

      <div className="mt-4">
        {sessions && sessions.length > 0 ? (
          <SessionHistoryList sessions={sessions} studentId={id} />
        ) : (
          <SessionHistoryEmpty />
        )}
      </div>
    </div>
  );
}
