import Link from "next/link";
import { ArrowRight, Compass, Heart, Sparkles, Target } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Reveal, Stagger, StaggerItem } from "@/components/marketing/motion-primitives";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/about" },
  title: "About",
  description:
    "tripOS is the operating system for Indian travel agencies — AI itineraries, branded proposals, GST invoicing, WhatsApp and payments in one platform, so you spend less time fighting tools and more time crafting trips.",
};

const VALUES = [
  {
    icon: Target,
    title: "Built for the work",
    body: "We obsess over the real, daily workflow of an agency — from the first WhatsApp enquiry to the final voucher — not a generic CRM bolted onto travel.",
  },
  {
    icon: Heart,
    title: "Make agencies look great",
    body: "Your proposals should feel like a luxury brand made them. Beautiful, branded output is a feature, not an afterthought.",
  },
  {
    icon: Sparkles,
    title: "Leverage, not busywork",
    body: "AI and automation should remove the grind — drafting itineraries, chasing payments — so your team sells more with less effort.",
  },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,169,106,0.1),transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center md:px-10 md:py-28">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-line)] bg-gold-soft px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-deep">
              <Compass className="h-3.5 w-3.5" />
              Our story
            </span>
            <h1 className="mt-6 font-display text-4xl text-ink md:text-6xl">
              Travel agencies deserve better tools
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/75">
              Most Indian agencies still run on a patchwork of spreadsheets,
              Word docs, Canva and WhatsApp. tripOS is the operating system that
              replaces all of it — turning an enquiry into a branded proposal, a
              paid booking and a GST invoice in one flow — so you can get back to
              what you do best: crafting unforgettable trips.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 md:px-10">
        <Reveal className="prose-tc space-y-5 text-ink/80">
          <h2 className="font-display text-2xl text-ink">Why we built it</h2>
          <p className="leading-relaxed">
            We watched talented travel consultants lose hours to formatting
            proposals, re-typing the same details into invoices, and hunting for
            a customer&apos;s last message across three apps. The craft was
            world-class; the tooling was holding them back.
          </p>
          <p className="leading-relaxed">
            So we built tripOS: AI itineraries, white-labelled proposals,
            WhatsApp, GST invoicing, online payments and operations — connected
            end to end. One flow, from the first enquiry to a paid, delivered
            trip.
          </p>
          <p className="leading-relaxed">
            We&apos;re a small, focused team building for agencies across India,
            shipping improvements every week based on what real operators tell
            us.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-line bg-paper-2">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-10">
          <Reveal className="mb-12 text-center">
            <p className="tc-eyebrow gold">What we believe</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">
              The principles behind the product
            </h2>
          </Reveal>
          <Stagger className="grid gap-5 md:grid-cols-3">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="h-full rounded-lg border border-line bg-paper p-6 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-gold-soft border border-[var(--gold-line)] text-gold-deep">
                    <v.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-xl text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/75">
                    {v.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center md:px-10">
        <Reveal>
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            Come build the future of travel with us
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink/75">
            Whether you&apos;re an agency ready to switch or just curious,
            we&apos;d love to hear from you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-[8px] bg-inkwash px-6 py-3 text-sm font-medium text-[var(--on-dark)] transition-colors hover:bg-inkwash/90"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-[8px] border border-line bg-paper px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-line-2"
            >
              Talk to us
            </Link>
          </div>
        </Reveal>
      </section>
    </MarketingShell>
  );
}
