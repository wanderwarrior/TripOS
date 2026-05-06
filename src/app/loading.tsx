import { PageShell } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageShell>
      <div className="space-y-10">
        <Skeleton className="h-12 w-2/3 max-w-xl" />
        <Skeleton className="h-5 w-1/2 max-w-md" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
