"use client";

import { useEffect, useState } from "react";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diff(toMs: number): Parts | null {
  const ms = toMs - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/**
 * Counts down to a fixed ISO date. The target never resets — when it passes,
 * `onExpired`/the expired fallback shows. Computes only after mount to avoid a
 * hydration mismatch (server has no stable "now").
 */
export function Countdown({
  deadline,
  className = "",
}: {
  deadline: string;
  className?: string;
}) {
  const toMs = Date.parse(deadline);
  const [parts, setParts] = useState<Parts | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setParts(diff(toMs));
    const id = setInterval(() => setParts(diff(toMs)), 1000);
    return () => clearInterval(id);
  }, [toMs]);

  // Pre-mount + expired both render nothing extra; the parent decides messaging.
  if (!mounted) {
    return <div className={className} aria-hidden style={{ minHeight: 56 }} />;
  }
  if (!parts) {
    return (
      <p className={`text-sm text-[var(--on-dark)]/70 ${className}`}>
        Founding pricing has closed.
      </p>
    );
  }

  const cells: [number, string][] = [
    [parts.days, "days"],
    [parts.hours, "hrs"],
    [parts.minutes, "min"],
    [parts.seconds, "sec"],
  ];

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {cells.map(([n, label]) => (
        <div
          key={label}
          className="flex min-w-[58px] flex-col items-center rounded-[10px] border border-[var(--gold-line)] bg-white/5 px-3 py-2"
        >
          <span className="font-mono text-2xl font-semibold tabular-nums text-[#e3c98f]">
            {String(n).padStart(2, "0")}
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[var(--on-dark)]/55">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
