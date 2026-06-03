"use client";

import { AttendanceCalendar } from "@/components/AttendanceCalendar";

export default function AdminAttendancePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Attendance Reports</h1>
      <AttendanceCalendar />
      <p className="mt-4 text-sm text-slate-500">
        Use query params studentId or teacherId in API for specific user reports.
      </p>
    </div>
  );
}
