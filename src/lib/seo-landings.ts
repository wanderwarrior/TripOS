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
  {
    slug: "sembark-alternative",
    metaTitle: "The Best Sembark Alternative for Small Travel Agencies | tripOS",
    metaDescription:
      "Looking for a Sembark alternative? tripOS is the AI-first, all-in-one travel agency software for small and owner-led Indian agencies — AI itineraries, branded proposals, GST invoicing and WhatsApp. Free 14-day trial.",
    keywords: [
      "sembark alternative",
      "alternative to sembark",
      "sembark vs tripos",
      "best sembark alternative",
      "sembark competitor",
    ],
    eyebrow: "Sembark alternative",
    h1: "The Sembark alternative built for small, owner-led agencies",
    intro:
      "Sembark is established travel software for tour operators. But if you're a **small or owner-led agency** that lives on proposals and WhatsApp, you want something AI-first, beautiful to send to clients, and quick to set up yourself. That's **tripOS** — the operating system for Indian travel agencies.",
    sections: [
      {
        h2: "Why agencies look for a Sembark alternative",
        body: "Sembark is a capable platform, but smaller and owner-led agencies often want a few things it isn't built around:",
        bullets: [
          "**AI itineraries** — draft a full day-by-day plan from a one-line brief, instead of building each trip from scratch.",
          "**Proposals that win** — premium, white-labelled proposals clients react to, sent on WhatsApp or a live link.",
          "**Self-serve setup** — start a free trial and send your first proposal the same day, no implementation project.",
          "**Transparent INR pricing** — clear plans from ₹2,499/month, not a custom quote process.",
        ],
      },
      {
        h2: "Where tripOS is different",
        body: "tripOS is **AI-first and proposal-led**: the enquiry-to-proposal moment is the centre of the product, because that's what wins the booking. Everything else — CRM pipeline, GST-compliant invoicing, online payments, vendor ops and vouchers — flows from that one workflow. See the full picture on [travel agency software for India](/travel-agency-software-india).",
      },
      {
        h2: "Who should choose which",
        body: "Pick the tool that fits how you actually work:",
        bullets: [
          "**Choose tripOS** if you're a 1–20 person or owner-led agency that sells custom trips, lives on WhatsApp, and wants AI itineraries + stunning proposals + GST billing in one simple platform.",
          "**Sembark may suit you** if you're a larger operator whose primary need is heavy back-office and inventory/contracting depth.",
        ],
      },
      {
        h2: "Switch in an afternoon",
        body: "No migration project. Add your agency details and logo, generate your first AI itinerary, and send a branded proposal the same day. Most agents cut proposal time from hours to about 10 minutes. [Start a free 14-day trial](/signup) — no card required.",
      },
    ],
    faqs: [
      {
        q: "What is the best Sembark alternative in India?",
        a: "For small and owner-led travel agencies, tripOS is a strong Sembark alternative — it's AI-first and proposal-led, with AI itineraries, white-labelled proposals, GST-compliant invoicing, WhatsApp and online payments in one platform, from ₹2,499/month with a free 14-day trial.",
      },
      {
        q: "How is tripOS different from Sembark?",
        a: "tripOS centres on the AI-itinerary-to-proposal workflow that wins bookings, is fully self-serve with transparent INR pricing, and is designed for small and owner-led agencies. Sembark is geared toward larger tour operators with heavier back-office needs.",
      },
      {
        q: "Can I move my data from Sembark to tripOS?",
        a: "Yes — you can import your existing leads and customers, and our team helps you get set up. You can be sending branded proposals from tripOS the same day you start your trial.",
      },
    ],
    related: [
      { label: "Travel agency software (India)", href: "/travel-agency-software-india" },
      { label: "Best travel agency software in India", href: "/best-travel-agency-software-india" },
      { label: "helloGTX alternative", href: "/hellogtx-alternative" },
      ...RELATED_COMMON,
    ],
  },
  {
    slug: "hellogtx-alternative",
    metaTitle: "The Best helloGTX Alternative for Small Travel Agencies | tripOS",
    metaDescription:
      "Looking for a helloGTX alternative? tripOS is modern, AI-first, all-in-one travel agency software for small and owner-led Indian agencies — AI itineraries, branded proposals, GST invoicing and WhatsApp. Free trial.",
    keywords: [
      "hellogtx alternative",
      "alternative to hellogtx",
      "hellogtx vs tripos",
      "hellogtx competitor",
      "best hellogtx alternative",
    ],
    eyebrow: "helloGTX alternative",
    h1: "A simpler, AI-first helloGTX alternative",
    intro:
      "helloGTX is a long-standing travel CRM aimed at travel businesses and B2B operators. If you want something **modern, AI-first and quick to use** — built for small and owner-led agencies rather than enterprise rollouts — **tripOS** is the alternative.",
    sections: [
      {
        h2: "Why agencies switch to tripOS",
        body: "Smaller agencies tell us they want less setup and more selling:",
        bullets: [
          "**AI itineraries in seconds** — not manual trip-building.",
          "**Premium branded proposals** sent on WhatsApp, the channel clients actually reply on.",
          "**GST-compliant invoicing and online payments** built in, priced in INR.",
          "**Start today** — a free trial and self-serve setup, not a sales-and-onboarding cycle.",
        ],
      },
      {
        h2: "Modern, all-in-one, India-first",
        body: "tripOS combines a travel CRM, AI itinerary builder, proposal software, GST billing, payments and operations in one clean platform — see [travel agency software for India](/travel-agency-software-india). You don't configure it for weeks; you start sending proposals the same day.",
      },
      {
        h2: "Who should choose which",
        body: "Match the tool to your team:",
        bullets: [
          "**Choose tripOS** if you're a 1–20 person or owner-led agency that wants a modern, AI-first, all-in-one platform with transparent pricing.",
          "**helloGTX may suit you** if you need a long-established enterprise/B2B travel CRM with a larger implementation footprint.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a good helloGTX alternative for small agencies?",
        a: "tripOS is a modern, AI-first helloGTX alternative built for small and owner-led travel agencies — AI itineraries, branded proposals, GST invoicing, WhatsApp and payments in one platform, from ₹2,499/month with a free trial.",
      },
      {
        q: "How is tripOS different from helloGTX?",
        a: "tripOS is AI-first, proposal-led and fully self-serve with transparent INR pricing, designed for small and owner-led agencies. helloGTX is a longer-established travel CRM oriented toward larger B2B travel businesses.",
      },
    ],
    related: [
      { label: "Travel agency software (India)", href: "/travel-agency-software-india" },
      { label: "Best travel agency software in India", href: "/best-travel-agency-software-india" },
      { label: "Sembark alternative", href: "/sembark-alternative" },
      ...RELATED_COMMON,
    ],
  },
  {
    slug: "best-travel-agency-software-india",
    metaTitle: "Best Travel Agency Software in India (2026) | tripOS",
    metaDescription:
      "A practical guide to the best travel agency software in India in 2026 — what to look for, how the options compare, and why tripOS is built for how Indian agencies actually sell. Free trial.",
    keywords: [
      "best travel agency software in india",
      "best travel agency software",
      "best travel crm india",
      "top travel agency software india",
      "best software for travel agents",
    ],
    eyebrow: "Buyer's guide",
    h1: "The best travel agency software in India (2026)",
    intro:
      "If you run a travel agency in India, the right software should turn an enquiry into a **proposal, a booking and a GST invoice** without you touching Excel, Canva or Word. Here's what actually matters when you choose — and why **tripOS** is built for it.",
    sections: [
      {
        h2: "What to look for in 2026",
        body: "The best travel agency software for an Indian agency should cover the whole lifecycle, not one slice:",
        bullets: [
          "**AI itinerary building** — fast, editable, day-by-day plans.",
          "**White-labelled proposals** clients can view and accept, sent on **WhatsApp**.",
          "**GST-compliant tax invoicing** with correct CGST/SGST vs IGST and sequential numbering.",
          "**Online payments in INR** via Indian gateways.",
          "**A travel CRM and operations view** — leads, vendors, vouchers, analytics.",
          "**Transparent pricing and fast setup** — a free trial, not a long sales cycle.",
        ],
      },
      {
        h2: "How the options compare",
        body: "Most tools cover only part of the picture:",
        bullets: [
          "**Spreadsheets + WhatsApp + Canva + Word** — free, but slow, error-prone and unprofessional; leads slip and proposals take hours.",
          "**Generic CRMs (Zoho, HubSpot)** — strong CRMs, but not travel-native: no AI itineraries, travel proposals, vouchers or GST tax invoicing.",
          "**Global travel tools (Travefy, Tourwriter)** — good itineraries, but not built for India (no native GST invoicing, INR-first billing or WhatsApp).",
          "**Indian tour-operator software (Sembark, helloGTX, CRMTravel)** — capable, often aimed at larger operators with heavier setup.",
          "**tripOS** — AI-first, all-in-one, India-native and self-serve, built for agencies with 1–20 people. See the [Sembark alternative](/sembark-alternative) and [helloGTX alternative](/hellogtx-alternative) comparisons.",
        ],
      },
      {
        h2: "Why tripOS is built for Indian agencies",
        body: "tripOS treats the things Indian agencies need as first-class, not add-ons: **GST-compliant invoicing**, **INR pricing**, **Indian payment gateways** and **WhatsApp-first** communication — combined with AI itineraries and premium proposals. It's complete [travel agency software for India](/travel-agency-software-india), from ₹2,499/month.",
      },
    ],
    faqs: [
      {
        q: "What is the best travel agency software in India?",
        a: "The best option combines AI itineraries, branded proposals, GST-compliant invoicing, WhatsApp and online payments in one platform priced for Indian margins. tripOS is built specifically for this, from ₹2,499/month with a free 14-day trial.",
      },
      {
        q: "Which software is best for a small travel agency?",
        a: "Small and owner-led agencies are best served by an all-in-one, self-serve tool with transparent pricing. tripOS is designed for agencies with 1–20 people and lets you send your first branded proposal the same day.",
      },
      {
        q: "Is there free travel agency software?",
        a: "Spreadsheets and WhatsApp are free but cost you time and lost bookings. tripOS offers a free 14-day trial (no card required) so you can see the time saved before paying, with plans from ₹2,499/month.",
      },
    ],
    related: [
      { label: "Travel agency software (India)", href: "/travel-agency-software-india" },
      { label: "Travel agency CRM", href: "/travel-agency-crm" },
      { label: "Sembark alternative", href: "/sembark-alternative" },
      { label: "helloGTX alternative", href: "/hellogtx-alternative" },
      ...RELATED_COMMON,
    ],
  },
  {
    slug: "travefy-alternative-india",
    metaTitle: "The Best Travefy Alternative for Indian Travel Agencies | tripOS",
    metaDescription:
      "Travefy is built for the US market. tripOS is the India-first alternative — AI itineraries and branded proposals plus GST invoicing, INR payments and WhatsApp. Free 14-day trial.",
    keywords: [
      "travefy alternative",
      "travefy alternative india",
      "travefy vs tripos",
      "travefy competitor india",
      "indian travefy alternative",
    ],
    eyebrow: "Travefy alternative",
    h1: "The India-first Travefy alternative",
    intro:
      "Travefy is a popular itinerary and proposal tool — but it's built for the **US market**. If you sell in India, you need **GST-compliant invoicing, INR payments and WhatsApp** as first-class features. That's **tripOS**.",
    sections: [
      {
        h2: "What Travefy doesn't do for Indian agencies",
        body: "Travefy is good at itineraries, but Indian agencies hit the same gaps:",
        bullets: [
          "**No GST-compliant tax invoicing** — you still patch invoices together in Excel.",
          "**No INR-first billing or Indian payment gateways** out of the box.",
          "**Email-first, not WhatsApp-first** — but your clients reply on WhatsApp.",
          "**Pricing in USD** — and built around US workflows.",
        ],
      },
      {
        h2: "tripOS does the whole India workflow",
        body: "tripOS gives you AI itineraries and premium branded proposals **and** the things that come after the proposal: GST tax invoices, online payments in INR, vouchers, vendor ops and a travel CRM — see [travel agency software for India](/travel-agency-software-india).",
      },
      {
        h2: "Who should choose which",
        body: "**Choose tripOS** if you sell from India and need GST + INR + WhatsApp end to end. **Travefy may suit you** if you're a US-based agency that only needs itineraries and proposals.",
      },
    ],
    faqs: [
      {
        q: "Is there an Indian alternative to Travefy?",
        a: "Yes — tripOS is built for India, adding GST-compliant invoicing, INR payments and WhatsApp delivery to AI itineraries and branded proposals, from ₹2,499/month with a free trial.",
      },
      {
        q: "How is tripOS different from Travefy?",
        a: "Travefy focuses on itineraries and proposals for the US market. tripOS covers the full Indian agency lifecycle — itinerary, proposal, booking, GST invoice and payment — and is WhatsApp-first and priced in INR.",
      },
    ],
    related: [
      { label: "Travel proposal software", href: "/travel-proposal-software" },
      { label: "Best travel agency software in India", href: "/best-travel-agency-software-india" },
      { label: "Tourwriter alternative", href: "/tourwriter-alternative-india" },
      ...RELATED_COMMON,
    ],
  },
  {
    slug: "tourwriter-alternative-india",
    metaTitle: "The Best Tourwriter Alternative for Indian Agencies | tripOS",
    metaDescription:
      "Tourwriter is enterprise tour-operator software. tripOS is the simpler, AI-first, India-native alternative — AI itineraries, branded proposals, GST invoicing and WhatsApp, from ₹2,499/month. Free trial.",
    keywords: [
      "tourwriter alternative",
      "tourwriter alternative india",
      "tourwriter vs tripos",
      "tourwriter competitor",
      "affordable tourwriter alternative",
    ],
    eyebrow: "Tourwriter alternative",
    h1: "A simpler, India-first Tourwriter alternative",
    intro:
      "Tourwriter is established tour-operator software aimed at the global market. If you want something **AI-first, simpler and built for India** — without enterprise pricing or a long setup — **tripOS** is the alternative.",
    sections: [
      {
        h2: "Why agencies look past Tourwriter",
        body: "For small and owner-led Indian agencies, the common gaps are:",
        bullets: [
          "**Not India-native** — no built-in GST tax invoicing or INR-first billing.",
          "**Email-first, not WhatsApp-first.**",
          "**Built for larger operators** — more setup than a small team wants.",
        ],
      },
      {
        h2: "tripOS: AI-first and India-native",
        body: "Generate itineraries with AI, send premium branded proposals on WhatsApp, and handle GST invoices and INR payments in the same flow — all self-serve. See [travel agency software for India](/travel-agency-software-india).",
      },
      {
        h2: "Who should choose which",
        body: "**Choose tripOS** if you're a 1–20 person Indian agency that wants AI, proposals, GST and WhatsApp in one simple, affordable platform. **Tourwriter may suit you** if you're a large global operator needing deep contracting workflows.",
      },
    ],
    faqs: [
      {
        q: "What is a good Tourwriter alternative in India?",
        a: "tripOS is an AI-first, India-native Tourwriter alternative for small and owner-led agencies — AI itineraries, branded proposals, GST invoicing, WhatsApp and payments in one platform, from ₹2,499/month with a free trial.",
      },
    ],
    related: [
      { label: "Travel proposal software", href: "/travel-proposal-software" },
      { label: "Best travel agency software in India", href: "/best-travel-agency-software-india" },
      { label: "Travefy alternative", href: "/travefy-alternative-india" },
      ...RELATED_COMMON,
    ],
  },
  {
    slug: "crmtravel-alternative",
    metaTitle: "The Best CRMTravel Alternative | tripOS",
    metaDescription:
      "Looking for a CRMTravel alternative? tripOS is modern, AI-first, all-in-one travel agency software for Indian agencies — AI itineraries, branded proposals, GST invoicing and WhatsApp. Free trial.",
    keywords: [
      "crmtravel alternative",
      "alternative to crmtravel",
      "crmtravel vs tripos",
      "crmtravel competitor",
      "best crmtravel alternative",
    ],
    eyebrow: "CRMTravel alternative",
    h1: "A modern, AI-first CRMTravel alternative",
    intro:
      "If you're comparing travel CRMs, **tripOS** is the modern, AI-first, all-in-one option for Indian agencies — it doesn't just store leads, it turns them into AI itineraries, branded proposals, bookings and GST invoices.",
    sections: [
      {
        h2: "More than a travel CRM",
        body: "A CRM that only tracks contacts leaves you stitching the rest together. tripOS brings the whole workflow into one place:",
        bullets: [
          "**AI itineraries** and **white-labelled proposals** sent on WhatsApp.",
          "**GST-compliant invoicing** and **online INR payments**.",
          "**Vendors, vouchers, operations and analytics** in one dashboard.",
        ],
      },
      {
        h2: "Built for how Indian agencies sell",
        body: "INR pricing, GST invoicing, WhatsApp-first communication and self-serve setup — see [travel agency CRM](/travel-agency-crm) and [travel agency software for India](/travel-agency-software-india).",
      },
    ],
    faqs: [
      {
        q: "What is a good CRMTravel alternative?",
        a: "tripOS is a modern, AI-first CRMTravel alternative for Indian travel agencies — combining a travel CRM with AI itineraries, branded proposals, GST invoicing, WhatsApp and payments, from ₹2,499/month with a free trial.",
      },
    ],
    related: [
      { label: "Travel agency CRM", href: "/travel-agency-crm" },
      { label: "Best travel agency software in India", href: "/best-travel-agency-software-india" },
      { label: "Sembark alternative", href: "/sembark-alternative" },
      ...RELATED_COMMON,
    ],
  },
  {
    slug: "zoho-crm-for-travel-agency-alternative",
    metaTitle: "Zoho CRM for Travel Agencies? The Travel-Native Alternative | tripOS",
    metaDescription:
      "Zoho and HubSpot are great CRMs — but they're not built for travel. tripOS is a travel-native alternative with AI itineraries, proposals, GST invoicing and vouchers built in. Free trial.",
    keywords: [
      "zoho crm for travel agency",
      "zoho alternative for travel agency",
      "hubspot for travel agency",
      "travel crm vs zoho",
      "generic crm vs travel crm",
    ],
    eyebrow: "Zoho / HubSpot alternative",
    h1: "Tried to fit a generic CRM to travel? Use one built for it.",
    intro:
      "Zoho and HubSpot are excellent **general** CRMs — but travel agencies quickly hit the wall: no itineraries, no travel proposals, no GST tax invoicing, no vouchers. **tripOS** is travel-native, so it works on day one.",
    sections: [
      {
        h2: "What a generic CRM can't do for travel agents",
        body: "You can spend weeks configuring Zoho or HubSpot and still be missing the core of your job:",
        bullets: [
          "**No AI itinerary builder** — you still write trips in Word.",
          "**No white-labelled travel proposals** — you still design in Canva.",
          "**No GST-compliant tax invoicing** for travel.",
          "**No vouchers, vendor ops or trip lifecycle** — the things travel runs on.",
        ],
      },
      {
        h2: "tripOS is travel out of the box",
        body: "tripOS is a [travel agency CRM](/travel-agency-crm) with AI itineraries, branded proposals, GST invoicing, WhatsApp, payments and operations built in — no configuration project. It's complete [travel agency software for India](/travel-agency-software-india).",
      },
      {
        h2: "Who should choose which",
        body: "**Choose tripOS** if you sell trips and want a tool that already understands itineraries, proposals, GST and vouchers. **Zoho/HubSpot may suit you** if you need a general-purpose CRM across non-travel functions.",
      },
    ],
    faqs: [
      {
        q: "Can I use Zoho CRM for a travel agency?",
        a: "You can, but Zoho is a general CRM with no AI itineraries, travel proposals, GST tax invoicing or vouchers — so you'll bolt on several other tools. tripOS is travel-native and includes all of these, from ₹2,499/month.",
      },
      {
        q: "Is there a travel-specific alternative to HubSpot?",
        a: "Yes — tripOS is purpose-built for travel agencies, combining CRM, AI itineraries, branded proposals, GST invoicing, WhatsApp and payments in one platform designed for the Indian market.",
      },
    ],
    related: [
      { label: "Travel agency CRM", href: "/travel-agency-crm" },
      { label: "Best travel agency software in India", href: "/best-travel-agency-software-india" },
      { label: "Travel proposal software", href: "/travel-proposal-software" },
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
    // Absolute → bypass the layout's "%s · tripOS" template (metaTitle already
    // ends in "| tripOS"), so we don't double-brand the title.
    title: { absolute: l.metaTitle },
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
