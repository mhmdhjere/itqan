"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/circles", label: "Circles", icon: "◎" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const displayName = session?.user?.name ?? "Teacher";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
        <div className="border-b border-border px-5 py-5">
          <Link href="/circles" className="block">
            <span className="text-lg font-semibold tracking-tight text-accent">
              Itqan
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              Quran Circle Manager
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-accent-light text-accent"
                  : "text-muted hover:bg-stone-50 hover:text-foreground",
              )}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted">Signed in as</p>
          <p className="text-sm font-medium">{displayName}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 text-xs text-muted hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
          <Link href="/circles" className="text-base font-semibold text-accent">
            Itqan
          </Link>
          <span className="text-sm text-muted">{displayName}</span>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
