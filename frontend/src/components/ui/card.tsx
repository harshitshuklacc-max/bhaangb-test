import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className={cn("glass rounded-2xl p-6", className)}>
      {children}
    </div>
  );
}
