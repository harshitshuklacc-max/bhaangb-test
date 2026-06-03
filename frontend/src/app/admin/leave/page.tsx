"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

interface Leave {
  id: string;
  status: string;
  reason: string;
  startDate: string;
  endDate: string;
  teacher: { name: string };
}

export default function AdminLeavePage() {
  const [items, setItems] = useState<Leave[]>([]);

  function load() {
    api<{ items: Leave[] }>("/leave?status=PENDING").then((d) => setItems(d.items));
  }

  useEffect(() => {
    load();
  }, []);

  async function update(id: string, status: "APPROVED" | "REJECTED") {
    await api(`/leave/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Leave Requests</h1>
      {items.map((l) => (
        <Card key={l.id} className="mb-3">
          <p className="font-semibold">{l.teacher.name}</p>
          <p className="text-sm">
            {new Date(l.startDate).toLocaleDateString()} –{" "}
            {new Date(l.endDate).toLocaleDateString()}
          </p>
          <p className="mt-1 text-sm">{l.reason}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => update(l.id, "APPROVED")}>
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => update(l.id, "REJECTED")}>
              Reject
            </Button>
          </div>
        </Card>
      ))}
      {items.length === 0 && <p className="text-slate-500">No pending leave requests.</p>}
    </div>
  );
}
