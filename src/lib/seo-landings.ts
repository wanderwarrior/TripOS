// Keyword-targeted SEO landing pages. Pure data (no server imports) so it can
// be read by the renderer, the sitemap, AND the edge auth allowlist. Each entry
// becomes a top-level route /<slug>, optimised for one Tier-2 search term.
//
// Section/intro/FAQ text supports inline **bold** and [label](/internal-link).

import type { Metadata } from "next";
import { siteUrl, SITE_NAME } from "@/lib/structured-data";

export type SeoSection = { h2: string; body: string; bullets?: string[] };
export type SeoFaq = { q: string; a: string };

export type SeoLandingContent = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  eyebrow: string;
  h1: string;
  intro: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  related: { label: string; href: string }[];
};

const RELATED_COMMON = [
  { label: "Pricing", href: "/pricing" },
  { label: "Guides for travel agencies", href: "/blog" },
  { label: "Start a free trial", href: "/signup" },
];

export const SEO_LANDINGS: SeoLandingContent[] = [
  {
    slug: "travel-agency-software-india",
    metaTitle: "Travel Agency Software in India | tripOS",
    metaDescription:
      "tripOS is all-in-one travel agency software built for India — AI itineraries, branded proposals, GST invoicing, WhatsApp and online payments. Free 14-day trial.",
    keywords: [
      "travel agency software india",
      "travel agency software",
      "software for travel agents",
      "tour operator software india",
    ],
    eyebrow: "Travel agency software",
    h1: "Travel agency software, built for India",
    intro:
      "tripOS is all-in-one **travel agency software** made for how Indian agencies actually sell — turn an enquiry into an AI itinerary, a branded proposal, a paid booking and a GST invoice, without leaving WhatsApp.",
    sections: [
      {
        h2: "Everything your agency runs on, in one platform",
        body: "Stop stitching together Word, Canva, spreadsheets and a separate accountant. tripOS replaces the scattered mess with one workflow:",
        bullets: [
          "**AI itinerary builder** — a detailed day-by-day plan in seconds.",
          "**White-labelled proposals** — your logo and brand; your cost and margin stay private.",
          "**Quotes, bookings & GST invoices** — versioned quotes that convert to bookings and compliant tax invoices.",
          "**WhatsApp** — send proposals, invoices and reminders where clients reply.",
          "**Online payments** — collect deposits and balances via Indian gateways.",
          "**CRM & operations** — leads, customers, vendors and the full trip lifecycle.",
        ],
      },
      {
        h2: "Why India-first matters",
        body: "Most travel software is built for the US or Europe and bolts on the rest. tripOS treats the things Indian agencies need as first-class: **GST-compliant invoicing** with correct CGST/SGST vs IGST, **INR pricing**, **Indian payment gateways**, and **WhatsApp-first** communication — not email-only. See [GST invoicing for travel agents](/gst-invoicing-for-travel-agents).",
      },
      {
        h2: "Who it's for",
        body: "Solo agents and small teams doing honeymoon, family, group, pilgrimage and international FIT packages — through to growing agencies and DMCs that quote at volume. If you build custom trips and quote clients, tripOS fits.",
      },
      {
        h2: "Switch from spreadsheets in an afternoon",
        body: "No onboarding project, no implementation fee. Add your agency details and logo, generate your first AI itinerary, and send a branded proposal the same day. Most agents cut proposal time from hours to ~10 minutes.",
      },
    ],
    faqs: [
      {
        q: "What is the best travel agency software in India?",
        a: "The right tool combines AI itineraries, branded proposals, GST-compliant invoicing, WhatsApp and online payments in one place, priced for Indian margins. tripOS is built specifically for this, starting at ₹2,499/month with a free 14-day trial.",
      },
      {
        q: "Is tripOS GST-compliant?",
        a: "Yes — tripOS issues GST-compliant tax invoices with the correct CGST/SGST vs IGST split based on place of supply, and sequential numbering per agency.",
      },
      {
        q: "Do I need a credit card for the free trial?",
        a: "No. The 14-day trial needs no card. We review new agencies and approve access, usually within a few hours.",
      },
      {
        q: "Can my whole team use it?",
        a: "Yes — invite agents with roles (Owner, Staff, Viewer), assign leads, and track performance per agent.",
      },
    ],
    related: [
      { label: "Travel agency CRM", href: "/travel-agency-crm" },
      { label: "Travel proposal software", href: "/travel-proposal-software" },
      ...RELATED_COMMON,
    ],
  },
  {
    slug: "travel-agency-crm",
    metaTitle: "Travel Agency CRM | tripOS",
    metaDescription:
      "A travel CRM built for travel agents — capture leads, track your pipeline, follow up on WhatsApp and convert more bookings. Made for India. Free trial.",
    keywords: [
      "travel agency crm",
      "travel crm",
      "crm for travel agents",
      "travel agent crm india",
    ],
    eyebrow: "Travel CRM",
    h1: "A travel CRM built for how agencies actually sell",
    intro:
      "tripOS is a **travel agency CRM** that does more than store contacts — it captures every enquiry, tracks your pipeline to ₹, and turns leads into booked, paying customers, with WhatsApp at the centre.",
    sections: [
      {
        h2: "Capture every lead — from anywhere",
        body: "Instagram, WhatsApp, referrals, your website — log every enquiry in one place with the trip details, so nothing slips through notebooks, chats or memory.",
      },
      {
        h2: "A pipeline you can actually see",
        body: "Move leads from new → quoted → won on a kanban or list, assign them to agents, and see exactly what's stuck and what's closing this month.",
      },
      {
        h2: "Follow up where clients reply: WhatsApp",
        body: "Send proposals, reminders and follow-ups over official WhatsApp, and track what was opened. On Pro, automate reminders so no payment or follow-up is forgotten.",
      },
      {
        h2: "More than a generic CRM",
        body: "Unlike a blank CRM you'd configure for weeks, tripOS is built for travel — AI itineraries, branded proposals, GST invoices, vendors and vouchers are built in. It's [travel agency software](/travel-agency-software-india) and a CRM in one.",
        bullets: [
          "Customer profiles with traveller details and trip history",
          "Per-agent and per-source performance reporting",
          "Customers only ever see customer-safe proposals — your margins stay private",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a travel CRM?",
        a: "A travel CRM helps agencies capture enquiries, manage their sales pipeline, follow up with clients and track bookings and revenue. tripOS is a travel CRM purpose-built for travel agents, with AI itineraries, proposals, GST invoicing and WhatsApp included.",
      },
      {
        q: "Which CRM is best for travel agents in India?",
        a: "Travel agents need a CRM that understands trips, GST and WhatsApp — not a generic sales CRM. tripOS is built for Indian travel agencies and starts at ₹2,499/month with a free trial.",
      },
      {
        q: "Can I track which agent or source brings the best bookings?",
        a: "Yes — tripOS reports on conversion, margins and performance by agent and by lead source.",
      },
    ],
    related: [
      { label: "Travel agency software (India)", href: "/travel-agency-software-india" },
      { label: "Travel proposal software", href: "/travel-proposal-software" },
      ...RELATED_COMMON,
    ],
  },
  {
    slug: "gst-invoicing-for-travel-agents",
    metaTitle: "GST Invoicing for Travel Agents | tripOS",
    metaDescription:
      "Issue GST-compliant tax invoices for your travel agency in one click — correct CGST/SGST vs IGST, sequential numbering, straight from a booking. Free trial.",
    keywords: [
      "gst invoice for travel agents",
      "gst invoicing travel agency",
      "travel agency gst software",
      "gst billing for travel agents",
    ],
    eyebrow: "GST invoicing",
    h1: "GST-compliant invoicing for travel agents",
    intro:
      "Stop stitching GST invoices together in Excel. tripOS turns a confirmed booking into a **GST-compliant tax invoice** in one click — with the right fields, the right tax split and clean sequential numbering.",
    sections: [
      {
        h2: "Compliant invoices, automatically",
        body: "Every invoice carries what GST requires — your GSTIN, the customer's details, place of supply, HSN/SAC, taxable value and tax — so your clients can claim credit and you're clean on audit.",
      },
      {
        h2: "Right tax split, every time",
        body: "tripOS applies **CGST + SGST** for in-state supply and **IGST** for inter-state automatically, based on the customer's place of supply — the #1 thing agencies get wrong by hand.",
      },
      {
        h2: "Sequential numbering, no gaps",
        body: "Invoice numbers are unique and continuous per financial year, issued from a per-agency counter — no duplicates, no 'INV-final-2', no audit red flags.",
      },
      {
        h2: "Straight from the booking",
        body: "Quote → booking → invoice, in one flow — no re-typing into a separate tool. Learn more in our guide: [GST invoices for travel agents in India](/blog/gst-invoice-for-travel-agents-india).",
      },
    ],
    faqs: [
      {
        q: "What GST rate do travel agents charge?",
        a: "It depends on your model: selling a tour package as principal is commonly 5% without input tax credit, while earning commission as an agent is commonly 18% with ITC. tripOS lets you invoice correctly for both. (Confirm specifics with your CA.)",
      },
      {
        q: "Does tripOS handle CGST/SGST and IGST automatically?",
        a: "Yes — it picks CGST+SGST vs IGST automatically from the customer's place of supply.",
      },
      {
        q: "Can I generate a GST invoice from a booking?",
        a: "Yes — one click turns a confirmed booking into a compliant tax invoice with sequential numbering.",
      },
    ],
    related: [
      { label: "Travel agency software (India)", href: "/travel-agency-software-india" },
      { label: "Guide: GST for travel agents", href: "/blog/gst-invoice-for-travel-agents-india" },
      ...RELATED_COMMON,
    ],
  },
  {
    slug: "travel-proposal-software",
    metaTitle: "Travel Proposal Software | tripOS",
    metaDescription:
      "Travel proposal software that wins bookings — generate an AI itinerary, brand it, and send a beautiful proposal on WhatsApp in minutes. Free 14-day trial.",
    keywords: [
      "travel proposal software",
      "travel itinerary software",
      "itinerary builder",
      "travel proposal maker",
    ],
    eyebrow: "Proposals & itineraries",
    h1: "Travel proposal software that wins bookings",
    intro:
      "Build a beautiful, branded **travel proposal** in minutes, not hours. tripOS drafts the day-by-day itinerary with AI, you price it, and the client views and accepts it on WhatsApp or a live link.",
    sections: [
      {
        h2: "AI itinerary in seconds",
        body: "Type the destination and brief; tripOS drafts a detailed day-by-day itinerary you can edit freely — swap hotels, tweak days, add experiences.",
      },
      {
        h2: "White-labelled and premium",
        body: "Every proposal carries your logo, colours and brand — clients see a luxury document, never your cost or margin. Send it as a live web link or a PDF.",
      },
      {
        h2: "Sent and tracked on WhatsApp",
        body: "Deliver proposals where clients actually respond, and see when they're opened — so you know exactly who to follow up. Speed wins: the first polished proposal usually wins the deal.",
      },
      {
        h2: "From proposal to paid",
        body: "Accepted proposals flow straight into bookings, payments and [GST invoices](/gst-invoicing-for-travel-agents) — one workflow, not five tools. It's part of complete [travel agency software](/travel-agency-software-india).",
      },
    ],
    faqs: [
      {
        q: "What is travel proposal software?",
        a: "Travel proposal software helps agents build and send client trip proposals — itinerary, inclusions and pricing — quickly and professionally. tripOS adds AI itineraries, white-label branding and WhatsApp delivery.",
      },
      {
        q: "How fast can I make a proposal?",
        a: "Most agents go from enquiry to a sent, branded proposal in about 10 minutes with tripOS.",
      },
      {
        q: "Can clients accept and pay from the proposal?",
        a: "Yes — clients can view and accept online, and you can collect payment via Indian gateways, with a GST invoice generated automatically.",
      },
    ],
    related: [
      { label: "Travel agency CRM", href: "/travel-agency-crm" },
      { label: "Guide: proposals that convert", href: "/blog/how-to-send-a-travel-proposal-that-converts" },
      ...RELATED_COMMON,
    ],
  },
];

export const SEO_LANDING_SLUGS = SEO_LANDINGS.map((l) => l.slug);

export function getSeoLanding(slug: string): SeoLandingContent | undefined {
  return SEO_LANDINGS.find((l) => l.slug === slug);
}

/** Build Next metadata for a landing slug. */
export function seoLandingMetadata(slug: string): Metadata {
  const l = getSeoLanding(slug);
  if (!l) return {};
  return {
    title: l.metaTitle,
    description: l.metaDescription,
    keywords: l.keywords,
    alternates: { canonical: `/${l.slug}` },
    openGraph: {
      type: "website",
      title: `${l.metaTitle} · ${SITE_NAME}`,
      description: l.metaDescription,
      url: `${siteUrl()}/${l.slug}`,
    },
  };
}
