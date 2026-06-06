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
import { Frame, StageMock, type StageKey } from "@/components/marketing/product-mockups";

// Interactive "one platform, end to end" showcase — the landing's second fold.
// A lifecycle of stages auto-advances (pause on hover, click to jump), each
// revealing a rendered product mockup so prospects grasp the full breadth fast.

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
                <StageMock stage={s.key} />
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
