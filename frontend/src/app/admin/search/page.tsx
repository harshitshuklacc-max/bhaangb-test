"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function AdminSearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Record<string, unknown[]> | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const data = await api<{
      students: unknown[];
      teachers: unknown[];
      homework: unknown[];
      notices: unknown[];
    }>(`/search?q=${encodeURIComponent(q)}`);
    setResults(data as Record<string, unknown[]>);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Global Search</h1>
      <form onSubmit={search} className="mb-6 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="max-w-md" />
        <button type="submit" className="btn-primary rounded-xl px-4">
          Search
        </button>
      </form>
      {results &&
        Object.entries(results).map(([key, items]) =>
          (items as unknown[]).length > 0 ? (
            <Card key={key} className="mb-4">
              <h2 className="mb-2 font-semibold capitalize">{key}</h2>
              <pre className="overflow-auto text-xs">{JSON.stringify(items, null, 2)}</pre>
            </Card>
          ) : null
        )}
    </div>
  );
}
