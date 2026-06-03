"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<
    { id: string; studentName: string; parentName: string; mobile: string; classLevel: string; createdAt: string }[]
  >([]);

  useEffect(() => {
    api<{ items: typeof items }>("/inquiries").then((d) => setItems(d.items));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admission Inquiries</h1>
      {items.map((i) => (
        <Card key={i.id} className="mb-2">
          <p className="font-semibold">{i.studentName}</p>
          <p className="text-sm text-slate-500">
            Parent: {i.parentName} · {i.mobile} · Class {i.classLevel}
          </p>
          <p className="text-xs text-slate-400">{new Date(i.createdAt).toLocaleString()}</p>
        </Card>
      ))}
      {items.length === 0 && <p className="text-slate-500">No inquiries yet.</p>}
    </div>
  );
}
