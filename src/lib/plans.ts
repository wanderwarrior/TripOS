// SaaS plan catalogue for TripCraft itself — the tiers agencies subscribe
// to. Pure config (no server imports) so the pricing page, billing page and
// gating engine all read from one source of truth. Prices are in INR.

import type { PlanTier } from "@prisma/client";

export const TRIAL_DAYS = 14;

export type PlanFeatures = {
  /** Analytics dashboard (/reports). */
  reports: boolean;
  /** WhatsApp automation rules. */
  automations: boolean;
};

export type PlanDef = {
  tier: PlanTier;
  name: string;
  tagline: string;
  /** Monthly price in INR. 0 for trial. */
  priceMonthly: number;
  /** Annual price in INR (per year) — two months free vs monthly. */
  priceAnnual: number;
  /** Max active team members (seats). */
  seats: number;
  /** AI itinerary generations allowed per month. null = unlimited. */
  aiItinerariesPerMonth: number | null;
  features: PlanFeatures;
  highlights: string[];
};

export const PLANS: Record<PlanTier, PlanDef> = {
  TRIAL: {
    tier: "TRIAL",
    name: "Trial",
    tagline: "Full access while you explore.",
    priceMonthly: 0,
    priceAnnual: 0,
    seats: 15,
    aiItinerariesPerMonth: null,
    features: { reports: true, automations: true },
    highlights: [
      "Everything in Pro",
      `${TRIAL_DAYS} days, no card required`,
    ],
  },
  STARTER: {
    tier: "STARTER",
    name: "Starter",
    tagline: "For solo agents and small teams.",
    priceMonthly: 2499,
    priceAnnual: 24990,
    seats: 3,
    aiItinerariesPerMonth: 100,
    features: { reports: false, automations: false },
    highlights: [
      "Up to 3 team members",
      "100 AI itineraries / month",
      "Branded proposals & PDFs",
      "Quotes, bookings & GST invoices",
      "WhatsApp messaging",
      "Online payment collection",
    ],
  },
  PRO: {
    tier: "PRO",
    name: "Pro",
    tagline: "For growing agencies that run on data.",
    priceMonthly: 4999,
    priceAnnual: 49990,
    seats: 15,
    aiItinerariesPerMonth: null,
    features: { reports: true, automations: true },
    highlights: [
      "Up to 15 team members",
      "Everything in Starter, plus:",
      "Unlimited AI itineraries",
      "Reports & analytics dashboard",
      "WhatsApp automations",
      "Priority support",
    ],
  },
};

/** Tiers an agency can actually pay for (excludes TRIAL). */
export const PAID_PLANS: PlanTier[] = ["STARTER", "PRO"];

/** Plans shown on the public pricing page, in display order. */
export const PRICING_ORDER: PlanTier[] = ["STARTER", "PRO"];

export function formatPlanPrice(rupees: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
