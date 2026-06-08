"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { TRIAL_DAYS } from "@/lib/plans";

/**
 * A persistent bottom CTA bar that slides in once the visitor has scrolled past
 * the hero — keeping the primary action one tap away at the moment of intent
 * (reduce-friction, not a dark pattern). Dismissible; stays dismissed for the
 * session. Shows the real spots-left figure when the founding offer is open.
 */
export function StickyCta({
  spotsLeft,
  isOpen,
}: {
  spotsLeft: number;
  isOpen: boolean;
}) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume dismissed until we check

  useEffect(() => {
    setDismissed(sessionStorage.getItem("to_sticky_cta") === "1");
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.9);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--gold-line)] bg-inkwash/95 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--on-dark)]">
            Run your whole agency on tripOS
          </p>
          <p className="truncate text-xs text-[var(--on-dark)]/65">
            {isOpen && spotsLeft > 0 ? (
              <>
                <span className="font-mono tabular-nums text-[#e3c98f]">
                  {spotsLeft}
                </span>{" "}
                founding spots left · {TRIAL_DAYS}-day trial, no card
              </>
            ) : (
              <>{TRIAL_DAYS}-day free trial · no card required</>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#e3c98f] px-5 py-2.5 text-sm font-semibold text-[#1a1205] transition-all hover:bg-[#ecd6a4]"
          >
            <Sparkles className="h-4 w-4" />
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              sessionStorage.setItem("to_sticky_cta", "1");
              setDismissed(true);
            }}
            className="rounded-md p-1.5 text-[var(--on-dark)]/50 transition-colors hover:bg-white/10 hover:text-[var(--on-dark)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
