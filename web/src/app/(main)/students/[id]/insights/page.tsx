import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { InsightsPage } from "@/components/insights/InsightsPage";
import { getStudentForTeacher } from "@/lib/queries/students";

export default async function StudentInsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const student = await getStudentForTeacher(id, session.user.id);
  if (!student) notFound();

  return <InsightsPage studentId={id} studentName={student.fullName} />;
}
