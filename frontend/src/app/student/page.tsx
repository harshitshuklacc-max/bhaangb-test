"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function StudentDashboard() {
  const [data, setData] = useState<{
    attendancePresent: number;
    homeworkCount: number;
    noticesCount: number;
    classLevel: string;
  } | null>(null);

  useEffect(() => {
    api<typeof data>("/dashboard/student").then(setData);
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Student Dashboard</h1>
      <p className="mb-4 text-slate-500">Class {data?.classLevel}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Present Days</p>
          <p className="text-2xl font-bold">{data?.attendancePresent ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Homework</p>
          <p className="text-2xl font-bold">{data?.homeworkCount ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Notices</p>
          <p className="text-2xl font-bold">{data?.noticesCount ?? "—"}</p>
        </Card>
      </div>
    </div>
  );
}
