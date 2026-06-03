"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function TeacherSelfAttendancePage() {
  const today = new Date().toISOString().slice(0, 10);

  async function mark(status: "PRESENT" | "ABSENT") {
    await api("/attendance/teacher/self", {
      method: "POST",
      body: JSON.stringify({ date: today, status }),
    });
    alert(`Marked ${status} for today`);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Mark My Attendance</h1>
      <Card className="flex flex-wrap gap-3">
        <Button onClick={() => mark("PRESENT")}>Present</Button>
        <Button variant="outline" onClick={() => mark("ABSENT")}>
          Absent
        </Button>
      </Card>
    </div>
  );
}
