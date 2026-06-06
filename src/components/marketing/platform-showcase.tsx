"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  CreditCard,
  FileText,
  Sparkles,
  Users,
  Wand2,
  type LucideIcon,
} from "lucide-react";

// Interactive "one platform, end to end" showcase — the landing's second fold.
// A lifecycle of stages auto-advances (pause on hover, click to jump), each
// revealing a rendered product mockup so prospects grasp the full breadth fast.

type StageKey =
  | "capture"
  | "plan"
  | "propose"
  | "book"
  | "operate"
  | "grow";

type Stage = {
  key: StageKey;
  label: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  bullets: string[];
};

const STAGES: Stage[] = [
  {
    key: "capture",
    label: "Capture",
    icon: Users,
    title: "Capture every lead in one CRM",
    desc: "Enquiries from Instagram, WhatsApp, referrals and your website — all in one pipeline, tracked to ₹.",
    bullets: ["Lead pipeline & kanban", "Customer profiles & history", "Per-agent assignment"],
  },
  {
    key: "plan",
    label: "Plan",
    icon: Wand2,
    title: "Generate itineraries with AI",
    desc: "Type a brief, get a vivid day-by-day plan in seconds — then edit, swap hotels and add experiences.",
    bullets: ["AI day-by-day itineraries", "Hotels, activities & segments", "Edit or regenerate any day"],
  },
  {
    key: "propose",
    label: "Propose",
    icon: FileText,
    title: "Send branded proposals that win",
    desc: "White-labelled, client-safe proposals as a live link or PDF — your brand on show, your margin hidden.",
    bullets: ["White-label proposals & PDFs", "Send on WhatsApp, track opens", "Clients accept online"],
  },
  {
    key: "book",
    label: "Book & get paid",
    icon: CreditCard,
    title: "Book, collect payments, invoice",
    desc: "Turn an accepted quote into a booking, collect online, and issue a GST-compliant invoice in a click.",
    bullets: ["Quotes → bookings", "Online payment links", "GST-compliant invoices"],
  },
  {
    key: "operate",
    label: "Operate",
    icon: Boxes,
    title: "Run operations end to end",
    desc: "Assign vendors, confirm services, generate vouchers and track every task right up to departure.",
    bullets: ["Vendors & confirmations", "Vouchers & travel docs", "Operations checklist"],
  },
  {
    key: "grow",
    label: "Grow",
    icon: BarChart3,
    title: "See exactly what makes you money",
    desc: "Reports on your funnel, margins and ROI by agent and source — plus WhatsApp automations that follow up for you.",
    bullets: ["Funnel & margin reports", "Agent & source ROI", "WhatsApp automations"],
  },
];

const ROTATE_MS = 5000;

