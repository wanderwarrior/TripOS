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
  {
    slug: "how-to-start-a-travel-agency-in-india",
    title: "How to start a travel agency in India (2026): the complete guide",
    description:
      "A step-by-step guide to starting a travel agency in India in 2026 — registration, GST, IATA, finding suppliers, getting your first clients, and the tools to run it.",
    category: "Guides",
    date: "2026-06-09",
    author: "tripOS Team",
    readingMinutes: 11,
    keywords: [
      "how to start a travel agency in india",
      "start a travel business india",
      "travel agency registration india",
      "become a travel agent india",
    ],
    body: [
      {
        type: "p",
        text: "Starting a travel agency in India has never been cheaper or faster — you can launch from home, sell packages on WhatsApp and Instagram, and grow without an office. But the agents who last are the ones who set up the boring foundations right (registration, GST, supplier relationships) and look professional from day one. This guide walks through exactly how to start, in order.",
      },
      { type: "h2", text: "1. Pick a focus before you pick a name" },
      {
        type: "p",
        text: "The biggest early mistake is selling 'everything to everyone'. The agencies that grow fastest specialise: a destination (Bali, Dubai, Vietnam, Europe, Kashmir), a trip type (honeymoons, family holidays, pilgrimage, corporate MICE, destination weddings), or a customer (NRIs, a specific city's outbound travellers). A focus makes your marketing cheaper and your proposals sharper.",
      },
      { type: "h2", text: "2. Register your business" },
      {
        type: "ul",
        items: [
          "**Choose a structure** — sole proprietorship is simplest to start; an LLP or Pvt Ltd makes sense once you have partners or scale.",
          "**Register the entity** and open a current account in the business name.",
          "**GST registration** — required once you cross the turnover threshold, and most B2B clients and suppliers will expect it. See our [GST guide for travel agents](/blog/gst-invoice-for-travel-agents-india).",
          "**Trade licence / Shops & Establishment** registration as applicable in your state.",
        ],
      },
      {
        type: "callout",
        text: "This is general guidance, not legal or tax advice — confirm registration and GST specifics for your situation with a CA or company secretary.",
      },
      { type: "h2", text: "3. Decide: package seller or commission agent?" },
      {
        type: "p",
        text: "Your model shapes your taxes and margins. As a **package seller (principal)** you bundle hotels, transfers and activities and sell one price — GST is commonly 5% without input tax credit. As a **commission agent** you book third-party products and earn commission, commonly taxed at 18% with ITC. Many agents do both; just invoice each correctly.",
      },
      { type: "h2", text: "4. Build supplier relationships (DMCs & vendors)" },
      {
        type: "ul",
        items: [
          "Find reliable **DMCs (destination management companies)** for the destinations you sell — they give you ground rates for hotels, transfers and activities.",
          "Get on **B2B portals** and join DMC WhatsApp groups for live rates and offers.",
          "Negotiate **net rates** so you control your markup, and keep a clean vendor list with contacts and payment terms.",
        ],
      },
      { type: "h2", text: "5. Look professional from the first message" },
      {
        type: "p",
        text: "Clients judge a new agency in seconds. A polished, branded proposal sent within hours of an enquiry beats a cheaper competitor's Word document every time. This is where most new agencies under-invest — and where you can instantly look bigger than you are.",
      },
      {
        type: "callout",
        text: "tripOS lets a brand-new agency send a beautiful, white-labelled proposal — AI itinerary, your logo, GST invoice and a WhatsApp payment link — from day one, with no setup project. It's [travel agency software built for India](/travel-agency-software-india).",
      },
      { type: "h2", text: "6. Get your first 10 clients" },
      {
        type: "ol",
        items: [
          "**Start with your network** — tell everyone you now plan trips; your first bookings are friends, family and referrals.",
          "**Instagram + WhatsApp** — post real itineraries and sample packages; let people DM you to enquire.",
          "**Niche down your content** — 'Bali for couples under ₹X' converts better than generic 'book your dream holiday'.",
          "**Respond fast** — speed of first reply is the single biggest predictor of closing a travel lead. Read [how to send a proposal that converts](/blog/how-to-send-a-travel-proposal-that-converts).",
          "**Ask for referrals and reviews** after every trip — word of mouth is an agency's cheapest growth.",
        ],
      },
      { type: "h2", text: "7. Set up the tools that scale with you" },
      {
        type: "p",
        text: "Spreadsheets and WhatsApp work for your first few trips, but leads start slipping as you grow. A [travel agency CRM](/travel-agency-crm) keeps every enquiry, proposal, booking and follow-up in one place — so nothing is lost and you can see what's actually converting.",
      },
      {
        type: "p",
        text: "tripOS brings AI itineraries, branded proposals, GST invoicing, WhatsApp and online payments into one platform built for Indian agencies — from ₹2,499/month with a free 14-day trial. You can be sending proposals the same day you start.",
      },
      {
        type: "cta",
        label: "Start your free trial",
        href: "/signup",
        text: "Launch your agency on tripOS — 14 days free, no card required.",
      },
    ],
  },
  {
    slug: "how-to-sell-bali-tour-packages",
    title: "How to sell Bali tour packages: a travel agent's playbook (with sample itinerary)",
    description:
      "A practical playbook for selling Bali packages — what travellers want, a sample 6-night itinerary, how to price it, and how to send a proposal that closes.",
    category: "Destinations",
    date: "2026-06-07",
    author: "tripOS Team",
    readingMinutes: 9,
    keywords: [
      "how to sell bali packages",
      "bali itinerary for travel agents",
      "bali tour package india",
      "bali honeymoon itinerary",
    ],
    body: [
      {
        type: "p",
        text: "Bali is one of the highest-converting outbound destinations for Indian agencies — visa-on-arrival, strong honeymoon and family demand, and a wide price range you can sell up. This playbook covers what Bali travellers actually want, a ready-to-adapt itinerary, how to price it, and how to turn the enquiry into a booking.",
      },
      { type: "h2", text: "What Bali travellers want (segment your pitch)" },
      {
        type: "ul",
        items: [
          "**Honeymooners:** privacy, a pool villa for 1–2 nights, a romantic dinner, sunset views. Sell the experience, not the line items.",
          "**Families:** waterparks, easy transfers, a central hotel, kid-friendly activities.",
          "**Groups & friends:** beach clubs, watersports, nightlife in Seminyak/Canggu.",
          "**Budget vs premium:** the same route works at 4-star and 5-star — always offer two tiers.",
        ],
      },
      { type: "h2", text: "A sample 6-night Bali itinerary" },
      {
        type: "ol",
        items: [
          "**Day 1 — Arrival, South Bali:** airport pickup, check in around Kuta/Seminyak, evening at the beach.",
          "**Day 2 — Water sports & Uluwatu:** watersports at Tanjung Benoa, Uluwatu temple, Kecak fire dance at sunset.",
          "**Day 3 — Transfer to Ubud:** Tegenungan waterfall en route, check in to an Ubud villa, evening at Ubud market.",
          "**Day 4 — Ubud highlights:** rice terraces, swing, coffee plantation, Tegallalang.",
          "**Day 5 — Nusa Penida day trip:** Kelingking beach, Broken beach, Angel's Billabong.",
          "**Day 6 — Leisure / Instagram spots:** handara gate, temples, spa, shopping.",
          "**Day 7 — Departure:** transfer to airport.",
        ],
      },
      {
        type: "callout",
        text: "Don't rebuild this from scratch for every client. In tripOS you generate a Bali itinerary with AI, tweak the days, swap the villa tier, and send it branded — in minutes. Clone it for the next enquiry and you've built a repeatable Bali product.",
      },
      { type: "h2", text: "How to price a Bali package" },
      {
        type: "ul",
        items: [
          "Get **net rates** from your Bali DMC for hotels, transfers and activities, then add your markup — never show cost or margin to the client.",
          "Quote a single **all-in price per couple/person**, with inclusions and exclusions clearly listed (visa, flights, GST, personal expenses).",
          "Offer a **4-star and a 5-star option** so the question becomes 'which one', not 'yes or no'.",
          "Remember **TCS on the foreign package** — factor it correctly. See [TCS on foreign tour packages](/blog/tcs-on-foreign-tour-packages-india).",
        ],
      },
      { type: "h2", text: "Turn the enquiry into a booking" },
      {
        type: "p",
        text: "Bali shoppers compare 3–4 agents. The one who replies first with a polished, branded proposal usually wins — even at a higher price. Send it on WhatsApp, follow up after two days with a value-add ('added a floating breakfast on day 3'), and nudge near the quote's validity. For the full method, read [how to send a travel proposal that converts](/blog/how-to-send-a-travel-proposal-that-converts).",
      },
      {
        type: "p",
        text: "tripOS lets you build, brand and send that Bali proposal in minutes, collect the deposit with a WhatsApp payment link, and issue a GST invoice automatically — so you're first in the client's inbox and faster to a confirmed booking.",
      },
      {
        type: "cta",
        label: "Build your Bali proposal free",
        href: "/signup",
        text: "Try tripOS on your next Bali enquiry — 14 days free.",
      },
    ],
  },
  {
    slug: "tcs-on-foreign-tour-packages-india",
    title: "TCS on foreign tour packages in India: what travel agents need to know",
    description:
      "A practical explainer on TCS for overseas tour packages — the rates and thresholds, who collects it, how it appears on your invoice, and how to handle it cleanly.",
    category: "Finance",
    date: "2026-06-05",
    author: "tripOS Team",
    readingMinutes: 7,
    keywords: [
      "tcs on foreign tour packages",
      "tcs on overseas tour package",
      "tcs travel agent india",
      "tcs foreign travel",
    ],
    body: [
      {
        type: "p",
        text: "TCS (Tax Collected at Source) on overseas tour packages confuses a lot of agents — and getting it wrong means awkward conversations with clients or a compliance gap. This is a practical overview of how TCS applies when you sell a foreign tour package, and how to handle it without friction.",
      },
      {
        type: "callout",
        text: "This is general guidance, not tax advice. TCS rates, thresholds and conditions change and depend on specifics — always confirm the current position with your CA before invoicing.",
      },
      { type: "h2", text: "What TCS is, in one line" },
      {
        type: "p",
        text: "When a seller of an overseas tour package collects payment from a traveller, the seller must collect a percentage as TCS and deposit it with the government. The traveller can later claim it against their income tax — it's not an extra cost to them, but it does increase the amount they pay you upfront.",
      },
      { type: "h2", text: "Who collects it — and the threshold question" },
      {
        type: "ul",
        items: [
          "The **seller of the overseas tour programme** is generally responsible for collecting TCS on the package amount.",
          "A **threshold** typically applies per traveller per financial year, with a **lower rate up to the threshold and a higher rate beyond it** — confirm the current figures with your CA.",
          "Keep the traveller's **PAN** on file; the rate is higher without it.",
        ],
      },
      { type: "h2", text: "How TCS should appear to your client" },
      {
        type: "p",
        text: "Show TCS as a clearly labelled line, separate from the package price and from GST. Travellers accept it far more easily when you explain upfront that it's refundable against their taxes — surprise charges at payment time are where bookings wobble.",
      },
      { type: "h2", text: "Keep TCS and GST clean as you scale" },
      {
        type: "p",
        text: "TCS and GST are different taxes with different rules — mixing them up on an invoice is a common and avoidable error. Pair this with our [GST invoices for travel agents guide](/blog/gst-invoice-for-travel-agents-india), and make sure your invoicing handles each correctly.",
      },
      {
        type: "callout",
        text: "tripOS issues clean, GST-compliant tax invoices and helps you present package pricing, GST and TCS clearly to clients — so foreign-package billing stays correct as your volume grows.",
      },
      {
        type: "cta",
        label: "Try tripOS free",
        href: "/signup",
        text: "Proposals, GST invoicing and payments in one place — 14 days free.",
      },
    ],
  },
  {
    slug: "how-to-get-travel-leads-in-india",
    title: "How to get travel leads in India (that actually book)",
    description:
      "Practical, low-budget ways to get travel agency leads in India — Instagram, referrals, Google, WhatsApp and partnerships — plus how to convert them into bookings.",
    category: "Marketing",
    date: "2026-06-04",
    author: "tripOS Team",
    readingMinutes: 8,
    keywords: [
      "how to get travel leads",
      "travel agency leads india",
      "get clients travel agency",
      "travel agency marketing",
    ],
    body: [
      {
        type: "p",
        text: "Most travel agencies don't have a lead problem so much as a follow-up and conversion problem — but you still need a steady flow of enquiries. Here are the channels that actually work for Indian agencies on a small budget, and how to turn those leads into paid bookings.",
      },
      { type: "h2", text: "Where travel leads actually come from" },
      {
        type: "ol",
        items: [
          "**Instagram** — post real itineraries and sample packages; let people DM to enquire. Niche content ('Bali for couples under ₹X') converts far better than generic 'book your dream holiday'.",
          "**Referrals** — your happiest past clients are your cheapest channel. Ask for an intro after every trip.",
          "**Google** — rank for what your buyers search ('Bali package from Mumbai', 'Kerala honeymoon') with simple pages and guides.",
          "**WhatsApp + status** — share offers and itineraries to your contacts; it's where Indian clients reply.",
          "**Partnerships** — tie up with wedding planners, corporates, hotels and local businesses whose customers travel.",
        ],
      },
      { type: "h2", text: "The mistake that wastes most leads" },
      {
        type: "p",
        text: "Speed. Enquiries convert dramatically better when your first proposal lands within hours, not days. The agent who replies first, with a polished proposal, usually wins — even at a higher price. If leads sit in your WhatsApp unanswered, you're paying to generate enquiries you then let go cold.",
      },
      {
        type: "callout",
        text: "tripOS captures every enquiry in one pipeline and lets you send a branded, AI-built proposal in minutes — so you're first in the client's inbox. Reminders make sure no lead is forgotten.",
      },
      { type: "h2", text: "Convert leads with a simple system" },
      {
        type: "ul",
        items: [
          "Log every enquiry in one place — not across notebooks, chats and memory. A [travel agency CRM](/travel-agency-crm) does this.",
          "Reply fast with a [proposal that converts](/blog/how-to-send-a-travel-proposal-that-converts).",
          "Follow up 2–4 times — same day, +2 days with a value-add, and near the quote's validity.",
          "Track which source and which agent brings the best bookings, and do more of what works.",
        ],
      },
      { type: "h2", text: "Turn your lead flow into a machine" },
      {
        type: "p",
        text: "Generating leads is only worth it if you convert them. tripOS is [travel agency software for India](/travel-agency-software-india) that captures leads, builds proposals, collects payments and issues GST invoices — so more of your enquiries turn into paid trips.",
      },
      {
        type: "cta",
        label: "Start your free trial",
        href: "/signup",
        text: "Capture and convert more leads — 14 days free, no card.",
      },
    ],
  },
  {
    slug: "how-to-sell-dubai-tour-packages",
    title: "How to sell Dubai tour packages: a travel agent's playbook",
    description:
      "A practical playbook for selling Dubai packages — what travellers want, a sample 5-night itinerary, how to price it (with TCS), and how to send a proposal that closes.",
    category: "Destinations",
    date: "2026-06-03",
    author: "tripOS Team",
    readingMinutes: 9,
    keywords: [
      "how to sell dubai packages",
      "dubai itinerary for travel agents",
      "dubai tour package india",
      "dubai holiday package",
    ],
    body: [
      {
        type: "p",
        text: "Dubai is one of the easiest international packages for Indian agencies to sell — short flights, easy visas, year-round demand, and a huge price range from budget to ultra-luxury. This playbook covers what Dubai travellers want, a ready-to-adapt itinerary, how to price it, and how to close.",
      },
      { type: "h2", text: "Know your Dubai buyer" },
      {
        type: "ul",
        items: [
          "**Families:** theme parks, desert safari, easy transfers, a central hotel.",
          "**Honeymoon/couples:** a Marina or Palm stay, a romantic dinner, sunset desert safari.",
          "**Groups & friends:** beach clubs, nightlife, watersports, shopping.",
          "**Budget vs premium:** the same route works at 3-star and 5-star — always offer two tiers.",
        ],
      },
      { type: "h2", text: "A sample 5-night Dubai itinerary" },
      {
        type: "ol",
        items: [
          "**Day 1 — Arrival:** airport pickup, check in, evening at Dubai Marina / JBR.",
          "**Day 2 — City tour + Burj Khalifa:** half-day city tour, At The Top, Dubai Mall fountain show.",
          "**Day 3 — Desert safari:** dune bashing, camel ride, BBQ dinner with entertainment.",
          "**Day 4 — Theme park or Abu Dhabi day trip:** (Ferrari World / Sheikh Zayed Mosque, or IMG/Atlantis).",
          "**Day 5 — Leisure + shopping:** Global Village or Miracle Garden (seasonal), Gold Souk.",
          "**Day 6 — Departure:** transfer to airport.",
        ],
      },
      {
        type: "callout",
        text: "Don't rebuild this for every client. In tripOS you generate a Dubai itinerary with AI, switch the hotel tier, brand it, and send it on WhatsApp in minutes — then clone it for the next enquiry.",
      },
      { type: "h2", text: "How to price a Dubai package" },
      {
        type: "ul",
        items: [
          "Get **net rates** from your Dubai DMC for hotel, transfers, tours and visa, then add your markup — never show cost or margin.",
          "Quote a single **all-in price per person/couple**, with clear inclusions and exclusions (flights, visa, tourism dirham, personal expenses).",
          "Offer a **3-star and a 5-star** option so the question becomes 'which one'.",
          "Factor **TCS on the foreign package** correctly — see [TCS on foreign tour packages](/blog/tcs-on-foreign-tour-packages-india).",
        ],
      },
      { type: "h2", text: "Close the booking" },
      {
        type: "p",
        text: "Dubai shoppers compare several agents. Reply first with a polished, branded proposal, follow up with a value-add, and collect the deposit with a payment link. The full method is in [how to send a travel proposal that converts](/blog/how-to-send-a-travel-proposal-that-converts).",
      },
      {
        type: "cta",
        label: "Build your Dubai proposal free",
        href: "/signup",
        text: "Try tripOS on your next Dubai enquiry — 14 days free.",
      },
    ],
  },
  {
    slug: "best-travel-crm-india-2026",
    title: "The best travel CRM in India (2026): how to choose",
    description:
      "What to look for in a travel CRM for an Indian agency in 2026 — the features that matter, how generic CRMs fall short, and how to evaluate the options.",
    category: "Guides",
    date: "2026-06-02",
    author: "tripOS Team",
    readingMinutes: 8,
    keywords: [
      "best travel crm india",
      "travel crm",
      "crm for travel agents",
      "travel agency crm",
    ],
    body: [
      {
        type: "p",
        text: "A travel CRM should do more than store contacts — it should capture every enquiry, move it through your pipeline, and help you convert it into a paid, GST-invoiced booking. Here's how to choose the right one for an Indian agency in 2026.",
      },
      { type: "h2", text: "What a travel CRM must do" },
      {
        type: "ol",
        items: [
          "**Capture leads from everywhere** — Instagram, WhatsApp, referrals, your website — into one pipeline.",
          "**Manage a visible pipeline** — new → quoted → won, assignable to agents.",
          "**Do travel work, not just sales admin** — itineraries, branded proposals, vouchers.",
          "**Handle money the Indian way** — GST-compliant invoices, INR payments.",
          "**Live on WhatsApp** — send and follow up where clients actually reply.",
          "**Report what matters** — conversion, margins and performance by agent and source.",
        ],
      },
      { type: "h2", text: "Why a generic CRM falls short" },
      {
        type: "p",
        text: "Zoho and HubSpot are excellent general CRMs, but they're not built for travel — no AI itineraries, no travel proposals, no GST tax invoicing, no vouchers. You end up bolting on Canva, Word and a separate invoicing tool. A travel-native CRM does it all in one. See why a [generic CRM doesn't fit travel](/zoho-crm-for-travel-agency-alternative).",
      },
      { type: "h2", text: "How to evaluate the options" },
      {
        type: "ul",
        items: [
          "Can you send a branded proposal on day one, without an onboarding project?",
          "Does it issue **GST-compliant** tax invoices, or just 'bills'?",
          "Is it built for India — INR, WhatsApp, Indian gateways?",
          "Is there a **free trial** so you can test it on a real enquiry?",
          "Compare a few head-to-head — start with our [comparison hub](/compare).",
        ],
      },
      { type: "h2", text: "Where tripOS fits" },
      {
        type: "p",
        text: "tripOS is a [travel agency CRM](/travel-agency-crm) built for India — it captures leads, builds AI itineraries and branded proposals, collects payments and issues GST invoices, with WhatsApp throughout. It's complete [travel agency software](/travel-agency-software-india), from ₹2,499/month with a free 14-day trial.",
      },
      {
        type: "cta",
        label: "Start your free trial",
        href: "/signup",
        text: "Run tripOS as your travel CRM — 14 days free, no card.",
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
