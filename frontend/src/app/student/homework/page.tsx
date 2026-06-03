"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function StudentHomeworkPage() {
  const [items, setItems] = useState<
    { id: string; title: string; description: string; subject: string; dueDate: string }[]
  >([]);

  useEffect(() => {
    api<{ items: typeof items }>("/homework").then((d) => setItems(d.items));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Homework (Your Class Only)</h1>
      {items.map((h) => (
        <Card key={h.id} className="mb-3">
          <p className="font-semibold">{h.title}</p>
          <p className="text-sm text-[var(--brand-red)]">{h.subject}</p>
          <p className="mt-2 text-sm">{h.description}</p>
          <p className="mt-2 text-xs text-slate-500">Due {new Date(h.dueDate).toLocaleString()}</p>
        </Card>
      ))}
      {items.length === 0 && <p className="text-slate-500">No homework for your class.</p>}
    </div>
  );
}
