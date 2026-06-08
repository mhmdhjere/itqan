"use client";

import { useEffect, useState } from "react";
import type { SessionDetailDto } from "@/lib/queries/sessions";

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<SessionDetailDto | null>(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setSession(null);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/sessions/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: { session: SessionDetailDto }) => {
        if (!cancelled) setSession(data.session);
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return { session, loading, notFound };
}
