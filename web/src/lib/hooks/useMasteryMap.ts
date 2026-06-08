"use client";

import { useEffect, useState } from "react";
import type { MasteryMapDto } from "@/lib/queries/mastery-map";

export function useMasteryMap(studentId: string | null) {
  const [map, setMap] = useState<MasteryMapDto | null>(null);
  const [loading, setLoading] = useState(!!studentId);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/students/${studentId}/mastery-map`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: { map: MasteryMapDto }) => {
        if (!cancelled) setMap(data.map);
      })
      .catch(() => {
        if (!cancelled) {
          setMap(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  return { map, loading, notFound };
}
