"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, getApiBaseUrl } from "@/lib/api";

export default function TeacherLeavePage() {
  const [items, setItems] = useState<{ id: string; status: string; reason: string }[]>([]);
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });

  function load() {
    api<{ items: typeof items }>("/leave/my").then((d) => setItems(d.items));
  }

  useEffect(() => {
    load();
  }, []);

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("startDate", form.startDate);
    fd.append("endDate", form.endDate);
    fd.append("reason", form.reason);
    const token = localStorage.getItem("accessToken");
    await fetch(
      `${getApiBaseUrl()}/leave`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
        credentials: "include",
      }
    );
    load();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Leave Request</h1>
      <Card className="mb-6">
        <form onSubmit={apply} className="space-y-3">
          <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          <textarea
            className="w-full rounded-xl border p-3 text-sm"
            placeholder="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          />
          <Button type="submit">Submit to Admin</Button>
        </form>
      </Card>
      {items.map((l) => (
        <Card key={l.id} className="mb-2">
          <span className="font-semibold">{l.status}</span> — {l.reason}
        </Card>
      ))}
    </div>
  );
}
