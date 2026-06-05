// Public blog / guides content. Pure data (no server imports) so the blog
// pages stay simple and adding a post is a one-object edit — mirrors the
// pattern in help-content.ts. Body is a list of typed blocks rendered by
// components/blog/blog-body.tsx. Inline **bold** and [label](/path) links are
// supported inside paragraph/list text.

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "callout"; text: string }
  | { type: "cta"; label: string; href: string; text?: string };

export type BlogPost = {
  slug: string;
  title: string;
  /** Meta description + list excerpt. Keep ~150–160 chars. */
  description: string;
  category: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  updated?: string;
  author: string;
  readingMinutes: number;
  keywords: string[];
  body: BlogBlock[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-send-a-travel-proposal-that-converts",
    title: "How to send a travel proposal that converts (with a template)",
    description:
      "A practical, step-by-step guide to writing and sending travel proposals that win bookings — structure, pricing, follow-up and a copy-paste template.",
    category: "Sales",
    date: "2026-05-22",
    author: "tripOS Team",
    readingMinutes: 7,
    keywords: [
      "travel proposal",
      "how to write a travel proposal",
      "travel itinerary proposal",
      "travel agency sales",
    ],
    body: [
      {
        type: "p",
        text: "A travel proposal is the moment a casual enquiry becomes a paying booking — or quietly goes cold. Most agents lose deals not on price, but on a slow, scrappy proposal that makes the client do the work. This guide breaks down exactly what a high-converting proposal contains, in what order, and how to follow up so it actually closes.",
      },
      { type: "h2", text: "What a winning travel proposal includes" },
      {
        type: "p",
        text: "Whether you sell luxury honeymoons or corporate offsites, a proposal that converts answers four questions fast: *Where am I going, what's the day-by-day, what does it cost, and why you?* Cover these in this order:",
      },
      {
        type: "ol",
        items: [
          "**A cover that sells the trip** — destination, dates, traveller count, and one evocative line about the experience. First impressions decide whether the rest gets read.",
          "**A day-by-day itinerary** — each day with a title, a short summary, hotels and the key experiences. Specificity builds trust; vague proposals read as effort you haven't done yet.",
          "**Clear, single-number pricing** — the total the client pays, what's included and what's not. Hide your cost and margin; show value, not your spreadsheet.",
          "**Inclusions, exclusions and terms** — removes the back-and-forth that delays a yes.",
          "**A clear next step** — one button or link to view, approve, or pay. Never end a proposal with 'let me know'.",
        ],
      },
      { type: "h2", text: "Speed is the feature that wins" },
      {
        type: "p",
        text: "Enquiries convert dramatically better when the first proposal lands within hours, not days. The agent who replies first, with a polished document, usually wins — even at a higher price. That's why building from a reusable structure beats writing each proposal from scratch in a Word doc.",
      },
      {
        type: "callout",
        text: "With tripOS you generate a full day-by-day itinerary with AI, brand it with your logo and colours, and send it as a live web link or PDF in minutes — so you're first in the client's inbox, not third.",
      },
      { type: "h2", text: "Pricing the proposal without scaring the client" },
      {
        type: "ul",
        items: [
          "Lead with the **all-in price per person or per couple**, then break it down. A single confident number reads as premium; a wall of line items reads as negotiable.",
          "Never expose supplier cost or markup. Customer-facing proposals should only ever show the selling price.",
          "Offer **two or three tiers** (e.g. 4-star vs 5-star) when you can — it shifts the question from 'yes or no' to 'which one'.",
        ],
      },
      { type: "h2", text: "The follow-up is where deals are won" },
      {
        type: "p",
        text: "Most bookings need two to four touches after the proposal. Don't wait for the client to come back. A simple cadence: a same-day 'sent you the proposal' note, a value-add follow-up after 2 days ('added a sunset cruise on day 3'), and a gentle nudge near the quote's validity date.",
      },
      {
        type: "p",
        text: "Send those follow-ups where your clients actually reply — for most Indian agencies that's WhatsApp. Tracking which proposals were opened tells you exactly who to chase.",
      },
      { type: "h2", text: "A simple proposal template" },
      {
        type: "ol",
        items: [
          "**Subject / opening:** Your {destination} trip — {n} nights, {dates}",
          "**Hook:** one line on the experience ('Slow mornings in Ubud, two nights on the Gili Islands, ending with a private sunset dinner').",
          "**Day-by-day:** Day 1 … Day N, each with stay + highlights.",
          "**What's included / not included.**",
          "**Investment:** all-in price, payment terms, validity.",
          "**Next step:** 'View and approve your proposal here →' (one link).",
        ],
      },
      { type: "h2", text: "Send your next proposal in minutes" },
      {
        type: "p",
        text: "If proposals are eating your evenings, that's the single biggest place software pays for itself. tripOS turns an enquiry into a branded, sendable proposal — itinerary, pricing, WhatsApp delivery and follow-up — in one flow.",
      },
      {
        type: "cta",
        label: "Start a free trial",
        href: "/signup",
        text: "14 days, full access, no credit card.",
      },
    ],
  },
  {
    slug: "gst-invoice-for-travel-agents-india",
    title: "GST invoices for travel agents in India: the practical guide",
    description:
      "How GST works for Indian travel agents — tour packages vs commission, the 5% vs 18% question, what a compliant tax invoice needs, and how to stay clean at scale.",
    category: "Finance",
    date: "2026-04-18",
    author: "tripOS Team",
    readingMinutes: 8,
    keywords: [
      "GST for travel agents",
      "GST invoice travel agency",
      "travel agent GST rate",
      "tour operator GST India",
    ],
    body: [
      {
        type: "p",
        text: "GST is where a lot of travel agencies quietly lose money or invite trouble — wrong rate, missing fields, or invoices stitched together in Excel. This is a practical overview of how GST applies to travel agents in India and what a compliant tax invoice must contain.",
      },
      {
        type: "callout",
        text: "This is general guidance, not tax advice. GST treatment depends on your exact business model — confirm specifics with your CA or GST practitioner.",
      },
      { type: "h2", text: "Two ways agents are taxed: package vs commission" },
      {
        type: "p",
        text: "Most disputes come from not separating these two models:",
      },
      {
        type: "ul",
        items: [
          "**Selling a tour package (as principal):** you bundle hotels, transport and activities and sell one package. GST is commonly charged at **5% without input tax credit (ITC)** on the package value (subject to conditions).",
          "**Earning commission (as agent):** you book a flight, hotel or a third party's package and earn a commission or service fee. That service is commonly taxed at **18% with ITC** on the commission/margin.",
        ],
      },
      {
        type: "p",
        text: "Getting this split right matters: applying 5% to something that should be 18% (or vice versa) is the most common GST mistake agencies make. When in doubt, document which hat you're wearing on each booking.",
      },
      { type: "h2", text: "What a compliant GST tax invoice must contain" },
      {
        type: "p",
        text: "A valid tax invoice isn't just a total — it needs specific fields, or your client can't claim credit and you're exposed on audit:",
      },
      {
        type: "ol",
        items: [
          "Your **legal name, address and GSTIN**.",
          "A **unique, sequential invoice number** and the invoice date.",
          "**Customer name, address** and their GSTIN (for B2B).",
          "**Place of supply** and the state code — this decides CGST+SGST vs IGST.",
          "**Description** of the service / package, with HSN/SAC code.",
          "**Taxable value**, the **GST rate**, and tax split (CGST/SGST or IGST).",
          "The **total** including tax, and a signature or digital authentication.",
        ],
      },
      { type: "h3", text: "CGST/SGST vs IGST in one line" },
      {
        type: "p",
        text: "If the place of supply is in your own state, charge **CGST + SGST**. If it's another state, charge **IGST**. Your invoicing should pick this automatically from the customer's place of supply — doing it by hand is where errors creep in.",
      },
      { type: "h2", text: "Sequential numbering and record-keeping" },
      {
        type: "p",
        text: "Invoice numbers must be unique and continuous within a financial year. Gaps, duplicates or 'INV-final-2' style numbering are red flags on audit. A system that issues numbers from a per-agency counter removes the risk entirely.",
      },
      {
        type: "callout",
        text: "tripOS issues GST-compliant tax invoices with the right fields, automatic CGST/SGST vs IGST based on place of supply, and a clean sequential number per agency — straight from the booking, no spreadsheet.",
      },
      { type: "h2", text: "Common mistakes to avoid" },
      {
        type: "ul",
        items: [
          "Charging the wrong rate by mixing up package vs commission models.",
          "Missing the customer's GSTIN on B2B invoices (they lose ITC, you lose goodwill).",
          "Wrong place of supply → wrong CGST/SGST/IGST split.",
          "Non-sequential or duplicated invoice numbers.",
          "Hand-built invoices that don't carry HSN/SAC codes.",
        ],
      },
      { type: "h2", text: "Make compliant invoicing automatic" },
      {
        type: "p",
        text: "Once you're doing more than a handful of bookings a month, manual GST invoicing stops scaling. tripOS turns a confirmed booking into a compliant tax invoice in a click, so your numbers stay clean as you grow.",
      },
      {
        type: "cta",
        label: "Try tripOS free",
        href: "/signup",
        text: "GST invoicing, proposals and payments in one place.",
      },
    ],
  },
  {
    slug: "best-travel-agency-software-india",
    title: "How to choose travel agency software in India (2026)",
    description:
      "A buyer's guide to travel agency software for Indian agents — the must-have features (AI itineraries, GST invoicing, WhatsApp, payments) and how to evaluate tools.",
    category: "Guides",
    date: "2026-03-12",
    author: "tripOS Team",
    readingMinutes: 9,
    keywords: [
      "best travel agency software India",
      "travel agency software",
      "travel CRM India",
      "tour operator software",
    ],
    body: [
      {
        type: "p",
        text: "Most Indian travel agencies run on a patchwork: spreadsheets for quotes, a design tool for proposals, WhatsApp for everything, and a separate accountant for GST. It works — until volume grows and things slip through. The right software replaces that patchwork with one workflow. Here's how to choose it.",
      },
      { type: "h2", text: "The features that actually matter" },
      {
        type: "p",
        text: "Ignore long feature lists and check for the handful of capabilities that change your day:",
      },
      {
        type: "ol",
        items: [
          "**AI itinerary builder** — generate a detailed day-by-day plan in seconds, then edit. This alone can save hours per enquiry.",
          "**Branded proposals** — white-labelled, customer-safe documents (your logo, your colours) sent as a live link or PDF, with your cost and margin hidden.",
          "**Quotes, bookings & GST invoicing** — versioned quotes that convert to bookings and compliant GST tax invoices, without a second tool.",
          "**WhatsApp** — send proposals, invoices and reminders where Indian clients actually reply, ideally with automation.",
          "**Online payments** — collect deposits and balances via Indian payment gateways.",
          "**CRM & operations** — one place for contacts, leads, vendors and the trip lifecycle.",
        ],
      },
      { type: "h2", text: "Built-for-India beats built-for-elsewhere" },
      {
        type: "p",
        text: "A lot of travel software is built for US or European agencies and bolts on the rest. For an Indian agency, these should be first-class, not afterthoughts:",
      },
      {
        type: "ul",
        items: [
          "**GST-compliant invoicing** with correct CGST/SGST vs IGST handling.",
          "**INR pricing** and Indian payment gateways.",
          "**WhatsApp-first** communication, not email-only.",
          "Pricing that makes sense for an Indian agency's margins.",
        ],
      },
      { type: "h2", text: "Questions to ask before you commit" },
      {
        type: "ul",
        items: [
          "Can I send a branded proposal on day one, without an onboarding project?",
          "Does it issue **GST-compliant** invoices, or just 'bills'?",
          "Can my whole team use it with proper roles (owner, staff, viewer)?",
          "Is my data isolated and secure, and do customers only ever see customer-safe documents?",
          "Is there a **free trial** so I can test it on a real enquiry before paying?",
        ],
      },
      { type: "h2", text: "Where tripOS fits" },
      {
        type: "p",
        text: "tripOS is an all-in-one platform built for travel agencies in India. It combines AI itineraries, white-labelled proposals, quotes and bookings, GST-compliant invoicing, WhatsApp messaging and automations, and online payments — in one workflow, starting at ₹2,499/month with a free 14-day trial (no card required).",
      },
      {
        type: "callout",
        text: "The fastest way to evaluate any tool is to run it on one real enquiry: generate the itinerary, send the proposal, raise the invoice. If that takes minutes and looks premium, you've found your tool.",
      },
      {
        type: "cta",
        label: "Start your free trial",
        href: "/signup",
        text: "Run tripOS on your next enquiry — no credit card needed.",
      },
    ],
  },
];

const sorted = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

/** Posts newest-first, for the index and sitemap. */
export function listBlogPosts(): BlogPost[] {
  return sorted;
}

export function blogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
