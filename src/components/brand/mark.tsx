import { cn } from "@/lib/utils";

/**
 * tripOS — C·Stack mark.
 * Three offset rounded "records"; the top one is the live gold record, the
 * other two use `currentColor` so the mark inherits the surrounding text tone
 * (ink on paper, off-white on the inkwash sidebar). Geometry is the canonical
 * v4 stack from the motion-system handoff (viewBox 0 0 100 100).
 */
export function Mark({
  size = 32,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={cn("brand-mark block overflow-visible", className)}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <rect className="rec rec-top" x="22" y="22" width="44" height="15" rx="7.5" />
      <rect className="rec rec-mid" x="30" y="43" width="52" height="15" rx="7.5" />
      <rect className="rec rec-bot" x="18" y="64" width="48" height="15" rx="7.5" />
    </svg>
  );
}

/**
 * The "tripOS" wordmark — `trip` in the foreground tone, `OS` in gold.
 * Tight tracking, weight 700, per the brand spec.
 */
export function Wordmark({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn("brand-word font-semibold tracking-[-0.04em] leading-none", className)}
      style={style}
    >
      trip<span className="text-gold">OS</span>
    </span>
  );
}

/**
 * Full lockup — mark + wordmark sitting very tight, used in nav rails and
 * headers. Pass `wordClassName` to size the wordmark for the context.
 */
export function Logo({
  size = 28,
  wordClassName = "text-[19px]",
  showWord = true,
  className,
}: {
  size?: number;
  wordClassName?: string;
  showWord?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-[3px]", className)}>
      <Mark size={size} title="tripOS" />
      {showWord ? <Wordmark className={wordClassName} /> : null}
    </span>
  );
}
