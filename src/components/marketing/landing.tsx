import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Check,
  Clock,
  CreditCard,
  FileText,
  Globe,
  MessageCircle,
  Minus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { PLANS, PRICING_ORDER, TRIAL_DAYS, formatPlanPrice } from "@/lib/plans";
import {
  FOUNDING_DISCOUNT_PCT,
  FOUNDING_PRICES,
  SCALE_ANCHOR,
  standardMonthly,
  type FoundingStatus,
} from "@/lib/founding";
import { getFoundingStatus } from "@/server/services/founding";
import { Hero } from "@/components/marketing/hero";
import { FoundingOffer } from "@/components/marketing/founding-offer";
import { StickyCta } from "@/components/marketing/sticky-cta";
import { LeadCapture } from "@/components/marketing/lead-capture";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Faq } from "@/components/marketing/faq";
import { PlatformShowcase } from "@/components/marketing/platform-showcase";
import {
  Frame,
  MockCapture,
  MockPlan,
  MockPropose,
  MockBook,
  MockOperate,
  MockGrow,
} from "@/components/marketing/product-mockups";
import { RequestDemoDialog } from "@/components/marketing/request-demo-dialog";
import { Testimonials, QUOTES } from "@/components/marketing/testimonials";
import {
  CountUp,
  MockReveal,
  Reveal,
  ScrollProgress,
  Stagger,
  StaggerItem,
} from "@/components/marketing/motion-primitives";

export async function Landing({
  isAuthed = false,
  heroVideoUrl,
  heroPosterUrl,
}: {
  isAuthed?: boolean;
  heroVideoUrl?: string | null;
  heroPosterUrl?: string | null;
}) {
  const founding = await getFoundingStatus();
  return (
    <>
      <ScrollProgress />
      <Hero
        isAuthed={isAuthed}
        videoUrl={heroVideoUrl}
        posterUrl={heroPosterUrl}
      />
      {/* Narrative: hook → the whole platform at a glance (second fold) →
          credibility → agitate the problem → show the solution (overview →
          breadth → depth) → prove it → de-risk → convert. */}
      <PlatformShowcase />
      <CompetitorComparison />
      <TrustBar />
      <ProblemSection />
      <Features />
      <HowItWorks />
      <FeatureShowcase />
      <StatsBand />
      <SocialProof />
      <FounderNote />
      <Comparison />
      <Integrations />
      <UrgencyBanner status={founding} />
      <PricingTeaser status={founding} />
      <FaqSection />
      <ClosingCta />
      {!isAuthed && (
        <>
          <StickyCta spotsLeft={founding.spotsLeft} isOpen={founding.isOpen} />
          <LeadCapture />
        </>
      )}
    </>
  );
}

// --- trust bar ------------------------------------------------------------

const TRUST_SIGNALS = [
  { icon: ShieldCheck, label: "GST-compliant invoicing" },
  { icon: MessageCircle, label: "Official WhatsApp Cloud API" },
  { icon: CreditCard, label: "INR pricing & payments" },
  { icon: Zap, label: "Set up in minutes" },
];

