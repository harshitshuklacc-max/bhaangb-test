import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { INSTITUTE } from "@/lib/constants";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-6 text-4xl font-bold text-[var(--brand-red)]">About Us</h1>
        <Card>
          <p className="leading-relaxed text-slate-700 dark:text-slate-200">{INSTITUTE.description}</p>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Located at {INSTITUTE.address}. Contact us at {INSTITUTE.phone}.
          </p>
        </Card>
      </div>
      <SiteFooter />
    </>
  );
}
