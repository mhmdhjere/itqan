import type { ActiveConfig } from "@/lib/config/types";

export function isSessionMutable(
  startedAt: Date,
  endedAt: Date | null,
  config: ActiveConfig | null,
): boolean {
  if (endedAt) return false;

  const hours =
    (config?.config.system.session_immutability_hours as number | undefined) ??
    48;

  const windowMs = hours * 60 * 60 * 1000;
  return Date.now() - startedAt.getTime() < windowMs;
}
