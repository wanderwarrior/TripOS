import { cn } from "@/lib/utils";

/**
 * On-brand inline loading marks — small, in-context (buttons, rows, toolbars).
 * Both inherit the gold accent token. Decorative by default; pass `label` to
 * announce to assistive tech.
 */

export function WaveSpinner({
  size = "md",
  className,
  label,
}: {
  size?: "md" | "sm";
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn("brand-wave", size === "sm" && "sm", className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <i />
      <i />
      <i />
    </span>
  );
}

export function RingSpinner({
  size = 26,
  className,
  label,
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      className={cn("brand-ring", className)}
      width={size}
      height={size}
      viewBox="0 0 50 50"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle className="trk" cx="25" cy="25" r="20" />
      <circle className="ind" cx="25" cy="25" r="20" />
    </svg>
  );
}
