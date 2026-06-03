import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { INSTITUTE } from "@/lib/constants";
import { Star } from "lucide-react";

export default function ReviewsPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-[var(--brand-red)]">Reviews</h1>
        <Card className="text-center">
          <div className="mb-4 flex justify-center gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-8 w-8 fill-current" />
            ))}
          </div>
          <p className="text-3xl font-bold">{INSTITUTE.rating}/5</p>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Google Rating</p>
          <p className="mt-4 text-sm text-slate-500">
            Parents and students trust Smart Step Academy for quality education in Bilaspur.
          </p>
        </Card>
      </div>
      <SiteFooter />
    </>
  );
}
