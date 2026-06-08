import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

const variants = {
  primary: "bg-accent text-white hover:bg-[#0a4a3d] shadow-sm",
  secondary:
    "bg-surface border border-border text-foreground hover:bg-stone-50",
  ghost: "text-muted hover:text-foreground hover:bg-stone-100",
  danger: "border border-red-200 text-red-700 hover:bg-red-50",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  href,
  onClick,
  disabled,
  type = "button",
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
