"use client";

// Auto-scrolling testimonial marquee (two rows, opposite directions, pause on
// hover). Pure CSS animation via .tc-marquee in globals.css — no JS timer — so
// it stays smooth and respects prefers-reduced-motion (animation disabled).
//
// IMPORTANT: only REAL customer quotes go in QUOTES. While it's empty the whole
// testimonials section is hidden (see SocialProof in landing.tsx) — we don't
// ship fabricated social proof. To add real ones, paste objects into QUOTES
// using the template below (even a WhatsApp screenshot quote works).
//
//   {
//     name: "Ananya Rao",
//     role: "Founder, Wanderloom Travel",
//     city: "Bengaluru",
//     body: "We used to lose a full day building each proposal. Now it's 20 minutes…",
//   },

import { Star } from "lucide-react";
import { REVIEWS, type Review } from "@/lib/reviews";

// Real reviews live in src/lib/reviews.ts (single source of truth, shared with
// the Review JSON-LD). The marquee renders every entry there.
type Quote = Review;

export const QUOTES: Quote[] = REVIEWS;

function Card({ q }: { q: Quote }) {
  return (
    <figure className="w-[340px] shrink-0 rounded-xl border border-line bg-paper p-6 shadow-soft">
      <div className="flex gap-0.5 text-gold-deep">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
      <blockquote className="mt-3 text-sm leading-relaxed text-ink/80">
        “{q.body}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-inkwash text-xs font-semibold text-[var(--on-dark)]">
          {q.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </span>
        <span>
          <span className="block text-sm font-medium text-ink">{q.name}</span>
          <span className="block text-xs text-muted">
            {q.role} · {q.city}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  if (QUOTES.length === 0) return null;
  const rowA = QUOTES.slice(0, Math.ceil(QUOTES.length / 2));
  const rowB = QUOTES.slice(Math.ceil(QUOTES.length / 2));
  return (
    <div className="space-y-5">
      <div className="tc-marquee group">
        <div className="tc-marquee-track gap-5 group-hover:[animation-play-state:paused]">
          {[...rowA, ...rowA, ...rowA].map((q, i) => (
            <Card key={`a-${i}`} q={q} />
          ))}
        </div>
      </div>
      {rowB.length > 0 ? (
        <div className="tc-marquee group">
          <div className="tc-marquee-track tc-marquee-reverse gap-5 group-hover:[animation-play-state:paused]">
            {[...rowB, ...rowB, ...rowB].map((q, i) => (
              <Card key={`b-${i}`} q={q} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
