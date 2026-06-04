"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, getApiBaseUrl } from "@/lib/api";

interface Teacher {
  id: string;
  username: string;
  name: string;
  subject: string;
  email: string;
}

export default function AdminTeachersPage() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    qualification: "",
    subject: "",
    address: "",
    joiningDate: new Date().toISOString().slice(0, 10),
  });

  function load() {
    api<{ items: Teacher[] }>("/teachers").then((d) => setItems(d.items));
  }

  useEffect(() => {
    load();
  }, []);

  async function createTeacher(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      `${getApiBaseUrl()}/teachers`,
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
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <Button onClick={() => setShowForm(!showForm)}>Add Teacher</Button>
      </div>
      {credentials && (
        <Card className="mb-4">
          <p className="font-semibold">Credentials</p>
          <p>Username: {credentials.username}</p>
          <p>Password: {credentials.password}</p>
        </Card>
      )}
      {showForm && (
        <Card className="mb-6">
          <form onSubmit={createTeacher} className="grid gap-3 sm:grid-cols-2">
            {Object.keys(form).map((key) => (
              <Input
                key={key}
                placeholder={key}
                required
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            ))}
            <Button type="submit" className="sm:col-span-2">
              Create Teacher
            </Button>
          </form>
        </Card>
      )}
      <div className="space-y-2">
        {items.map((t) => (
          <Card key={t.id}>
            <p className="font-semibold">{t.name}</p>
            <p className="text-sm text-slate-500">
              {t.subject} · {t.username}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
