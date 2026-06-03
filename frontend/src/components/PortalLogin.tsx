"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { INSTITUTE } from "@/lib/constants";
import type { UserRole } from "@/lib/api";

const roleConfig: Record<
  UserRole,
  { title: string; subtitle: string; redirect: string; otherLogins: { href: string; label: string }[] }
> = {
  ADMIN: {
    title: "Admin Login",
    subtitle: "Institute administration portal",
    redirect: "/admin",
    otherLogins: [
      { href: "/login/teacher", label: "Teacher Login" },
      { href: "/login/student", label: "Student Login" },
    ],
  },
  TEACHER: {
    title: "Teacher Login",
    subtitle: "Faculty portal",
    redirect: "/teacher",
    otherLogins: [
      { href: "/login/admin", label: "Admin Login" },
      { href: "/login/student", label: "Student Login" },
    ],
  },
  STUDENT: {
    title: "Student Login",
    subtitle: "Student portal",
    redirect: "/student",
    otherLogins: [
      { href: "/login/admin", label: "Admin Login" },
      { href: "/login/teacher", label: "Teacher Login" },
    ],
  },
};

export function PortalLogin({ expectedRole }: { expectedRole: UserRole }) {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const config = roleConfig[expectedRole];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const user = await login(username, password);
      if (user.role !== expectedRole) {
        setError(
          `This account is not a ${expectedRole.toLowerCase()}. Use the correct login page.`
        );
        return;
      }
      router.push(config.redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 via-red-950 to-[var(--brand-red-dark)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <div className="mb-6 flex flex-col items-center text-center">
            <Image
              src="/logo.png"
              alt="Smart Step Academy"
              width={120}
              height={120}
              className="mb-4 rounded-2xl bg-black p-2 shadow-lg"
              priority
            />
            <Link href="/" className="text-sm text-[var(--brand-red)] hover:underline">
              ← Back to website
            </Link>
            <h1 className="mt-2 text-xl font-bold">{INSTITUTE.name}</h1>
            <p className="text-lg font-semibold text-[var(--brand-red)]">{config.title}</p>
            <p className="text-sm text-slate-500">{config.subtitle}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="mt-6 border-t border-red-500/10 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Other portals
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {config.otherLogins.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-[var(--brand-red)] hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
