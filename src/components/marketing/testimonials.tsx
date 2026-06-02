"use client";

// Auto-scrolling testimonial marquee (two rows, opposite directions, pause on
// hover). Pure CSS animation via .tc-marquee in globals.css — no JS timer — so
// it stays smooth and respects prefers-reduced-motion (animation disabled).
// NOTE: names/quotes are illustrative placeholders — replace with real
// customer quotes before launch.

import { Star } from "lucide-react";

type Quote = {
  name: string;
  role: string;
  city: string;
  body: string;
};

const QUOTES: Quote[] = [
  {
    name: "Ananya Rao",
    role: "Founder, Wanderloom Travel",
    city: "Bengaluru",
    body: "We used to lose a full day building each proposal. Now it's 20 minutes — AI itinerary, branded PDF, sent on WhatsApp. We've closed deals the same evening we got the enquiry.",
  },
  {
    name: "Imran Shaikh",
    role: "Director, Crescent Holidays",
    city: "Mumbai",
    body: "GST invoices, payment links and vouchers in one place finally killed our spreadsheet chaos. My accountant actually thanked me.",
  },
  {
    name: "Meghna Pillai",
    role: "Owner, Coastline Journeys",
    city: "Kochi",
    body: "The proposals look like a luxury brand made them. Clients reply 'wow' before they even read the price. Our conversion jumped noticeably.",
  },
  {
    name: "Rohit Khanna",
    role: "Co-founder, Summit Trails",
    city: "Delhi",
    body: "I can see my whole pipeline, who's following up, and what's stuck — for the first time. It feels like I hired an operations manager.",
  },
  {
    name: "Sneha Desai",
    role: "Travel Consultant",
    city: "Ahmedabad",
    body: "WhatsApp reminders alone recovered payments I'd have chased for weeks. It pays for itself.",
  },
  {
    name: "Karan Mehta",
    role: "MD, Voyage Crafters",
    city: "Pune",
    body: "We onboarded the whole team in an afternoon. No training, no manual — they just got it.",
  },
];

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
  const rowA = QUOTES.slice(0, 3);
  const rowB = QUOTES.slice(3);
  return (
    <div className="space-y-5">
      <div className="tc-marquee group">
        <div className="tc-marquee-track gap-5 group-hover:[animation-play-state:paused]">
          {[...rowA, ...rowA, ...rowA].map((q, i) => (
            <Card key={`a-${i}`} q={q} />
          ))}
        </div>
      </div>
      <div className="tc-marquee group">
        <div className="tc-marquee-track tc-marquee-reverse gap-5 group-hover:[animation-play-state:paused]">
          {[...rowB, ...rowB, ...rowB].map((q, i) => (
            <Card key={`b-${i}`} q={q} />
          ))}
        </div>
      </div>
    </div>
  );
}
