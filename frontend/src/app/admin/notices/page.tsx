"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { CLASS_LEVELS } from "@/lib/constants";

export default function AdminNoticesPage() {
  const [items, setItems] = useState<{ id: string; title: string; content: string; audience: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    audience: "ALL_STUDENTS",
    classLevel: CLASS_LEVELS[0],
  });

  function load() {
    api<{ items: typeof items }>("/notices").then((d) => setItems(d.items));
  }

  useEffect(() => {
    load();
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    await api("/notices", { method: "POST", body: JSON.stringify(form) });
    setForm({ title: "", content: "", audience: "ALL_STUDENTS", classLevel: CLASS_LEVELS[0] });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Notices</h1>
      <Card className="mb-6">
        <form onSubmit={send} className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea
            className="w-full rounded-xl border p-3 text-sm"
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
          >
            <option value="ALL_STUDENTS">All Students</option>
            <option value="CLASS_WISE">Class Wise</option>
            <option value="TEACHERS">Teachers</option>
          </select>
          {form.audience === "CLASS_WISE" && (
            <select
              className="w-full rounded-xl border px-3 py-2"
              value={form.classLevel}
              onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
            >
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          )}
          <Button type="submit">Send Notice</Button>
        </form>
      </Card>
      {items.map((n) => (
        <Card key={n.id} className="mb-2">
          <p className="font-semibold">{n.title}</p>
          <p className="text-sm text-slate-500">{n.audience}</p>
          <p className="mt-1 text-sm">{n.content}</p>
        </Card>
      ))}
    </div>
  );
}
