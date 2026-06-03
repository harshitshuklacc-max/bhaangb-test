"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { PortalShell } from "@/components/PortalShell";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/notices", label: "Notices" },
  { href: "/admin/leave", label: "Leave" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/search", label: "Search" },
  { href: "/admin/reports", label: "Reports" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="ADMIN">
      <PortalShell role="ADMIN" nav={nav}>
        {children}
      </PortalShell>
    </RequireAuth>
  );
}
