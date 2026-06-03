"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  Monitor,
  Star,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COURSES, FEATURES, INSTITUTE } from "@/lib/constants";

const HeroScene = dynamic(() => import("@/components/3d/HeroScene"), {
  ssr: false,
});

const iconMap = {
  Monitor,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Bell,
  CalendarDays,
} as const;

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <section className="gradient-hero relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Smart Step Academy"
                width={100}
                height={100}
                className="rounded-2xl bg-black/30 p-2 shadow-lg ring-2 ring-white/20"
                priority
              />
              <div>
                <p className="text-accent-light mb-1 text-sm font-semibold uppercase tracking-widest">
                  {INSTITUTE.tagline}
                </p>
                <h1 className="text-3xl font-bold md:text-4xl">{INSTITUTE.name}</h1>
              </div>
            </div>
            <p className="mb-6 text-red-50/90">{INSTITUTE.description.slice(0, 180)}…</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href="/contact#admission">Apply for Admission</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/50 text-white hover:bg-white/10"
              >
                <Link href="/login">Portal Login</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-red-100">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{INSTITUTE.rating}/5 Google Rating</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <HeroScene />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-[var(--brand-red)]">
          Why Smart Step Academy?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = iconMap[f.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full transition-shadow hover:shadow-lg hover:shadow-red-500/10">
                  <Icon className="mb-3 h-8 w-8 text-[var(--brand-red)]" />
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="bg-red-50/50 py-16 dark:bg-neutral-950/50">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-[var(--brand-red)]">
            Our Courses
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {COURSES.map((c) => (
              <Card key={c.title}>
                <h3 className="text-xl font-bold text-[var(--brand-red)]">{c.title}</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{c.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
