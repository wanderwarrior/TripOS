"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Compass, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_PREFIX = "tripos:guide:";

/**
 * A one-time orientation banner for a page: explains the page's place in the
 * agency workflow and points at the next action. Dismissable per browser
 * (localStorage), so first-time users get steered while power users can clear
 * it for good. Keep `body` to a sentence or two.
 */
export function PageGuide({
  id,
  eyebrow = "What to do here",
  body,
  cta,
  className,
}: {
  id: string;
  eyebrow?: string;
  body: React.ReactNode;
  cta?: { label: string; href: string };
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      setDismissed(localStorage.getItem(STORAGE_PREFIX + id) === "1");
    } catch {
      setDismissed(false);
    }
  }, [id]);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_PREFIX + id, "1");
    } catch {
      // ignore — won't persist, harmless
    }
  }

  if (!mounted || dismissed) return null;

  return (
    <aside
      className={cn(
        "relative mb-7 flex items-start gap-4 rounded-lg border border-[var(--gold-line)] bg-gold-soft/50 p-4 pr-10 shadow-soft",
        className
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[var(--gold-line)] bg-paper text-gold-deep">
        <Compass className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="tc-eyebrow gold">{eyebrow}</p>
        <p className="mt-1 text-sm text-ink/80 leading-relaxed">{body}</p>
        {cta ? (
          <Link
            href={cta.href}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-gold-deep hover:text-ink"
          >
            {cta.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        ) : null}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss guide"
        className="absolute top-2.5 right-2.5 inline-flex h-6 w-6 items-center justify-center rounded-[8px] text-muted hover:bg-paper hover:text-ink"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </aside>
  );
}
