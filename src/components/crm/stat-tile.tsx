import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  hint,
  href,
  tone,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "default" | "navy" | "danger";
  icon?: React.ReactNode;
}) {
  const inner = (
    <div
      className={cn(
        "h-full rounded-2xl border p-5 transition-all",
        tone === "navy"
          ? "border-navy bg-navy text-ivory"
          : tone === "danger"
            ? "border-red-100 bg-red-50/40"
            : "border-line bg-white",
        href && "hover:shadow-soft cursor-pointer group"
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-[10px] uppercase tracking-[0.22em] flex items-center gap-1.5",
            tone === "navy" ? "text-sand" : "text-sand-700"
          )}
        >
          {icon}
          {label}
        </p>
        {href && (
          <ArrowUpRight
            className={cn(
              "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
              tone === "navy" ? "text-ivory" : "text-navy"
            )}
          />
        )}
      </div>
      <p
        className={cn(
          "mt-3 font-display text-4xl tracking-tight",
          tone === "navy" ? "text-ivory" : "text-navy"
        )}
      >
        {value}
      </p>
      {hint && (
        <p
          className={cn(
            "mt-1 text-xs",
            tone === "navy" ? "text-ivory/60" : "text-muted-foreground"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
