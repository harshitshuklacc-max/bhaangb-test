"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export function PortalShell({
  role,
  nav,
  children,
}: {
  role: "ADMIN" | "TEACHER" | "STUDENT";
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const base = role === "ADMIN" ? "/admin" : role === "TEACHER" ? "/teacher" : "/student";

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-red-50/20 to-neutral-100 dark:from-neutral-950 dark:via-red-950/10 dark:to-neutral-900">
      <header className="glass border-b border-red-500/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <Logo size="sm" showText={false} href={base} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-red)]">
                {role} Portal
              </p>
              <Link
                href={base}
                className="font-bold text-neutral-900 dark:text-white"
              >
                Smart Step Academy
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">
              {user?.name}
            </span>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const loginPath =
                  role === "ADMIN"
                    ? "/login/admin"
                    : role === "TEACHER"
                      ? "/login/teacher"
                      : "/login/student";
                await logout();
                router.push(loginPath);
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="glass space-y-1 rounded-2xl p-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-xl px-3 py-2 text-sm font-medium transition",
                  pathname === item.href
                    ? "bg-[var(--brand-red)] text-white"
                    : "text-slate-600 hover:bg-red-50 dark:text-slate-300 dark:hover:bg-red-950/40"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
