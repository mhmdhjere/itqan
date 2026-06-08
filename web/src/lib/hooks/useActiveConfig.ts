"use client";

import { useEffect, useState } from "react";
import type { ActiveConfig } from "@/lib/config/types";

export function useActiveConfig() {
  const [config, setConfig] = useState<ActiveConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config/active")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setConfig(data))
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
