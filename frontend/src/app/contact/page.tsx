"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { INSTITUTE, CLASS_LEVELS } from "@/lib/constants";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [form, setForm] = useState({
    studentName: "",
    parentName: "",
    mobile: "",
    email: "",
    classLevel: CLASS_LEVELS[0],
    message: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/inquiries", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus("ok");
      setForm({
        studentName: "",
        parentName: "",
        mobile: "",
        email: "",
        classLevel: CLASS_LEVELS[0],
        message: "",
      });
    } catch {
      setStatus("err");
    }
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-[var(--brand-red)]">Contact</h1>
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <p className="font-semibold">{INSTITUTE.address}</p>
            <p className="mt-2">{INSTITUTE.phone}</p>
            <div className="mt-6 aspect-video overflow-hidden rounded-xl">
              <iframe
                title="Map"
                src={INSTITUTE.mapEmbed}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>
          <Card id="admission">
            <h2 className="mb-4 text-xl font-bold">Admission Inquiry</h2>
            <form onSubmit={submit} className="space-y-3">
              <Input
                placeholder="Student Name"
                required
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              />
              <Input
                placeholder="Parent Name"
                required
                value={form.parentName}
                onChange={(e) => setForm({ ...form, parentName: e.target.value })}
              />
              <Input
                placeholder="Mobile"
                required
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
              <Input
                placeholder="Email (optional)"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <select
                className="flex h-10 w-full rounded-xl border border-red-900/15 bg-white/80 px-3 text-sm dark:bg-neutral-900/60"
                value={form.classLevel}
                onChange={(e) => setForm({ ...form, classLevel: e.target.value })}
              >
                {CLASS_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
              <textarea
                className="min-h-[80px] w-full rounded-xl border border-red-900/15 bg-white/80 p-3 text-sm dark:bg-neutral-900/60"
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <Button type="submit" className="w-full">
                Submit Inquiry
              </Button>
              {status === "ok" && (
                <p className="text-sm text-emerald-600">Inquiry submitted successfully!</p>
              )}
              {status === "err" && (
                <p className="text-sm text-red-600">Failed to submit. Is the API running?</p>
              )}
            </form>
          </Card>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
