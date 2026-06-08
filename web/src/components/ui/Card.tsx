import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-sm",
        onClick && "cursor-pointer hover:border-stone-300 transition-colors",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
