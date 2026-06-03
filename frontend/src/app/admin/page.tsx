"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  attendanceToday: number;
  pendingLeaveRequests: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/dashboard/admin").then(setStats).catch(console.error);
  }, []);

  const cards = stats
    ? [
        { label: "Students", value: stats.totalStudents },
        { label: "Teachers", value: stats.totalTeachers },
        { label: "Attendance Today", value: stats.attendanceToday },
        { label: "Pending Leave", value: stats.pendingLeaveRequests },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="text-3xl font-bold text-[var(--brand-red)]">{c.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
