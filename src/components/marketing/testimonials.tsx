"use client";

// Highlighted testimonial grid — features up to 3 REAL customer reviews as
// premium, gold-accented cards. (Replaced the auto-scrolling marquee, which
// duplicated and split the cards across two rows and looked broken with only a
// few quotes.)
//
// IMPORTANT: only REAL customer quotes live in src/lib/reviews.ts. While that
// list is empty the whole testimonials section is hidden (see SocialProof in
// landing.tsx) — we don't ship fabricated social proof.

import { Star } from "lucide-react";
import { REVIEWS, type Review } from "@/lib/reviews";

type Quote = Review;

// Single source of truth, shared with the Review JSON-LD in structured-data.ts.
export const QUOTES: Quote[] = REVIEWS;

// We feature only the strongest few as highlighted cards.
const MAX_FEATURED = 3;

function Card({ q }: { q: Quote }) {
  const initials = q.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-[var(--gold-line)] bg-paper p-7 shadow-lift ring-1 ring-[var(--gold-line)]/40">
      <div className="flex gap-0.5 text-gold-deep">
        {Array.from({ length: q.rating ?? 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink/85">
        “{q.body}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line/70 pt-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-inkwash text-sm font-semibold text-[var(--on-dark)]">
          {initials}
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink">{q.name}</span>
          <span className="block text-xs text-muted">
            {q.role} · {q.city}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const featured = QUOTES.slice(0, MAX_FEATURED);
  if (featured.length === 0) return null;
  return (
    <div className="mx-auto grid max-w-5xl gap-5 px-5 sm:grid-cols-2 md:px-10 lg:grid-cols-3">
      {featured.map((q, i) => (
        <Card key={`${q.name}-${i}`} q={q} />
      ))}
    </div>
  );
}
