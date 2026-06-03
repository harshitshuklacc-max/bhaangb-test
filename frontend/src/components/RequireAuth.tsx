"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/api";

export function RequireAuth({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const loginPath =
    role === "ADMIN"
      ? "/login/admin"
      : role === "TEACHER"
        ? "/login/teacher"
        : "/login/student";

  useEffect(() => {
    if (!loading && !user) router.replace(loginPath);
    if (!loading && user && user.role !== role) router.replace(loginPath);
  }, [user, loading, role, router, loginPath]);

  if (loading || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
