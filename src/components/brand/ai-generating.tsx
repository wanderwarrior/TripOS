"use client";

import { useEffect, useState } from "react";
import { Mark } from "./mark";
import { BrandedSkeleton } from "./branded-skeleton";

const DEFAULT_STEPS = [
  "Reading your brief…",
  "Mapping the route…",
  "Pacing the days…",
  "Drafting day-by-day…",
  "Polishing the prose…",
];

/**
 * AI generation waiting state — the cinematic "thinking" panel shown while an
 * AI itinerary (or any longer AI task) is being generated. The C·Stack mark
 * runs the gold "live" sweep (reuses the boot-loader loop), a mono status line
 * cycles through stage copy, and ghost "day" rows shimmer in underneath so the
 * wait reads as the document assembling itself.
 *
 * Drop in place of a plain spinner while the server action is pending.
 */
export function AiGeneratingPanel({
  title = "Crafting your itinerary",
  steps = DEFAULT_STEPS,
  rows = 3,
  className,
}: {
  title?: string;
  steps?: string[];
  rows?: number;
  className?: string;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => (s + 1) % steps.length),
      1400
    );
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div
      className={
        "brand-loader loading rounded-lg border border-line bg-paper-2 px-6 py-12 text-center md:px-10 " +
        (className ?? "")
      }
      role="status"
      aria-live="polite"
      aria-busy
    >
      <div className="flex flex-col items-center gap-1">
        <Mark size={72} title="" />
        <h2 className="mt-4 font-display text-2xl text-ink">{title}</h2>
        <p className="status mt-1" style={{ color: "var(--muted)" }}>
          {steps[step]}
        </p>
      </div>

      {/* ghost rows: the itinerary assembling itself */}
      <div className="mx-auto mt-9 max-w-xl space-y-3 text-left">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="rounded-[12px] border border-line bg-paper p-4"
            style={{
              animation: "fadeUp 0.6s var(--ease) both",
              animationDelay: `${0.15 * i}s`,
            }}
          >
            <div className="flex items-center gap-3">
              <BrandedSkeleton className="h-7 w-7 flex-none rounded-[8px]" />
              <BrandedSkeleton className="h-3 w-1/3" />
            </div>
            <div className="mt-3 space-y-2">
              <BrandedSkeleton className="h-2.5 w-full" />
              <BrandedSkeleton className="h-2.5 w-[85%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
