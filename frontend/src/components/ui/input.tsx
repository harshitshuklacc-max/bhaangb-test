import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl border border-red-900/15 bg-white/80 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-[var(--brand-red)] focus:ring-2 focus:ring-red-500/25 dark:bg-neutral-900/60 dark:border-red-500/20",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
