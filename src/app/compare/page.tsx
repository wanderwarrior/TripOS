import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, siteUrl } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compare tripOS — travel agency software comparisons",
  description:
    "Compare tripOS with Sembark, helloGTX, CRMTravel, Tutterfly, Travefy, Tourwriter, Zoho and HubSpot — and see why it's the AI-first, all-in-one choice for Indian travel agencies.",
  alternates: { canonical: "/compare" },
};

// The comparison/alternative pages this hub links to. Adding a comparison page
// to seo-landings.ts? Add it here too so it joins the cluster.
const COMPARISONS: { href: string; title: string; blurb: string }[] = [
  {
    href: "/best-travel-agency-software-india",
    title: "Best travel agency software in India (2026)",
    blurb: "The buyer's guide — what to look for and how the options stack up.",
  },
  {
    href: "/sembark-alternative",
    title: "Sembark alternative",
    blurb: "The AI-first, all-in-one option for small and owner-led agencies.",
  },
  {
    href: "/hellogtx-alternative",
    title: "helloGTX alternative",
    blurb: "A simpler, modern, self-serve alternative to legacy travel CRM.",
  },
  {
    href: "/crmtravel-alternative",
    title: "CRMTravel alternative",
    blurb: "More than a CRM — itineraries, proposals, GST and payments in one.",
  },
  {
    href: "/tutterfly-alternative",
    title: "Tutterfly alternative",
    blurb: "All-in-one, India-native and proposal-led for growing agencies.",
  },
  {
    href: "/travefy-alternative-india",
    title: "Travefy alternative (India)",
    blurb: "India-native: GST invoicing, INR payments and WhatsApp built in.",
  },
  {
    href: "/tourwriter-alternative-india",
    title: "Tourwriter alternative (India)",
    blurb: "Simpler, AI-first and affordable — without enterprise setup.",
  },
  {
    href: "/zoho-crm-for-travel-agency-alternative",
    title: "Zoho / HubSpot alternative for travel",
    blurb: "Travel-native out of the box — no weeks of CRM configuration.",
  },
  {
    href: "/tripos-vs-sembark",
    title: "tripOS vs Sembark",
    blurb: "Head-to-head on AI, proposals, pricing and fit.",
  },
  {
    href: "/tripos-vs-hellogtx",
    title: "tripOS vs helloGTX",
    blurb: "Head-to-head on setup, UX, AI and pricing.",
  },
  {
    href: "/tripos-vs-travefy",
    title: "tripOS vs Travefy",
    blurb: "Head-to-head — and why India-native matters.",
  },
];

export default function ComparePage() {
  const base = siteUrl();
  return (
    <MarketingShell>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "tripOS travel agency software comparisons",
            itemListElement: COMPARISONS.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.title,
              url: `${base}${c.href}`,
            })),
          },
        ]}
      />
      <section className="mx-auto max-w-5xl px-5 md:px-10 pt-16 md:pt-24 pb-6 text-center">
        <p className="tc-eyebrow gold">Compare</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl text-ink leading-tight">
          How tripOS compares
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-ink/75">
          Weighing your options for travel agency software? Here&apos;s how tripOS
          stacks up against the tools Indian agencies actually consider — the
          AI-first, all-in-one platform built for how you sell, from ₹2,499/month.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-5 md:px-10 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {COMPARISONS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col rounded-xl border border-line bg-paper p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-[var(--gold-line)] hover:shadow-lift"
            >
              <h2 className="font-display text-xl text-ink">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
                {c.blurb}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-deep">
                Read comparison
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 md:px-10 pb-24 pt-6 text-center">
        <div className="rounded-2xl border border-[var(--gold-line)] bg-inkwash px-6 py-12 text-[var(--on-dark)] md:px-12">
          <h2 className="font-display text-3xl md:text-4xl">
            The simplest way to compare? Try it.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--on-dark)]/75">
            Run tripOS on your next real enquiry — build a proposal, raise a GST
            invoice — in about 10 minutes. Free for 14 days, no card required.
          </p>
          <div className="mt-7">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-[8px] bg-paper px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper-2"
            >
              Start your free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
