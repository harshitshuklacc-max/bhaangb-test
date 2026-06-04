"use client";

import { getApiBaseUrl } from "@/lib/api";

const API = getApiBaseUrl();

function download(path: string, filename: string) {
  const token = localStorage.getItem("accessToken");
  fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  })
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
    });
}

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reports</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="glass rounded-xl p-4 text-left hover:shadow-md"
          onClick={() => download("/reports/students?format=excel", "students.xlsx")}
        >
          Students (Excel)
        </button>
        <button
          type="button"
          className="glass rounded-xl p-4 text-left hover:shadow-md"
          onClick={() => download("/reports/students?format=pdf", "students.pdf")}
        >
          Students (PDF)
        </button>
        <button
          type="button"
          className="glass rounded-xl p-4 text-left hover:shadow-md"
          onClick={() => download("/reports/attendance?format=excel", "attendance.xlsx")}
        >
          Attendance (Excel)
        </button>
      </div>
    </div>
  );
}
