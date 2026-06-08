import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { WeakAyatPage } from "@/components/insights/WeakAyatPage";
import { getActiveConfig } from "@/lib/config/service";
import { getStudentForTeacher } from "@/lib/queries/students";

export default async function StudentWeakAyatPage({
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
  if (activeConfig.config.features.weak_ayat_engine === false) notFound();

  return <WeakAyatPage studentId={id} studentName={student.fullName} />;
}
