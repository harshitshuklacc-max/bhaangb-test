"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/faculty", label: "Faculty" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-red-500/10"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <Logo size="md" />
        <nav className="hidden gap-5 text-sm font-medium md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-slate-600 hover:text-[var(--brand-red)] dark:text-slate-300 dark:hover:text-red-400"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <Link href="/login/admin">Admin</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <Link href="/login/teacher">Teacher</Link>
          </Button>
          <Button asChild size="sm" variant="default">
            <Link href="/login/student">Student</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
