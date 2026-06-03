"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function TeacherDashboard() {
  const [data, setData] = useState<{
    assignedHomework: number;
    attendanceSummary: { present: number; absent: number };
  } | null>(null);

  useEffect(() => {
    api<typeof data>("/dashboard/teacher").then(setData);
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Teacher Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Homework Assigned</p>
          <p className="text-2xl font-bold">{data?.assignedHomework ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Attendance (30 days)</p>
          <p className="text-2xl font-bold">
            {data
              ? `${data.attendanceSummary.present} present / ${data.attendanceSummary.absent} absent`
              : "—"}
          </p>
        </Card>
      </div>
    </div>
  );
}
