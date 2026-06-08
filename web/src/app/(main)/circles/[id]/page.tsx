import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CircleRoster } from "@/components/students/CircleRoster";
import { getCircleForTeacher } from "@/lib/queries/circles";
import { getActiveConfig } from "@/lib/config/service";
import { countStudentsWithReviewDueToday } from "@/lib/queries/review-plan";
import { listStudentsForCircle } from "@/lib/queries/students";

export default async function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const circle = await getCircleForTeacher(id, session.user.id);
  if (!circle) notFound();

  const [students, activeConfig] = await Promise.all([
    listStudentsForCircle(id, session.user.id),
    getActiveConfig(),
  ]);
  const reviewPlannerEnabled =
    activeConfig.config.features.review_planner !== false;
  const reviewDueCount = reviewPlannerEnabled
    ? await countStudentsWithReviewDueToday(
        students.map((s) => s.id),
        session.user.id,
      )
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <CircleRoster
        circle={circle}
        students={students}
        reviewDueCount={reviewDueCount}
      />
    </div>
  );
}
