"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LiveSession } from "@/components/session/LiveSession";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/hooks/useSession";
import { passagesToRanges } from "@/lib/session-ranges";

export function LiveSessionPage({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { session, loading, notFound } = useSession(sessionId);

  useEffect(() => {
    if (session?.endedAt) {
      router.replace(`/session/${sessionId}/summary`);
    }
  }, [session, sessionId, router]);

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center text-muted">
        Loading session…
      </div>
    );
  }

  if (notFound || !session) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6">
        <p>Session not found.</p>
        <Button href="/circles">Back to circles</Button>
      </div>
    );
  }

  if (session.endedAt) {
    return (
      <div className="flex h-dvh items-center justify-center text-muted">
        Redirecting to summary…
      </div>
    );
  }

  const ranges = passagesToRanges(session.passages);

  return (
    <LiveSession
      sessionId={session.id}
      studentId={session.studentId}
      ranges={ranges}
      initialMarks={session.marks}
    />
  );
}
