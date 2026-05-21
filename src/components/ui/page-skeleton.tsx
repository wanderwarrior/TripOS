import { PageShell } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

// Shared loading skeleton for route-level `loading.tsx` files. Next renders
// this instantly on navigation while the real server component streams in —
// the single biggest perceived-speed win in the app.

export function PageSkeleton({
  kind = "list",
  rows = 6,
}: {
  kind?: "list" | "board" | "grid" | "detail";
  rows?: number;
}) {
  return (
    <PageShell>
      <div className="space-y-8">
        {/* Header block */}
        <div className="space-y-3">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        {kind === "board" ? (
          <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[28rem]" />
            ))}
          </div>
        ) : kind === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: rows }).map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : kind === "detail" ? (
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <Skeleton className="h-[28rem]" />
            <Skeleton className="h-72" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {Array.from({ length: rows }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
