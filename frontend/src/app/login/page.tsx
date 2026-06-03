import Link from "next/link";
import Image from "next/image";
import { Shield, GraduationCap, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { INSTITUTE } from "@/lib/constants";

const portals = [
  {
    href: "/login/admin",
    title: "Admin Login",
    description: "Manage students, teachers, notices, and reports",
    icon: Shield,
    color: "from-[var(--brand-red-dark)] to-[var(--brand-red)]",
  },
  {
    href: "/login/teacher",
    title: "Teacher Login",
    description: "Attendance, homework, and leave requests",
    icon: GraduationCap,
    color: "from-neutral-800 to-neutral-600",
  },
  {
    href: "/login/student",
    title: "Student Login",
    description: "View homework, attendance, and notices",
    icon: User,
    color: "from-red-600 to-red-400",
  },
];

export default function LoginHubPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 via-red-950 to-[var(--brand-red)] px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="Smart Step Academy"
            width={140}
            height={140}
            className="mb-4 rounded-2xl bg-black p-3 shadow-2xl ring-2 ring-white/10"
            priority
          />
          <Link href="/" className="text-sm text-red-200 hover:underline">
            ← Back to website
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-white">{INSTITUTE.name}</h1>
          <p className="text-red-100">Choose your portal to sign in</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <Link key={p.href} href={p.href}>
                <Card className="h-full transition hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/20">
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${p.color} p-3 text-white`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--brand-red)]">{p.title}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {p.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
