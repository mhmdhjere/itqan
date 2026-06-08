import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CircleRoster } from "@/components/students/CircleRoster";
import { getCircleForTeacher } from "@/lib/queries/circles";
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

  const students = await listStudentsForCircle(id, session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <CircleRoster circle={circle} students={students} />
    </div>
  );
}
