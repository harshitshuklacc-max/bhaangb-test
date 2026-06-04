"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Status = "PRESENT" | "ABSENT" | "LEAVE" | "HOLIDAY";

interface AttendanceRecord {
  id: string;
  date: string;
  status: Status;
  notes?: string | null;
}

const statusColor: Record<Status, string> = {
  PRESENT: "bg-emerald-500",
  ABSENT: "bg-red-500",
  LEAVE: "bg-yellow-400",
  HOLIDAY: "bg-neutral-600",
};

const statusLabel: Record<Status, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LEAVE: "Leave",
  HOLIDAY: "Holiday",
};

export function AttendanceCalendar({
  studentId,
  teacherId,
}: {
  studentId?: string;
  teacherId?: string;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
    });
    if (studentId) params.set("studentId", studentId);
    if (teacherId) params.set("teacherId", teacherId);
    api<{ records: AttendanceRecord[] }>(`/attendance/calendar?${params}`)
      .then((d) => setRecords(d.records))
      .catch(() => setRecords([]));
  }, [year, month, studentId, teacherId]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    records.forEach((r) => {
      const key = new Date(r.date).toISOString().slice(0, 10);
      map.set(key, r);
    });
    return map;
  }, [records]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, record: byDate.get(key) });
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-sm hover:bg-red-50 dark:hover:bg-red-950/40"
          onClick={() => {
            if (month === 1) {
              setMonth(12);
              setYear((y) => y - 1);
            } else setMonth((m) => m - 1);
          }}
        >
          ←
        </button>
        <h3 className="font-semibold">
          {new Date(year, month - 1).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-sm hover:bg-red-50 dark:hover:bg-red-950/40"
          onClick={() => {
            if (month === 12) {
              setMonth(1);
              setYear((y) => y + 1);
            } else setMonth((m) => m + 1);
          }}
        >
          →
        </button>
      </div>

      <div className="mb-3 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) =>
          cell ? (
            <button
              key={i}
              type="button"
              onClick={() => cell.record && setSelected(cell.record)}
              className={cn(
                "flex h-10 flex-col items-center justify-center rounded-lg text-sm transition hover:ring-2 hover:ring-red-400/50",
                cell.record ? "text-white" : "bg-slate-100 dark:bg-slate-800"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  cell.record
                    ? statusColor[cell.record.status]
                    : "bg-transparent text-slate-700 dark:text-slate-200"
                )}
              >
                {cell.day}
              </span>
            </button>
          ) : (
            <div key={i} />
          )
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {(Object.keys(statusColor) as Status[]).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span className={cn("h-3 w-3 rounded-full", statusColor[s])} />
            {statusLabel[s]}
          </span>
        ))}
      </div>

      {selected && (
        <div className="mt-4 rounded-xl border border-red-500/10 bg-white/60 p-3 text-sm dark:bg-slate-900/50">
          <p className="font-semibold">{new Date(selected.date).toDateString()}</p>
          <p>{statusLabel[selected.status]}</p>
          {selected.notes && <p className="text-slate-500">{selected.notes}</p>}
        </div>
      )}
    </div>
  );
}
