import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { COURSES, CLASS_LEVELS } from "@/lib/constants";

export default function CoursesPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-[var(--brand-red)]">Courses</h1>
        <div className="mb-8 grid gap-4">
          {COURSES.map((c) => (
            <Card key={c.title}>
              <h2 className="text-xl font-semibold">{c.title}</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{c.description}</p>
            </Card>
          ))}
        </div>
        <Card>
          <h2 className="mb-3 font-semibold">Available Classes</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CLASS_LEVELS.map((c) => (
              <li
                key={c}
                className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium dark:bg-red-950/40"
              >
                Class {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <SiteFooter />
    </>
  );
}
