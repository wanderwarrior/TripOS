import { cn } from "@/lib/utils";
import { Mark } from "./mark";

/**
 * Zero-data state built on the C·Stack mark. The top + mid records float
 * gently inside a dashed frame whose border breathes toward gold — calm,
 * always-on, low-amplitude (reads as breathing, not spinning). Use for
 * "No trips yet" style screens.
 */
export function BrandEmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "brand-empty flex flex-col items-center gap-5 py-12 text-center text-ink",
        className
      )}
    >
      <div className="frame">
        <Mark size={62} title="" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display text-xl text-ink">{title}</h3>
        {body ? (
          <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-muted">
            {body}
          </p>
        ) : null}
      </div>
      {action ? <div className="inline-flex">{action}</div> : null}
    </div>
  );
}
