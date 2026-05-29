import Link from "next/link";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PLANS, PRICING_ORDER, TRIAL_DAYS, formatPlanPrice } from "@/lib/plans";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pricing · TripCraft",
  description:
    "Simple per-agency pricing for TripCraft — the all-in-one travel agency platform. Start with a 14-day free trial.",
};

const COMPARISON: { label: string; key: "starter" | "pro-only" }[] = [
  { label: "AI itineraries & proposals", key: "starter" },
  { label: "Quotes, bookings & GST invoices", key: "starter" },
  { label: "WhatsApp messaging", key: "starter" },
  { label: "Online payment collection", key: "starter" },
  { label: "Vendors, vouchers & operations", key: "starter" },
  { label: "Traveller profiles & passports", key: "starter" },
  { label: "Reports & analytics dashboard", key: "pro-only" },
  { label: "WhatsApp automations", key: "pro-only" },
  { label: "Priority support", key: "pro-only" },
];

const FAQ = [
  {
    q: "Do I need a credit card to start?",
    a: `No. Every new agency gets a ${TRIAL_DAYS}-day free trial with full access — no card required.`,
  },
  {
    q: "What counts as a 'seat'?",
    a: "A seat is one active team member you invite into your agency workspace. Starter includes 3, Pro includes 15.",
  },
  {
    q: "Is GST included in the price?",
    a: "Prices shown are exclusive of GST. A GST tax invoice is issued for your subscription.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes — upgrade or downgrade anytime. Changes apply from your next billing cycle.",
  },
  {
    q: "What happens when my trial ends?",
    a: "Your data stays safe. You keep core access and we'll prompt you to pick a plan to re-unlock Pro features and your full team.",
  },
];

export default async function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-5 md:px-10 pt-16 md:pt-20 pb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-sand-700">
          Pricing
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-6xl text-navy leading-tight">
          One price per agency. No surprises.
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-base text-ink/75">
          Start free for {TRIAL_DAYS} days. Pick a plan when you&apos;re ready —
          everything your team needs, billed simply.
        </p>
      </section>

      {/* Plan cards */}
      <section className="mx-auto max-w-5xl px-5 md:px-10 grid gap-5 md:grid-cols-2">
        {PRICING_ORDER.map((tier) => {
          const def = PLANS[tier];
          const featured = tier === "PRO";
          return (
            <div
              key={tier}
              className={
                "rounded-3xl border bg-white p-8 shadow-soft flex flex-col " +
                (featured ? "border-navy ring-1 ring-navy/15" : "border-line")
              }
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-3xl text-navy">{def.name}</h2>
                {featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ivory">
                    <Sparkles className="h-3 w-3" />
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {def.tagline}
              </p>
              <p className="mt-6">
                <span className="font-display text-5xl text-navy">
                  {formatPlanPrice(def.priceMonthly)}
                </span>
                <span className="text-sm text-muted-foreground"> / month</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or {formatPlanPrice(def.priceAnnual)} / year — two months free
              </p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {def.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-ink/85"
                  >
                    <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={
                  "mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors " +
                  (featured
                    ? "bg-navy text-ivory hover:bg-navy/90"
                    : "border border-line text-navy hover:border-navy/40")
                }
              >
                Start {TRIAL_DAYS}-day free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </section>

      {/* Comparison table */}
      <section className="mx-auto max-w-3xl px-5 md:px-10 py-20">
        <h2 className="font-display text-2xl text-navy text-center mb-8">
          What&apos;s included
        </h2>
        <div className="rounded-2xl border border-line bg-white overflow-hidden shadow-soft">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-line bg-ivory/60 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Feature</span>
            <span className="w-16 text-center">Starter</span>
            <span className="w-16 text-center">Pro</span>
          </div>
          {COMPARISON.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-line/60 last:border-0 items-center"
            >
              <span className="text-sm text-ink/85">{row.label}</span>
              <span className="w-16 flex justify-center">
                {row.key === "starter" ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/40" />
                )}
              </span>
              <span className="w-16 flex justify-center">
                <Check className="h-4 w-4 text-emerald-600" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 md:px-10 pb-24">
        <h2 className="font-display text-3xl text-navy text-center mb-10">
          Frequently asked
        </h2>
        <div className="space-y-4">
          {FAQ.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <p className="font-medium text-navy">{f.q}</p>
              <p className="mt-2 text-sm text-ink/75 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-ivory hover:bg-navy/90 transition-colors"
          >
            Start your free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
