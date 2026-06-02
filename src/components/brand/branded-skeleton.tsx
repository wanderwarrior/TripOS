import { cn } from "@/lib/utils";

/**
 * Gold-tinted shimmer placeholder for content that's still fetching.
 * Same role as the base ui/Skeleton but uses the motion-system gold sweep
 * (`--skel` → `--skel-hi`). Compose freely for lists and detail panes.
 */
export function BrandedSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("brand-sk", className)} {...props} />;
}

/** Ready-made avatar + title/subtitle + body-lines card, per the handoff. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 rounded-[14px] border border-line bg-paper-2 p-[18px]",
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        <BrandedSkeleton className="h-[46px] w-[46px] flex-none rounded-[12px]" />
        <div className="flex flex-1 flex-col gap-2">
          <BrandedSkeleton className="h-3.5 w-3/5" />
          <BrandedSkeleton className="h-2.5 w-2/5" />
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <BrandedSkeleton className="h-2.5 w-full" />
        <BrandedSkeleton className="h-2.5 w-[85%]" />
        <BrandedSkeleton className="h-2.5 w-[65%]" />
      </div>
    </div>
  );
}
