// Founding-cohort offer config — the single source of truth for the
// "first 100 agencies lock in founding pricing for life" campaign. Pure config
// (no server imports) so client components, the pricing page and the server
// counter all read the same numbers.
//
// IMPORTANT — honesty contract: every number surfaced from here is REAL.
// `FOUNDING_CAP` is a real cap the business commits to; the live "spots left"
// is computed from the actual count of paying founding agencies (see
// `src/server/services/founding.ts`). `FOUNDING_DEADLINE` is a real, fixed
// date the price genuinely changes on — it must never silently reset. Do not
// wire fabricated counters, fake "viewing now" tickers or resetting timers to
// this module: detectable fake scarcity erodes trust (and is a named dark
// pattern under India's CCPA 2023 guidelines).

import { PLANS, type PlanDef } from "@/lib/plans";

/** How many agencies can ever claim the founding (lifetime-locked) price. */
export const FOUNDING_CAP = 100;

/** Headline discount off standard pricing, locked for life for the cohort. */
export const FOUNDING_DISCOUNT_PCT = 50;

/**
 * The real date founding pricing closes / standard pricing resumes. Drives the
 * countdown. Change this deliberately — never on a timer. ISO 8601, IST.
 */
export const FOUNDING_DEADLINE = "2026-07-31T23:59:59+05:30";

// Founding (lifetime-locked) monthly prices, in INR. Explicit round numbers
// (a real 50% off the ₹4,999 / ₹9,999 standard) — ₹2,499 is the price floor;
// we don't sell below it.
export const FOUNDING_PRICES: Record<"STARTER" | "PRO", number> = {
  STARTER: 2499,
  PRO: 4999,
};

export type FoundingStatus = {
  cap: number;
  /** Real count of agencies that have already claimed a founding spot. */
  claimed: number;
  /** cap - claimed, floored at 0. */
  spotsLeft: number;
  /** Fraction claimed, 0..1 — for the progress meter. */
  filledPct: number;
  /** ISO deadline string. */
  deadline: string;
  /** True while spots remain AND the deadline hasn't passed. */
  isOpen: boolean;
};

/** Pure helper — derive the public status object from a real claimed count. */
export function computeFoundingStatus(
  claimed: number,
  now: number = Date.now(),
): FoundingStatus {
  const safeClaimed = Math.max(0, Math.min(claimed, FOUNDING_CAP));
  const spotsLeft = Math.max(0, FOUNDING_CAP - safeClaimed);
  const deadlineMs = Date.parse(FOUNDING_DEADLINE);
  return {
    cap: FOUNDING_CAP,
    claimed: safeClaimed,
    spotsLeft,
    filledPct: FOUNDING_CAP > 0 ? safeClaimed / FOUNDING_CAP : 0,
    deadline: FOUNDING_DEADLINE,
    isOpen: spotsLeft > 0 && now < deadlineMs,
  };
}

/**
 * A display-only "Scale" anchor tier shown on the pricing page above Pro. It is
 * NOT a billable plan (no PlanTier row) — it exists to anchor perceived value
 * (the decoy/contrast effect) and to capture genuine large-agency demand via a
 * sales conversation. The price band shown is a real starting point for custom
 * deals, not a checkout SKU.
 */
export type AnchorTier = {
  name: string;
  tagline: string;
  /** Display string, not a number — this tier is "from" / custom. */
  priceLabel: string;
  highlights: string[];
};

export const SCALE_ANCHOR: AnchorTier = {
  name: "Scale",
  tagline: "For multi-branch agencies & DMCs running at volume.",
  priceLabel: "Custom",
  highlights: [
    "Everything in Pro, plus:",
    "Unlimited seats across branches",
    "Dedicated onboarding & data migration",
    "A named success manager",
    "Priority roadmap input",
  ],
};

/** Convenience: the standard monthly price for a paid plan, for anchoring. */
export function standardMonthly(tier: "STARTER" | "PRO"): number {
  const def: PlanDef = PLANS[tier];
  return def.priceMonthly;
}