function TrustBar() {
  return (
    <section className="border-y border-line bg-paper-2">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10">
        <p className="text-center text-sm font-medium text-ink/80">
          Built for how Indian travel agencies actually sell
        </p>
        <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-y-5 sm:grid-cols-4 sm:divide-x sm:divide-line">
          {TRUST_SIGNALS.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-center gap-2 px-4 text-center text-xs text-muted"
            >
              <s.icon className="h-4 w-4 shrink-0 text-ok" />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- stats band -----------------------------------------------------------

// Honest, verifiable claims — capability + pricing, not fabricated adoption.
const STATS = [
  { to: 10, suffix: " min", label: "From enquiry to a sent proposal", icon: Clock },
  { to: 100, suffix: "%", label: "GST-compliant tax invoices", icon: ShieldCheck },
  { to: 2499, prefix: "₹", suffix: "/mo", label: "Simple per-agency pricing", icon: TrendingUp },
  { to: 14, suffix: "-day", label: "Free trial — no card required", icon: Sparkles },
];

function StatsBand() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-10 py-16">
      <Stagger className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {STATS.map((s) => (
          <StaggerItem key={s.label} className="text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold-soft border border-[var(--gold-line)] text-gold-deep">
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-4xl text-ink md:text-5xl">
              <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// --- problem / agitation --------------------------------------------------

const PAINS = [
  "Proposals that take half a day to build in Word — and still look generic.",
  "Leads slipping through the cracks across WhatsApp, notebooks and memory.",
  "Chasing payments manually and dreading GST invoice season.",
  "No idea which agent, source or month actually makes you money.",
];

function ProblemSection() {
  return (
    <section className="mx-auto max-w-5xl px-5 md:px-10 py-20">
      <Reveal className="text-center mb-10">
        <p className="tc-eyebrow gold">The hard truth</p>
        <h2 className="mt-3 font-display text-3xl md:text-5xl text-ink leading-tight">
          Your competitors are closing faster.
          <br className="hidden md:block" /> Are you still on spreadsheets?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-ink/70">
          Every hour spent fighting tools is an hour not spent selling. The
          agencies winning today look more professional, reply faster, and never
          lose a lead. Here&apos;s what&apos;s quietly costing you bookings:
        </p>
      </Reveal>
      <Stagger className="grid gap-4 sm:grid-cols-2">
        {PAINS.map((p) => (
          <StaggerItem key={p}>
            <div className="flex items-start gap-3 rounded-lg border border-line bg-paper p-5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <X className="h-4 w-4" />
              </span>
              <p className="text-sm text-ink/80 leading-relaxed">{p}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
      <Reveal className="mt-8 text-center" delay={0.1}>
        <p className="text-sm text-ink/70">
          tripOS replaces all of it with{" "}
          <span className="font-semibold text-ink">one flow</span> — and your
          customers feel the difference on the very first proposal.
        </p>
      </Reveal>
    </section>
  );
}

// --- features -------------------------------------------------------------

const FEATURES = [
  {
    icon: Wand2,
    title: "AI itineraries",
    body: "Type a brief or a few details — get a polished, day-by-day itinerary you can shape, in seconds.",
  },
  {
    icon: FileText,
    title: "Branded proposals & PDFs",
    body: "White-labelled proposals with your logo, themes and customer-safe pricing. Share a link or a real PDF.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp built in",
    body: "Send proposals, invoices and reminders over WhatsApp Cloud API — with templates and automations.",
  },
  {
    icon: CreditCard,
    title: "Quotes, invoices & payments",
    body: "Build quotes, issue GST-compliant invoices, and collect payments online with auto-reconciliation.",
  },
  {
    icon: Building2,
    title: "Operations & vendors",
    body: "Assign vendors, generate vouchers, track confirmations and tasks — your whole back office, organised.",
  },
  {
    icon: BarChart3,
    title: "Reports & analytics",
    body: "Conversion funnel, revenue trend, margins, agent performance and lead-source ROI at a glance.",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 md:px-10 py-24 md:py-28">
      <Reveal className="text-center mb-12">
        <p className="tc-eyebrow gold">Everything in one place</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl text-ink">
          Built for how agencies actually work
        </h2>
      </Reveal>
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <StaggerItem key={f.title}>
            <div className="group h-full rounded-lg border border-line bg-paper p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold-line)] hover:shadow-lift">
              <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-paper-2 border border-line text-gold-deep transition-colors group-hover:bg-gold-soft group-hover:border-[var(--gold-line)]">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink/75 leading-relaxed">{f.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// --- deep-dive feature showcase -------------------------------------------

function FeatureShowcase() {
  const blocks = [
    {
      eyebrow: "CRM & pipeline",
      title: "Capture every enquiry — and convert more of them",
      points: [
        "Every lead from Instagram, WhatsApp, referrals and your site — one pipeline.",
        "Move leads new → quoted → won, and assign them to agents.",
        "Customer profiles, trip history and follow-ups in one place.",
      ],
      mock: (
        <Frame label="CRM">
          <MockCapture />
        </Frame>
      ),
    },
    {
      eyebrow: "AI itineraries",
      title: "From a one-line brief to a day-by-day masterpiece",
      points: [
        "Describe the trip in plain language — AI drafts the full itinerary.",
        "Edit any day, swap hotels, add activities — you stay in control.",
        "Regenerate the prose while keeping your structured facts intact.",
      ],
      mock: (
        <Frame label="Plan">
          <MockPlan />
        </Frame>
      ),
      flip: true,
    },
    {
      eyebrow: "Branded proposals",
      title: "Proposals so good, clients reply before they read the price",
      points: [
        "Your logo, colours and themes — fully white-labelled.",
        "Customer-safe pricing: cost, markup and margin never leak.",
        "Share a live link or a pixel-perfect PDF in one tap.",
      ],
      mock: (
        <Frame label="Propose">
          <MockPropose />
        </Frame>
      ),
    },
    {
      eyebrow: "Bookings, payments & GST",
      title: "Book, get paid, and invoice — without leaving the flow",
      points: [
        "Turn an accepted quote into a booking in one click.",
        "Collect deposits and balances via Indian payment gateways.",
        "Issue GST-compliant tax invoices automatically.",
      ],
      mock: (
        <Frame label="Book">
          <MockBook />
        </Frame>
      ),
      flip: true,
    },
    {
      eyebrow: "Operations",
      title: "Run every trip end to end",
      points: [
        "Assign vendors and track confirmations.",
        "Generate vouchers and travel docs for travellers.",
        "An operations checklist so nothing slips before departure.",
      ],
      mock: (
        <Frame label="Operate">
          <MockOperate />
        </Frame>
      ),
    },
    {
      eyebrow: "Analytics & automations",
      title: "Finally know what's actually making you money",
      points: [
        "Conversion funnel from enquiry to paid booking.",
        "Margins and ROI by agent and lead source.",
        "WhatsApp automations that follow up and recover payments.",
      ],
      mock: (
        <Frame label="Grow">
          <MockGrow />
        </Frame>
      ),
      flip: true,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-10 py-24 md:py-28 space-y-24">
      {blocks.map((b) => (
        <div
          key={b.eyebrow}
          className="grid items-center gap-10 md:grid-cols-2 md:gap-16"
        >
          <Reveal className={b.flip ? "md:order-2" : ""}>
            <p className="tc-eyebrow gold">{b.eyebrow}</p>
            <h3 className="mt-3 font-display text-3xl md:text-4xl text-ink leading-tight">
              {b.title}
            </h3>
            <ul className="mt-6 space-y-3">
              {b.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-ink/80">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-ok" />
                  <span className="text-sm leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <MockReveal
            from={b.flip ? "left" : "right"}
            className={b.flip ? "md:order-1" : ""}
          >
            {b.mock}
          </MockReveal>
        </div>
      ))}
    </section>
  );
}

// --- social proof (testimonials) ------------------------------------------

function SocialProof() {
  // Only render once there are REAL testimonials — never fabricated proof.
  if (QUOTES.length === 0) return null;
  return (
    <section className="bg-paper-2 py-24 md:py-28">
      <Reveal className="mx-auto max-w-3xl px-5 text-center md:px-10">
        <p className="tc-eyebrow gold">Loved by agencies</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl text-ink">
          The switch they wish they&apos;d made sooner
        </h2>
        <p className="mt-3 text-sm text-muted">
          Real outcomes from agencies who stopped fighting their tools.
        </p>
      </Reveal>
      <div className="mt-12">
        <Testimonials />
      </div>
    </section>
  );
}

// Honest, human trust signal that doesn't depend on (non-existent) customer
// counts. Personalise: swap in the founder's name + photo when ready.
function FounderNote() {
  return (
    <section className="mx-auto max-w-3xl px-5 md:px-10 py-20">
      <Reveal>
        <div className="rounded-2xl border border-line bg-paper p-8 text-center shadow-soft md:p-10">
          <p className="tc-eyebrow gold">Why we built tripOS</p>
          <p className="mt-5 font-display text-2xl leading-snug text-ink md:text-3xl">
            &ldquo;We watched brilliant travel agents lose hours — and bookings —
            to spreadsheets, Word proposals and scattered WhatsApp chats. tripOS
            is the tool we wished they had: one place to turn an enquiry into a
            branded proposal, a paid booking and a GST invoice.&rdquo;
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-inkwash text-sm font-semibold text-[var(--on-dark)]">
              tO
            </span>
            <div className="text-left">
              <p className="text-sm font-medium text-ink">The tripOS team</p>
              <p className="text-xs text-muted">
                Building for Indian travel agencies
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// --- comparison -----------------------------------------------------------

const COMPARE_ROWS: { label: string; sheets: boolean; crm: boolean; tc: boolean }[] = [
  { label: "AI-generated itineraries", sheets: false, crm: false, tc: true },
  { label: "Branded, white-labelled proposals", sheets: false, crm: false, tc: true },
  { label: "WhatsApp Cloud API built in", sheets: false, crm: false, tc: true },
  { label: "GST-compliant tax invoices", sheets: false, crm: false, tc: true },
  { label: "Online payments + auto-reconciliation", sheets: false, crm: true, tc: true },
  { label: "Vendor ops & vouchers", sheets: false, crm: false, tc: true },
  { label: "Pipeline, reports & agent ROI", sheets: false, crm: true, tc: true },
  { label: "Made for Indian travel agencies", sheets: false, crm: false, tc: true },
];

function Cell({ on }: { on: boolean }) {
  return (
    <td className="px-4 py-3 text-center">
      {on ? (
        <Check className="mx-auto h-5 w-5 text-ok" />
      ) : (
        <Minus className="mx-auto h-4 w-4 text-muted/50" />
      )}
    </td>
  );
}

function Comparison() {
  return (
    <section className="mx-auto max-w-5xl px-5 md:px-10 py-24 md:py-28">
      <Reveal className="text-center mb-12">
        <p className="tc-eyebrow gold">Why switch</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl text-ink">
          One platform vs. the patchwork
        </h2>
      </Reveal>
      <Reveal className="overflow-hidden rounded-xl border border-line bg-paper shadow-soft">
        {/* Horizontal scroll on phones so the 4-column table never crushes —
            the bordered card clips the corners, the inner track scrolls. */}
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-2">
              <th className="px-4 py-4 text-left font-medium text-ink">
                Capability
              </th>
              <th className="px-4 py-4 text-center font-medium text-muted">
                Spreadsheets + WhatsApp
              </th>
              <th className="px-4 py-4 text-center font-medium text-muted">
                Generic CRM
              </th>
              <th className="px-4 py-4 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft border border-[var(--gold-line)] px-3 py-1 font-semibold text-gold-deep">
                  <Sparkles className="h-3.5 w-3.5" /> tripOS
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((r) => (
              <tr key={r.label} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-ink/85">{r.label}</td>
                <Cell on={r.sheets} />
                <Cell on={r.crm} />
                <td className="bg-gold-soft/40 px-4 py-3 text-center">
                  <Check className="mx-auto h-5 w-5 text-ok" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Reveal>
    </section>
  );
}

// --- competitor comparison -------------------------------------------------

// Honest, defensible competitor matrix. tripOS leads every row, but competitors
// are NOT marked as lacking features they actually have — "limited" (Minus) is
// used where an incumbent's capability is weaker/less integrated for our ICP,
// and honest "full" (Check) where they genuinely match (e.g. Sembark/helloGTX
// are also India-built). Edit marks here if a competitor's real capability
// differs — false claims about named competitors are legally risky in India
// (ASCI code) and erode trust.
const COMPARE_COLS = [
  "tripOS",
  "Sembark",
  "helloGTX",
  "Travefy",
  "Zoho / HubSpot",
] as const;

type Mark = "y" | "p" | "n";

const COMPETITOR_ROWS: { label: string; marks: Mark[] }[] = [
  { label: "AI-generated itineraries", marks: ["y", "p", "p", "p", "n"] },
  { label: "Enquiry → proposal → booking → GST invoice, in one flow", marks: ["y", "p", "p", "n", "n"] },
  { label: "Built for India (GST-compliant invoicing + INR)", marks: ["y", "y", "y", "n", "p"] },
  { label: "WhatsApp messaging built in", marks: ["y", "p", "p", "n", "p"] },
  { label: "Premium, white-labelled proposals", marks: ["y", "p", "p", "y", "n"] },
  { label: "Self-serve setup + free trial, no sales cycle", marks: ["y", "n", "n", "y", "y"] },
  { label: "Transparent pricing from ₹2,499/mo", marks: ["y", "p", "p", "p", "y"] },
  { label: "Made for small, owner-led agencies", marks: ["y", "p", "n", "y", "p"] },
];

function MarkCell({ m, highlight }: { m: Mark; highlight?: boolean }) {
  return (
    <td className={"px-3 py-4 text-center " + (highlight ? "bg-gold-soft/50" : "")}>
      {m === "y" ? (
        <span
          className={
            "mx-auto flex items-center justify-center " +
            (highlight ? "h-7 w-7 rounded-full bg-gold-soft" : "")
          }
        >
          <Check className={"text-ok " + (highlight ? "h-4 w-4" : "h-5 w-5")} />
        </span>
      ) : m === "p" ? (
        <Minus className="mx-auto h-4 w-4 text-muted/70" />
      ) : (
        <X className="mx-auto h-4 w-4 text-muted/30" />
      )}
    </td>
  );
}

function CompetitorComparison() {
  return (
    <section className="mx-auto max-w-5xl px-5 md:px-10 py-20 md:py-24">
      <Reveal className="text-center mb-10">
        <p className="tc-eyebrow gold">How we compare</p>
        <h2 className="mt-3 font-display text-3xl md:text-5xl text-ink">
          tripOS vs the other travel tools
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-muted">
          One AI-first, all-in-one platform built for Indian agencies — versus
          point tools, legacy software and generic CRMs.
        </p>
      </Reveal>
      <Reveal className="overflow-hidden rounded-2xl border border-[var(--gold-line)] bg-paper shadow-lift">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-2">
                <th className="px-4 py-5 text-left font-medium text-muted">
                  Capability
                </th>
                {COMPARE_COLS.map((c) =>
                  c === "tripOS" ? (
                    <th key={c} className="bg-gold-soft px-3 py-4 text-center align-top">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold-line)] bg-paper px-3 py-1 font-semibold text-gold-deep shadow-soft">
                        <Sparkles className="h-3.5 w-3.5" /> tripOS
                      </span>
                      <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-gold-deep/80">
                        Most complete
                      </span>
                    </th>
                  ) : (
                    <th key={c} className="px-3 py-5 text-center font-medium text-ink/55">
                      {c}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {COMPETITOR_ROWS.map((r) => (
                <tr
                  key={r.label}
                  className="border-b border-line last:border-0 transition-colors hover:bg-paper-2/60"
                >
                  <td className="px-4 py-4 text-ink/85">{r.label}</td>
                  {r.marks.map((m, i) => (
                    <MarkCell key={i} m={m} highlight={i === 0} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Check className="h-3.5 w-3.5 text-ok" /> Full
        </span>
        <span className="inline-flex items-center gap-1">
          <Minus className="h-3 w-3" /> Limited / partial
        </span>
        <span className="inline-flex items-center gap-1">
          <X className="h-3 w-3 text-muted/40" /> Not built for it
        </span>
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-[8px] bg-inkwash px-6 py-3 text-sm font-medium text-[var(--on-dark)] transition-colors hover:bg-inkwash/90"
        >
          See why agencies switch — start free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mx-auto mt-5 max-w-2xl text-center text-[11px] leading-relaxed text-muted/80">
        Comparison reflects tripOS&apos;s assessment for small, owner-led travel
        agencies; competitor products evolve, so please verify current details on
        their own websites. All product names are trademarks of their respective
        owners.
      </p>
    </section>
  );
}

// --- integrations ---------------------------------------------------------

const INTEGRATIONS = [
  { icon: MessageCircle, label: "WhatsApp Cloud API" },
  { icon: CreditCard, label: "Razorpay & Stripe" },
  { icon: FileText, label: "GST tax invoicing" },
  { icon: Calendar, label: "Itinerary & vouchers" },
  { icon: Globe, label: "Custom domains" },
  { icon: Users, label: "Team roles & access" },
];

function Integrations() {
  return (
    <section className="border-y border-line bg-paper-2 py-16">
      <Reveal className="mx-auto max-w-6xl px-5 text-center md:px-10">
        <p className="tc-eyebrow gold">Works with your stack</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl text-ink">
          Everything connected, nothing to wire up
        </h2>
      </Reveal>
      <Stagger className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 px-5 sm:grid-cols-3 md:px-10 lg:grid-cols-6">
        {INTEGRATIONS.map((it) => (
          <StaggerItem key={it.label}>
            <div className="flex h-full flex-col items-center gap-2 rounded-lg border border-line bg-paper p-5 text-center">
              <it.icon className="h-6 w-6 text-gold-deep" />
              <span className="text-xs font-medium text-ink/80">{it.label}</span>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// --- urgency / FOMO banner ------------------------------------------------

function UrgencyBanner({ status }: { status: FoundingStatus }) {
  return (
    <section className="mx-auto max-w-5xl px-5 md:px-10 pt-24 md:pt-28">
      <Reveal>
        <FoundingOffer status={status} />
      </Reveal>
    </section>
  );
}

// --- pricing teaser -------------------------------------------------------

function PricingTeaser({ status }: { status: FoundingStatus }) {
  const founding = status.isOpen;
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 md:px-10 py-24 md:py-28">
      <Reveal className="text-center mb-12">
        <p className="tc-eyebrow gold">Simple pricing</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl text-ink">
          Plans that grow with you
        </h2>
        <p className="mt-3 text-sm text-muted">
          Start free for {TRIAL_DAYS} days. No card required.{" "}
          {founding ? (
            <span className="text-ink">
              Founding {FOUNDING_DISCOUNT_PCT}% off is locked for life —{" "}
              <span className="font-mono tabular-nums">{status.spotsLeft}</span>{" "}
              of {status.cap} spots left.
            </span>
          ) : (
            "Upgrade or cancel anytime."
          )}
        </p>
      </Reveal>
      <Stagger className="grid gap-5 md:grid-cols-3">
        {PRICING_ORDER.map((tier) => {
          const def = PLANS[tier];
          const featured = tier === "PRO";
          const standard = standardMonthly(tier as "STARTER" | "PRO");
          const foundingPrice = FOUNDING_PRICES[tier as "STARTER" | "PRO"];
          return (
            <StaggerItem key={tier} className="h-full">
              <div
                className={
                  "h-full rounded-lg border bg-paper p-6 shadow-soft flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lift " +
                  (featured
                    ? "border-[var(--gold-line)] ring-1 ring-[var(--gold-line)]/40"
                    : "border-line hover:border-[var(--gold-line)]")
                }
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl text-ink">{def.name}</h3>
                  {featured && (
                    <span className="inline-flex items-center gap-1 rounded-[6px] bg-gold-soft border border-[var(--gold-line)] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-gold-deep">
                      <Sparkles className="h-3 w-3" />
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{def.tagline}</p>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-4xl text-ink font-mono tabular-nums">
                    {formatPlanPrice(founding ? foundingPrice : standard)}
                  </span>
                  <span className="text-sm text-muted"> / month</span>
                </p>
                {founding && (
                  <p className="mt-1 text-xs text-muted">
                    <span className="font-mono tabular-nums line-through">
                      {formatPlanPrice(standard)}
                    </span>{" "}
                    standard ·{" "}
                    <span className="font-medium text-gold-deep">
                      locked for life
                    </span>
                  </p>
                )}
                <ul className="mt-5 space-y-2 flex-1">
                  {def.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-ink/85"
                    >
                      <Check className="h-4 w-4 text-ok mt-0.5 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={
                    "mt-6 inline-flex items-center justify-center gap-2 rounded-[8px] px-5 py-2.5 text-sm font-medium transition-colors " +
                    (featured
                      ? "bg-inkwash text-[var(--on-dark)] hover:bg-inkwash/90"
                      : "border border-line text-ink hover:border-line-2")
                  }
                >
                  {founding ? "Claim founding price" : "Start free trial"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </StaggerItem>
          );
        })}

        {/* Scale — a display-only anchor tier (decoy/contrast effect). Not a
            billable plan; routes to a sales conversation for custom deals. */}
        <StaggerItem className="h-full">
          <div className="h-full rounded-lg border border-line bg-paper p-6 shadow-soft flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold-line)] hover:shadow-lift">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl text-ink">
                {SCALE_ANCHOR.name}
              </h3>
            </div>
            <p className="mt-1 text-sm text-muted">{SCALE_ANCHOR.tagline}</p>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl text-ink">
                {SCALE_ANCHOR.priceLabel}
              </span>
            </p>
            <ul className="mt-5 space-y-2 flex-1">
              {SCALE_ANCHOR.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-ink/85"
                >
                  <Check className="h-4 w-4 text-ok mt-0.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-[8px] border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-2"
            >
              Talk to us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </StaggerItem>
      </Stagger>
      <p className="mt-6 text-center text-sm">
        <Link href="/pricing" className="text-ink underline">
          Compare plans in detail
        </Link>
      </p>
    </section>
  );
}

// --- FAQ ------------------------------------------------------------------

function FaqSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-10 pb-24">
      <Reveal className="text-center mb-12">
        <p className="tc-eyebrow gold">Questions, answered</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl text-ink">
          Everything you need to know
        </h2>
      </Reveal>
      <Reveal delay={0.05}>
        <Faq />
      </Reveal>
    </section>
  );
}

// --- closing CTA ----------------------------------------------------------

function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-10 pb-24">
      <Reveal>
        <div className="rounded-lg bg-inkwash text-[var(--on-dark)] px-8 py-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,106,0.18),transparent_60%)]" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-5xl">
              Ready to craft better trips?
            </h2>
            <p className="mt-4 text-[var(--on-dark)]/75 max-w-xl mx-auto">
              Join the agencies running their entire business on tripOS. Request
              your free {TRIAL_DAYS}-day trial — we approve new agencies within a
              few hours, and founding pricing is still open.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-[8px] bg-paper px-6 py-3 text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
              >
                Request your free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <RequestDemoDialog
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-[8px] border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    Get a free demo
                  </button>
                }
              />
            </div>
            <p className="mt-4 text-xs text-[var(--on-dark)]/55">
              No card required · Set up in minutes · Cancel anytime
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
