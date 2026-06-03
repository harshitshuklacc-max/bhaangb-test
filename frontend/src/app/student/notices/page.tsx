"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function StudentNoticesPage() {
  const [items, setItems] = useState<{ id: string; title: string; content: string }[]>([]);

  useEffect(() => {
    api<{ items: typeof items }>("/notices").then((d) => setItems(d.items));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Notices</h1>
      {items.map((n) => (
        <Card key={n.id} className="mb-3">
          <p className="font-semibold">{n.title}</p>
          <p className="mt-2 text-sm">{n.content}</p>
        </Card>
      ))}
    </div>
  );
}
