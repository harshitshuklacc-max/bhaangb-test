import Link from "next/link";
import { Logo } from "@/components/Logo";
import { INSTITUTE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-red-500/10 bg-neutral-950 text-neutral-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 md:flex-row md:justify-between">
        <Logo size="lg" showText href="/" />
        <div className="text-center text-sm md:text-right">
          <p>{INSTITUTE.address}</p>
          <p className="mt-1">
            <a href={`tel:${INSTITUTE.phone.replace(/\s/g, "")}`} className="hover:text-white">
              {INSTITUTE.phone}
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {INSTITUTE.name}. All rights reserved.
      </div>
    </footer>
  );
}
