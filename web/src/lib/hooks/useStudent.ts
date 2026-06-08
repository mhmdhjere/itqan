"use client";

import { useEffect, useState } from "react";
import type { StudentDetail } from "@/lib/queries/students";

export function useStudent(studentId: string | null) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(!!studentId);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      setStudent(null);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/students/${studentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: { student: StudentDetail }) => {
        if (!cancelled) setStudent(data.student);
      })
      .catch(() => {
        if (!cancelled) {
          setStudent(null);
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

  return { student, loading, notFound };
}
