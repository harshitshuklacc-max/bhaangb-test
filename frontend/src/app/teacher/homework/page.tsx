"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { CLASS_LEVELS } from "@/lib/constants";

export default function TeacherHomeworkPage() {
  const [items, setItems] = useState<{ id: string; title: string; classLevel: string; dueDate: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    classLevel: CLASS_LEVELS[0],
    dueDate: "",
  });

  function load() {
    api<{ items: typeof items }>("/homework").then((d) => setItems(d.items));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await api("/homework", { method: "POST", body: JSON.stringify(form) });
    setForm({ title: "", description: "", subject: "", classLevel: CLASS_LEVELS[0], dueDate: "" });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Homework</h1>
      <Card className="mb-6">
        <form onSubmit={create} className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea
            className="w-full rounded-xl border p-3 text-sm"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={form.classLevel}
            onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
          >
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={c}>
                Class {c} only
              </option>
            ))}
          </select>
          <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <Button type="submit">Assign to Class</Button>
        </form>
      </Card>
      {items.map((h) => (
        <Card key={h.id} className="mb-2">
          <p className="font-semibold">{h.title}</p>
          <p className="text-sm text-slate-500">Class {h.classLevel} · Due {new Date(h.dueDate).toLocaleDateString()}</p>
        </Card>
      ))}
    </div>
  );
}
