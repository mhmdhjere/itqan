import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ReviewPlanPage } from "@/components/insights/ReviewPlanPage";
import { getActiveConfig } from "@/lib/config/service";
import { getStudentForTeacher } from "@/lib/queries/students";

export default async function StudentReviewPlanPage({
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
  if (activeConfig.config.features.review_planner === false) notFound();

  return <ReviewPlanPage studentId={id} studentName={student.fullName} />;
}
