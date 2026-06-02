import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  // Gold-tinted shimmer from the tripOS motion system (brand-sk). Same API, so
  // every existing loading.tsx skeleton picks up the on-brand gold sweep.
  return <div className={cn("brand-sk rounded-[10px]", className)} {...props} />;
}
