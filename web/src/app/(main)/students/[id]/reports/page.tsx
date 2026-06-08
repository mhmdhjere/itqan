import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ReportsPage } from "@/components/insights/ReportsPage";
import { getActiveConfig } from "@/lib/config/service";
import { getStudentForTeacher } from "@/lib/queries/students";

export default async function StudentReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const [student, activeConfig] = await Promise.all([
    getStudentForTeacher(id, session.user.id),
    getActiveConfig(),
  ]);
  if (!student) notFound();
  if (activeConfig.config.features.parent_reports === false) notFound();

  return <ReportsPage studentId={id} studentName={student.fullName} />;
}
