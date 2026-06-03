"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { CLASS_LEVELS } from "@/lib/constants";

interface Student {
  id: string;
  username: string;
  studentName: string;
  classLevel: string;
  mobile: string;
}

export default function AdminStudentsPage() {
  const [items, setItems] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [form, setForm] = useState({
    studentName: "",
    fatherName: "",
    motherName: "",
    mobile: "",
    email: "",
    classLevel: CLASS_LEVELS[0],
    schoolName: "",
    address: "",
    admissionDate: new Date().toISOString().slice(0, 10),
  });

  function load() {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    api<{ items: Student[] }>(`/students${q}`).then((d) => setItems(d.items));
  }

  useEffect(() => {
    load();
  }, [search]);

  async function createStudent(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/students`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
        credentials: "include",
      }
    );
    const data = await res.json();
    if (res.ok) {
      setCredentials(data.credentials);
      setShowForm(false);
      load();
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Students</h1>
        <Button onClick={() => setShowForm(!showForm)}>Add Student</Button>
      </div>
      <Input
        placeholder="Search students…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-md"
      />
      {credentials && (
        <Card className="mb-4 border-red-400/50">
          <p className="font-semibold text-[var(--brand-red)]">Generated Credentials (save now)</p>
          <p>Username: {credentials.username}</p>
          <p>Password: {credentials.password}</p>
          <Button size="sm" className="mt-2" onClick={() => window.print()}>
            Print
          </Button>
        </Card>
      )}
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createStudent} className="grid gap-3 sm:grid-cols-2">
            {Object.keys(form).map((key) =>
              key === "classLevel" ? (
                <select
                  key={key}
                  className="rounded-xl border px-3 py-2 text-sm"
                  value={form.classLevel}
                  onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
                >
                  {CLASS_LEVELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  key={key}
                  placeholder={key}
                  required={!["email"].includes(key)}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                />
              )
            )}
            <Button type="submit" className="sm:col-span-2">
              Create & Generate Login
            </Button>
          </form>
        </Card>
      )}
      <div className="space-y-2">
        {items.map((s) => (
          <Card key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <p className="font-semibold">{s.studentName}</p>
              <p className="text-sm text-slate-500">
                Class {s.classLevel} · {s.username}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const d = await api<{ username: string; password: string }>(
                  `/students/${s.id}/reset-password`,
                  { method: "POST" }
                );
                setCredentials(d);
              }}
            >
              Reset Password
            </Button>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="text-slate-500">No students yet. Add your first student above.</p>
        )}
      </div>
    </div>
  );
}
