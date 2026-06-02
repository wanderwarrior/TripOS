"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does it take to get set up?",
    a: "Minutes. Sign up, add your agency details and logo, and you can generate your first AI itinerary and send a branded proposal the same day. No onboarding calls, no implementation fees.",
  },
  {
    q: "Do I need a credit card to start the trial?",
    a: "No. The free trial needs no card. You only add payment details if you decide to continue after the trial — and you can cancel anytime before then.",
  },
  {
    q: "Is it built for Indian travel agencies?",
    a: "Yes — GST-compliant tax invoices, INR pricing, WhatsApp-first communication and Indian payment gateways are first-class, not afterthoughts. It's made for how agencies here actually sell.",
  },
  {
    q: "Will my customer data be safe?",
    a: "Every agency's data is isolated and access is role-based (Owner, Staff, Viewer). Customers only ever see customer-safe proposals — your cost, markup and margins never leave your workspace.",
  },
  {
    q: "Can my whole team use it?",
    a: "Absolutely. Invite agents with the right role, assign leads, and track performance per agent. Plans scale with your team as you grow.",
  },
  {
    q: "What if I already use spreadsheets and WhatsApp?",
    a: "Most agencies that switch were doing exactly that. TripCraft replaces the scattered mess with one flow — and you can keep using WhatsApp, except now proposals, invoices and reminders go out branded and tracked.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-xl border border-line bg-paper">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-6"
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg text-ink">{f.q}</span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-gold-deep">
                {isOpen ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink/75 md:px-6">
                    {f.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
