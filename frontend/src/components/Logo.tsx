import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  size = "md",
  showText = true,
  href = "/",
  className,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}) {
  const sizes = {
    sm: { img: 40, text: "text-sm" },
    md: { img: 52, text: "text-base" },
    lg: { img: 72, text: "text-lg" },
  };
  const s = sizes[size];

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.png"
        alt="Smart Step Academy"
        width={s.img}
        height={s.img}
        className="h-auto w-auto object-contain"
        priority
      />
      {showText && (
        <div className="hidden leading-tight sm:block">
          <span className={cn("block font-bold text-[var(--brand-red)]", s.text)}>
            Smart Step
          </span>
          <span className="block text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Academy
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="shrink-0 transition opacity-95 hover:opacity-100">
        {content}
      </Link>
    );
  }

  return content;
}