export function PlatformShowcase() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduce) return;
    const t = setInterval(
      () => setActive((a) => (a + 1) % STAGES.length),
      ROTATE_MS
    );
    return () => clearInterval(t);
  }, [paused, reduce]);

  const s = STAGES[active];

  return (
    <section
      className="relative overflow-hidden border-y border-line bg-paper-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* soft gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(200,169,106,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="tc-eyebrow gold inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            One platform, end to end
          </p>
          <h2 className="mt-3 font-display text-3xl text-ink md:text-5xl">
            The whole agency, from enquiry to repeat client
          </h2>
          <p className="mt-3 text-muted md:text-lg">
            Every tool you juggle today — replaced by one connected workflow.
            Follow a trip through tripOS:
          </p>
        </div>

        {/* Stepper */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const on = i === active;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => setActive(i)}
                className={
                  "group relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-3.5 py-2 text-sm font-medium transition-all " +
                  (on
                    ? "border-[var(--gold-line)] bg-inkwash text-[var(--on-dark)]"
                    : "border-line bg-paper text-muted hover:text-ink hover:border-line-2")
                }
              >
                <Icon
                  className={
                    "h-4 w-4 " + (on ? "text-gold" : "text-gold-deep/70")
                  }
                />
                {stage.label}
                {on && !reduce && !paused ? (
                  <motion.span
                    key={active}
                    className="absolute bottom-0 left-0 h-0.5 bg-gold"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="mt-10 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${s.key}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="order-2 lg:order-1"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--gold-line)] bg-gold-soft text-gold-deep">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-2xl text-ink md:text-3xl">
                {s.title}
              </h3>
              <p className="mt-2.5 text-ink/75 leading-relaxed">{s.desc}</p>
              <ul className="mt-5 space-y-2.5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-[15px] text-ink/80">
                    <Check className="h-4 w-4 shrink-0 text-[var(--ok)]" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              key={`mock-${s.key}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="order-1 lg:order-2"
            >
              <Frame label={s.label}>
                <Mock stage={s.key} />
              </Frame>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-[10px] bg-inkwash px-6 py-3 text-sm font-medium text-[var(--on-dark)] transition-colors hover:bg-inkwash/90"
          >
            Start your free trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/#features"
            className="inline-flex items-center gap-2 rounded-[10px] border border-line bg-paper px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper-2"
          >
            See every feature
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- product mockup frame ---------------------------------------------------

function Frame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-lift">
      <div className="flex items-center gap-1.5 border-b border-line bg-paper-2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e06c60]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e9b44c]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#5bbf7b]" />
        <span className="ml-2 text-[11px] font-medium text-muted">
          {label} · tripOS
        </span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Mock({ stage }: { stage: StageKey }) {
  switch (stage) {
    case "capture":
      return <MockCapture />;
    case "plan":
      return <MockPlan />;
    case "propose":
      return <MockPropose />;
    case "book":
      return <MockBook />;
    case "operate":
      return <MockOperate />;
    case "grow":
      return <MockGrow />;
  }
}

function LeadCard({ name, trip }: { name: string; trip: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper px-2.5 py-2 shadow-soft">
      <p className="text-[12px] font-medium text-ink leading-tight">{name}</p>
      <p className="text-[10px] text-muted">{trip}</p>
    </div>
  );
}

function MockCapture() {
  const cols: { h: string; tone: string; cards: [string, string][] }[] = [
    { h: "New", tone: "text-muted", cards: [["Aarav S.", "Bali · honeymoon"], ["Meera K.", "Dubai · family"]] },
    { h: "Quoted", tone: "text-gold-deep", cards: [["Tara M.", "Japan · 2 pax"]] },
    { h: "Won", tone: "text-[var(--ok)]", cards: [["Rohit K.", "Goa · group"]] },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cols.map((c) => (
        <div key={c.h} className="rounded-lg bg-paper-2 p-2">
          <p className={"mb-1.5 text-[10px] font-semibold uppercase tracking-wide " + c.tone}>
            {c.h}
          </p>
          <div className="space-y-1.5">
            {c.cards.map(([n, t]) => (
              <LeadCard key={n} name={n} trip={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MockPlan() {
  return (
    <div className="space-y-2.5">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-medium text-gold-deep">
        <Sparkles className="h-3 w-3" /> AI itinerary · generated in 8s
      </div>
      {[
        ["Day 1 · Arrival in Ubud", "Settle into a riverside villa, sunset at the rice terraces and a chef-led welcome dinner."],
        ["Day 2 · Temples & waterfalls", "A guided morning at Tirta Empul, hidden waterfalls by afternoon, free evening in town."],
        ["Day 3 · Islands & snorkelling", "Speedboat to Nusa Penida, snorkel Manta Point, beach club at golden hour."],
      ].map(([t, d]) => (
        <div key={t} className="rounded-lg border border-line bg-paper-2 p-3">
          <p className="text-[12.5px] font-semibold text-ink">{t}</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{d}</p>
        </div>
      ))}
    </div>
  );
}

function MockPropose() {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="relative bg-inkwash p-4 text-white">
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold">
          Wanderlust Travel
        </p>
        <p className="mt-1 font-display text-xl">Bali — 6 nights</p>
        <p className="text-[11px] text-white/70">Boutique villas · private transfers</p>
      </div>
      <div className="flex items-center justify-between gap-2 bg-paper px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted">From</p>
          <p className="text-base font-semibold text-ink">₹1,24,000</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-medium text-gold-deep">
            White-label PDF
          </span>
          <span className="text-[10px] text-[var(--ok)]">Sent on WhatsApp ✓✓</span>
        </div>
      </div>
    </div>
  );
}

function MockBook() {
  return (
    <div className="space-y-2.5">
      <div className="rounded-lg border border-line bg-paper-2 p-3">
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="font-medium text-ink">Bali booking</span>
          <span className="font-semibold text-ink">₹1,24,000</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-[var(--ok)]" style={{ width: "40%" }} />
        </div>
        <p className="mt-1 text-[10.5px] text-muted">₹50,000 paid · ₹74,000 due</p>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 text-ink">
          <CreditCard className="h-3.5 w-3.5 text-gold-deep" /> Razorpay payment link
        </span>
        <span className="rounded-md bg-paper-2 px-2 py-0.5 text-[10px] text-muted">Copy</span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 text-ink">
          <FileText className="h-3.5 w-3.5 text-gold-deep" /> GST invoice · WL/26-27/0042
        </span>
        <Check className="h-3.5 w-3.5 text-[var(--ok)]" />
      </div>
    </div>
  );
}

function MockOperate() {
  const rows: [string, boolean][] = [
    ["Hotel — Tugu Bali (confirmed)", true],
    ["Airport transfers (confirmed)", true],
    ["Voucher sent to traveller", true],
    ["Day-1 pickup — assign driver", false],
  ];
  return (
    <ul className="space-y-2">
      {rows.map(([t, done]) => (
        <li
          key={t}
          className="flex items-center gap-2.5 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[12.5px] text-ink"
        >
          <span
            className={
              "flex h-4 w-4 items-center justify-center rounded-full " +
              (done ? "bg-[var(--ok)] text-white" : "border border-line bg-paper")
            }
          >
            {done ? <Check className="h-2.5 w-2.5" /> : null}
          </span>
          <span className={done ? "" : "text-muted"}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function MockGrow() {
  const bars = [40, 62, 50, 78, 66, 90];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Collected", "₹8.4L"],
          ["Conversion", "32%"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-line bg-paper-2 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted">{l}</p>
            <p className="text-base font-semibold text-ink tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="flex h-24 items-end gap-1.5 rounded-lg border border-line bg-paper-2 p-3">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-gold-deep to-[#e3c98f]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
