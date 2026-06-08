import { Badge } from "@/components/ui/Badge";

export function SessionTypeBadge({
  sessionType,
}: {
  sessionType?: "regular" | "review";
}) {
  if (sessionType !== "review") return null;
  return (
    <Badge variant="muted" className="ml-1.5 text-[10px] uppercase">
      Review
    </Badge>
  );
}
