"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { PortalShell } from "@/components/PortalShell";

const nav = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/attendance", label: "Attendance" },
  { href: "/student/calendar", label: "Calendar" },
  { href: "/student/homework", label: "Homework" },
  { href: "/student/notices", label: "Notices" },
  { href: "/student/profile", label: "Profile" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="STUDENT">
      <PortalShell role="STUDENT" nav={nav}>
        {children}
      </PortalShell>
    </RequireAuth>
  );
}
