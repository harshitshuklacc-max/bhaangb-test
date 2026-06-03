"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { PortalShell } from "@/components/PortalShell";

const nav = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/attendance", label: "My Attendance" },
  { href: "/teacher/calendar", label: "Calendar" },
  { href: "/teacher/homework", label: "Homework" },
  { href: "/teacher/leave", label: "Leave" },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="TEACHER">
      <PortalShell role="TEACHER" nav={nav}>
        {children}
      </PortalShell>
    </RequireAuth>
  );
}
