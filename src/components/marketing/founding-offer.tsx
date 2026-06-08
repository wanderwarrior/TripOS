"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { TRIAL_DAYS } from "@/lib/plans";
import { FOUNDING_DISCOUNT_PCT, type FoundingStatus } from "@/lib/founding";
import { Countdown } from "@/components/marketing/countdown";

/**
 * The founding-offer urgency block. Every number here is real: `spotsLeft`
 * comes from the live count of paying agencies, and the countdown targets a
 * fixed deadline. When the cohort fills or the deadline passes (`!isOpen`), it
 * degrades gracefully to a non-scarcity CTA instead of faking availability.
 */
export function FoundingOffer({ status }: { status: FoundingStatus }) {
  const { spotsLeft, cap, claimed, filledPct, deadline, isOpen } = status;
  const pct = Math.round(filledPct * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--gold-line)] bg-inkwash px-6 py-10 text-center text-[var(--on-dark)] md:px-12 md:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(200,169,106,0.22),transparent_65%)]" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-line)] bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e3c98f]">
          <Flame className="h-3.5 w-3.5" />
          Founding offer · {FOUNDING_DISCOUNT_PCT}% off for life
        </span>

        <h2 className="mt-5 font-display text-3xl md:text-4xl">
          {isOpen
            ? "Be one of the first 100 — lock founding pricing forever"
            : "Founding pricing is closing"}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--on-dark)]/75">
          The first {cap} agencies lock in {FOUNDING_DISCOUNT_PCT}% off{" "}
          <span className="text-[var(--on-dark)]">for the life of their
          account</span> — plus white-glove onboarding where we set up your
          branding and import your first leads with you.
        </p>

        {isOpen && (
          <>
            {/* Real spots meter */}
            <div className="mx-auto mt-7 max-w-md">
              <div className="flex items-baseline justify-between text-xs text-[var(--on-dark)]/70">
                <span>
                  <span className="font-mono text-base font-semibold tabular-nums text-[#e3c98f]">
                    {spotsLeft}
                  </span>{" "}
                  of {cap} founding spots left
                </span>
                <span className="font-mono tabular-nums">{claimed} claimed</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c8a96a] to-[#e3c98f] transition-all"
                  style={{ width: `${Math.max(3, pct)}%` }}
                />
              </div>
            </div>

            {/* Real deadline countdown */}
            <p className="mt-7 text-[11px] uppercase tracking-[0.2em] text-[var(--on-dark)]/55">
              Founding pricing ends
            </p>
            <Countdown deadline={deadline} className="mt-3" />
          </>
        )}

        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-[10px] bg-[#e3c98f] px-7 py-3.5 text-sm font-semibold text-[#1a1205] shadow-[0_8px_30px_-8px_rgba(200,169,106,0.6)] transition-all hover:bg-[#ecd6a4]"
        >
          {isOpen ? "Claim your founding spot" : "Start your free trial"}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-xs text-[var(--on-dark)]/55">
          {TRIAL_DAYS}-day free trial · no card required · cancel anytime
        </p>
      </div>
    </div>
  );
}
