import type { MasteryMapState, VerseStatusSlug } from "./types";

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function getStatusBorderColor(status: VerseStatusSlug): string {
  switch (status) {
    case "reminder_required":
      return "border-l-amber-500 bg-amber-50/60";
    case "second_attempt":
      return "border-l-orange-500 bg-orange-50/60";
    case "third_attempt":
      return "border-l-red-400 bg-red-50/50";
    case "prompting_required":
      return "border-l-red-500 bg-red-50/60";
    case "incomplete":
      return "border-l-rose-800 bg-rose-50/60";
    default:
      return "border-l-transparent";
  }
}

/** Mushaf mode — highlight without borders */
export function getStatusHighlightColor(status: VerseStatusSlug): string {
  switch (status) {
    case "reminder_required":
      return "bg-amber-100/80";
    case "second_attempt":
      return "bg-orange-100/85";
    case "third_attempt":
      return "bg-red-100/75";
    case "prompting_required":
      return "bg-red-100/85";
    case "incomplete":
      return "bg-rose-200/70";
    default:
      return "";
  }
}

export function getMapStateColor(state: MasteryMapState): string {
  switch (state) {
    case "memorized":
      return "bg-emerald-500";
    case "needs_review":
      return "bg-amber-400";
    case "frequently_weak":
      return "bg-red-400";
    case "not_recited":
      return "bg-stone-200";
  }
}

export function getMapStateLabel(state: MasteryMapState): string {
  switch (state) {
    case "memorized":
      return "Memorized";
    case "needs_review":
      return "Needs review";
    case "frequently_weak":
      return "Frequently weak";
    case "not_recited":
      return "Not recited";
  }
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
