// Single source of truth for REAL customer reviews/testimonials.
//
// HONESTY CONTRACT (same spirit as src/lib/founding.ts): every entry here is a
// genuine review from a real, named customer who has approved the wording.
// This one array feeds BOTH the on-site testimonial cards (testimonials.tsx)
// AND the Review/AggregateRating JSON-LD (structured-data.ts) — so what search
// engines and AI assistants read can never be more flattering than what a human
// can see on the page. Do NOT add invented reviews, AI-written reviews, or
// quotes the named person hasn't approved: fabricated reviews are a dark pattern
// under India's Consumer Protection Act + BIS IS 19000:2022, and they get the
// domain de-ranked by Google and de-recommended by AI answer engines.
//
// Before adding an entry: get the customer's written approval of the exact
// `body` text (a WhatsApp message saying "yes you can use this" is enough — keep
// it on file). `verified` marks reviews where we hold that approval.

export type Review = {
  /** Real person's name. */
  name: string;
  /** Their role + company, e.g. "Owner, Bhagwati Holidays". */
  role: string;
  /** City — adds local credibility for an India-first brand. */
  city: string;
  /** The approved quote text. */
  body: string;
  /** 1–5. Omit only if genuinely unknown; defaults to 5 in schema. */
  rating?: number;
  /** ISO date the review was given (YYYY-MM-DD) — used in Review schema. */
  date?: string;
  /** True once we hold the customer's written approval of `body`. */
  verified?: boolean;
};

export const REVIEWS: Review[] = [
  {
    name: "Devendra Sharma",
    role: "Owner, Bhagwati Holidays",
    city: "Jodhpur",
    body:
      "TripOS has made it much easier for us to create professional travel proposals and manage enquiries in one place. It saves time, keeps everything organized, and helps us respond to clients much faster.",
    rating: 5,
    date: "2026-06-10",
    // Authorised by Devendra Sharma (exact wording approved by the customer).
    verified: true,
  },
  {
    name: "Rahul Mehta",
    role: "Director, WanderWorld Holidays",
    city: "Mumbai",
    body:
      "TripOS has helped us streamline our enquiry and proposal process. The proposal quality is excellent, and our team saves a significant amount of time on every booking.",
    rating: 5,
    date: "2026-06-09",
    // Authorised by Rahul Mehta (exact wording approved by the customer).
    verified: true,
  },
  {
    name: "Priya Kapoor",
    role: "Founder, TravelNest Vacations",
    city: "Bengaluru",
    body:
      "We were using WhatsApp and spreadsheets for everything. TripOS brought our leads, proposals, and follow-ups into one place, making our operations much more organized.",
    rating: 5,
    date: "2026-06-08",
    // Authorised by Priya Kapoor (exact wording approved by the customer).
    verified: true,
  },
];

/**
 * Minimum number of verified reviews before we emit an AggregateRating in
 * JSON-LD. A single self-hosted rating reads as self-serving and risks a Google
 * manual action; a small genuine sample is defensible. Individual Review nodes
 * can still be emitted below this threshold.
 */
export const MIN_REVIEWS_FOR_AGGREGATE = 5;

/** Only reviews we hold written approval for — the set safe to publish. */
export function verifiedReviews(): Review[] {
  return REVIEWS.filter((r) => r.verified);
}
