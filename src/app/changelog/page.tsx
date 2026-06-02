import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Reveal } from "@/components/marketing/motion-primitives";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Changelog",
  description:
    "What's new in TripCraft — the latest features and improvements shipped for travel agencies.",
};

type Release = {
  date: string;
  version: string;
  tag?: "New" | "Improved" | "Fixed";
  title: string;
  items: string[];
};

// Replace with your real release notes as you ship.
const RELEASES: Release[] = [
  {
    date: "May 2026",
    version: "2.0",
    tag: "New",
    title: "A bolder new look & a richer landing experience",
    items: [
      "Refreshed proposal PDF design with a merged cover + overview hero.",
      "Trip-level inclusions & exclusions you can fill once for the whole trip.",
      "Bigger, uncropped agency logos across proposals.",
      "Floating save on the itinerary editor so it's always within reach.",
    ],
  },
  {
    date: "April 2026",
    version: "1.6",
    tag: "Improved",
    title: "Sharing & invoicing hardening",
    items: [
      "Share links now always open the public proposal — never a sign-in wall.",
      "Invoice actions (issue, cancel) are correctly gated by role.",
      "Cleaner proposal cover without the stray background circle.",
    ],
  },
  {
    date: "March 2026",
    version: "1.5",
    tag: "New",
    title: "WhatsApp automations & payment reminders",
    items: [
      "Automated payment reminders over WhatsApp at configurable stages.",
      "Template editor for proposals, invoices and nudges.",
      "Auto-reconciliation of payment links against bookings.",
    ],
  },
];

const TAG_STYLES: Record<NonNullable<Release["tag"]>, string> = {
  New: "bg-gold-soft text-gold-deep border-[var(--gold-line)]",
  Improved: "bg-info-soft text-info border-info/30",
  Fixed: "bg-ok-soft text-ok border-ok/30",
};

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,169,106,0.1),transparent_55%)]" />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center md:px-10 md:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-line)] bg-gold-soft px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-deep">
              <Sparkles className="h-3.5 w-3.5" />
              Changelog
            </span>
            <h1 className="mt-6 font-display text-4xl text-ink md:text-5xl">
              What&apos;s new in TripCraft
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-ink/75">
              We ship improvements every week. Here&apos;s the latest.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 md:px-10">
        <div className="space-y-12">
          {RELEASES.map((r) => (
            <Reveal key={r.version}>
              <article className="border-l-2 border-line pl-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm tabular-nums text-gold-deep">
                    v{r.version}
                  </span>
                  <span className="text-xs text-muted">{r.date}</span>
                  {r.tag ? (
                    <span
                      className={
                        "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide " +
                        TAG_STYLES[r.tag]
                      }
                    >
                      {r.tag}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-2 font-display text-2xl text-ink">{r.title}</h2>
                <ul className="mt-4 space-y-2">
                  {r.items.map((it, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-ink/80"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold-line)]" />
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-[8px] bg-inkwash px-6 py-3 text-sm font-medium text-[var(--on-dark)] transition-colors hover:bg-inkwash/90"
          >
            Try the latest — start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </MarketingShell>
  );
}
