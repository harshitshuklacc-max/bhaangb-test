"use client";

import { AttendanceCalendar } from "@/components/AttendanceCalendar";

export default function TeacherCalendarPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Attendance Calendar</h1>
      <AttendanceCalendar />
    </div>
  );
}
