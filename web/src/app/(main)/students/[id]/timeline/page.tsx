import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { TimelinePage } from "@/components/insights/TimelinePage";
import { getStudentForTeacher } from "@/lib/queries/students";

export default async function StudentTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const student = await getStudentForTeacher(id, session.user.id);
  if (!student) notFound();

  return <TimelinePage studentId={id} studentName={student.fullName} />;
}
