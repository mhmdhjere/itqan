import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CirclesList } from "@/components/circles/CirclesList";
import { listCirclesForTeacher } from "@/lib/queries/circles";

export default async function CirclesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const circles = await listCirclesForTeacher(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <CirclesList circles={circles} />
    </div>
  );
}
