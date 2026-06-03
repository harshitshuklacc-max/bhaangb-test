import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]",
        accent: "bg-white text-[var(--brand-red-dark)] hover:bg-red-50 border border-red-100",
        outline:
          "border border-[var(--brand-red)]/40 bg-transparent text-[var(--brand-red)] hover:bg-red-50 dark:hover:bg-red-950/30",
        ghost: "hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--brand-red)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        sm: "h-8 px-3 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
