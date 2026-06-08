"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: "◈" },
  { href: "/admin/config", label: "Config", icon: "⚙" },
  { href: "/admin/verse-statuses", label: "Verse Statuses", icon: "◎" },
  { href: "/admin/mistake-types", label: "Mistake Types", icon: "▣" },
  { href: "/admin/users", label: "Users", icon: "◉" },
  { href: "/admin/audit", label: "Audit Log", icon: "◇" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-stone-900 text-stone-100 lg:flex lg:flex-col">
        <div className="border-b border-stone-700 px-5 py-5">
          <Link href="/admin" className="block">
            <span className="text-lg font-semibold tracking-tight">
              Itqan Admin
            </span>
            <span className="mt-0.5 block text-xs text-stone-400">
              Platform configuration
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
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-stone-800 text-white"
                  : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-100",
              )}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 border-t border-stone-700 p-4">
          <p className="text-xs text-stone-500">Signed in as</p>
          <p className="text-sm font-medium">{session?.user?.name ?? "Admin"}</p>
          <div className="flex gap-2 pt-1">
            <Link
              href="/circles"
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              Teacher app →
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
          <Link href="/admin" className="text-base font-semibold text-accent">
            Itqan Admin
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
