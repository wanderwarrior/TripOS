"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { LayoutGrid, Loader2, Table2, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// Icons are referenced by string key, not passed as props — a Server
// Component cannot hand a function (the lucide icon component) to this
// Client Component.
const ICONS = {
  grid: LayoutGrid,
  table: Table2,
  user: User,
  users: Users,
} as const;

export type ViewOption = {
  value: string;
  label: string;
  icon: keyof typeof ICONS;
};

/**
 * Segmented control that drives a `?view=` URL param. Server components
 * read the param and render the matching view — no client state, the URL
 * is the source of truth (shareable, survives refresh, no flash).
 */
export function ViewToggle({
  options,
  param = "view",
  defaultValue,
}: {
  options: ViewOption[];
  param?: string;
  defaultValue: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = searchParams.get(param) ?? defaultValue;

  function select(value: string) {
    if (value === current) return;
    const next = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === defaultValue) next.delete(param);
    else next.set(param, value);
    startTransition(() => {
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white p-0.5">
      {options.map((opt) => {
        const active = opt.value === current;
        const Icon = ICONS[opt.icon];
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => select(opt.value)}
            disabled={isPending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors",
              active
                ? "bg-navy text-ivory"
                : "text-muted-foreground hover:text-navy"
            )}
          >
            {isPending && active ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon className="h-3.5 w-3.5" />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
