import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";

export default function FacultyPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-[var(--brand-red)]">Our Faculty</h1>
        <Card>
          <p className="text-slate-600 dark:text-slate-300">
            Meet our dedicated and experienced teachers. Faculty profiles are managed by the
            institute and will appear here as teachers are added through the admin portal.
          </p>
        </Card>
      </div>
      <SiteFooter />
    </>
  );
}
