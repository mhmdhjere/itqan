import { Suspense } from "react";
import { LiveSessionPage } from "./LiveSessionPage";

export default async function LivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          Loading session...
        </div>
      }
    >
      <LiveSessionPage sessionId={id} />
    </Suspense>
  );
}
