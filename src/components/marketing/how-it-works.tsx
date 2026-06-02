"use client";

// Interactive, scroll-driven "how it works" story. A central gold rail fills
// as you scroll the section; each step pops in and its number badge lights up
// when it reaches the middle of the viewport — turning the four-step flow into
// a little guided journey instead of a static grid.

import { useRef } from "react";
import {
  ClipboardList,
  CreditCard,
  Send,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type Step = {
  n: string;
  title: string;
  body: string;
  icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Capture the inquiry",
    body: "Log a lead from Instagram, a referral, a walk-in — anywhere. Track it through your pipeline.",
    icon: ClipboardList,
  },
  {
    n: "02",
    title: "Craft the trip",
    body: "Generate an AI itinerary from a brief, refine it, and build a priced quote in minutes.",
    icon: Wand2,
  },
  {
    n: "03",
    title: "Send the proposal",
    body: "Share a beautiful, branded proposal on WhatsApp. The customer accepts online.",
    icon: Send,
  },
  {
    n: "04",
    title: "Collect & operate",
    body: "Take payment online, issue the GST invoice, assign vendors and run the trip to completion.",
    icon: CreditCard,
  },
];

export function HowItWorks() {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 65%", "end 65%"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    restDelta: 0.001,
  });

  return (
    <section className="relative overflow-hidden bg-inkwash text-[var(--on-dark)]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(50%_40%_at_15%_0%,rgba(200,169,106,0.14),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-4xl px-5 py-24 md:px-10 md:py-32">
        <div className="mb-14 text-center">
          <p className="tc-eyebrow gold">From inquiry to booking</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            One flow, start to finish
          </h2>
        </div>

        <div ref={railRef} className="relative">
          {/* Rail track */}
          <div
            aria-hidden
            className="absolute left-[21px] top-2 bottom-2 w-px bg-white/12 md:left-1/2 md:-translate-x-1/2"
          />
          {/* Rail fill — scroll-linked */}
          <motion.div
            aria-hidden
            style={{ scaleY: fill }}
            className="absolute left-[21px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-[#e3c98f] to-[var(--gold-deep)] md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="space-y-10 md:space-y-14">
            {STEPS.map((step, i) => (
              <TimelineStep key={step.n} step={step} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TimelineStep({ step, index }: { step: Step; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px", once: false });
  const reduce = useReducedMotion();
  const Icon = step.icon;
  const flip = index % 2 === 1; // alternate sides on desktop

  const card: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };

  return (
    <li
      ref={ref}
      className="relative grid grid-cols-[44px_1fr] items-center gap-x-5 md:grid-cols-[1fr_44px_1fr] md:gap-x-8"
    >
      {/* Number badge — sits on the rail (col 1 on mobile, centre col on desktop) */}
      <div className="relative z-10 col-start-1 flex justify-center md:col-start-2">
        <motion.span
          animate={
            inView
              ? { scale: 1, borderColor: "rgba(227,201,143,0.9)" }
              : { scale: 0.92, borderColor: "rgba(255,255,255,0.18)" }
          }
          transition={{ duration: 0.4, ease: EASE }}
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-inkwash"
        >
          <motion.span
            animate={{ color: inView ? "#e3c98f" : "rgba(255,255,255,0.5)" }}
            transition={{ duration: 0.4 }}
          >
            <Icon className="h-4 w-4" />
          </motion.span>
        </motion.span>
      </div>

      {/* Card — right side for even steps, left side (right-aligned) for odd */}
      <motion.div
        variants={card}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className={
          "col-start-2 rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors hover:border-[var(--gold-line)] md:row-start-1 " +
          (flip ? "md:col-start-1 md:text-right" : "md:col-start-3")
        }
      >
        <p className="font-mono text-2xl tabular-nums text-[#e3c98f]">{step.n}</p>
        <h3 className="mt-2 font-display text-xl">{step.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--on-dark)]/70">
          {step.body}
        </p>
      </motion.div>
    </li>
  );
}
