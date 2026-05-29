// In-app Help centre content. Pure data so the Help pages stay simple and
// adding a new guide is a one-object edit. Icons are referenced by string
// key (resolved in the page) so this file is safe to import anywhere.

export type HelpIconKey =
  | "rocket"
  | "users"
  | "compass"
  | "fileText"
  | "wallet"
  | "messageCircle"
  | "building"
  | "barChart"
  | "creditCard";

export type HelpCategory = {
  id: string;
  title: string;
  description: string;
  icon: HelpIconKey;
};

export type HelpStep = {
  heading?: string;
  body: string;
};

export type HelpArticle = {
  slug: string;
  categoryId: string;
  title: string;
  summary: string;
  steps: HelpStep[];
  tip?: string;
};

export type HelpFaq = {
  q: string;
  a: string;
};

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Set up your agency, team and channels.",
    icon: "rocket",
  },
  {
    id: "contacts",
    title: "Contacts & pipeline",
    description: "Capture leads and move them to booked.",
    icon: "users",
  },
  {
    id: "trips",
    title: "Trips & itineraries",
    description: "Build and shape the journey.",
    icon: "compass",
  },
  {
    id: "quotes",
    title: "Quotes & proposals",
    description: "Price the trip and win the deal.",
    icon: "fileText",
  },
  {
    id: "payments",
    title: "Bookings & payments",
    description: "Confirm bookings and get paid.",
    icon: "wallet",
  },
  {
    id: "comms",
    title: "WhatsApp & messaging",
    description: "Reach customers where they are.",
    icon: "messageCircle",
  },
  {
    id: "operations",
    title: "Operations & vendors",
    description: "Run the trip behind the scenes.",
    icon: "building",
  },
  {
    id: "account",
    title: "Account, plan & billing",
    description: "Team, roles, plans and reports.",
    icon: "creditCard",
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  // --- Getting started ---
  {
    slug: "set-up-your-agency",
    categoryId: "getting-started",
    title: "Set up your agency profile",
    summary:
      "Add your legal name, GSTIN, logo and contact details — these power your invoices and proposals.",
    steps: [
      {
        heading: "Open agency settings",
        body: "Click your avatar (top-right) → Agency settings.",
      },
      {
        heading: "Fill in identity & GST",
        body: "Add your legal/trade name, GSTIN, address and default GST scheme. These are frozen onto each invoice when you issue it.",
      },
      {
        heading: "Upload your logo",
        body: "Your logo appears across proposals (hero, every section, closing) and on invoices and vouchers.",
      },
    ],
    tip: "Set proposal branding separately under avatar → Proposal branding to pick a template, accent colour and which sections customers see.",
  },
  {
    slug: "invite-your-team",
    categoryId: "getting-started",
    title: "Invite your team & set roles",
    summary:
      "Add staff with the right level of access. Owners manage everything; Staff run day-to-day; Viewers are read-only.",
    steps: [
      {
        heading: "Go to Team",
        body: "Avatar → Team (Owners only).",
      },
      {
        heading: "Send an invite",
        body: "Enter the person's email and pick a role. They get an invite link to set their password and join.",
      },
      {
        heading: "Understand the roles",
        body: "Owner: full control incl. billing & team. Staff: all CRM/trip/quote/invoice/WhatsApp actions. Viewer: read-only (good for accountants or advisors).",
      },
    ],
    tip: "Your plan sets how many seats you have — Starter includes 3, Pro includes 15. Upgrade from Billing if you hit the limit.",
  },
  {
    slug: "connect-whatsapp",
    categoryId: "getting-started",
    title: "Connect WhatsApp",
    summary:
      "TripCraft sends proposals, invoices and reminders over the WhatsApp Cloud API.",
    steps: [
      {
        heading: "Set up a Meta Business + WhatsApp number",
        body: "You'll need a verified Meta Business account and a WhatsApp Business phone number.",
      },
      {
        heading: "Add your credentials",
        body: "Your access token, phone number ID and webhook verify token go into the app's environment configuration.",
      },
      {
        heading: "Get templates approved",
        body: "Business-initiated messages outside the 24-hour window need Meta-approved templates. Submit them in your Meta dashboard.",
      },
    ],
    tip: "Until templates are approved you can still reply within 24 hours of a customer message, and use the 'open in WhatsApp' links anywhere a phone number is present.",
  },

  // --- Contacts ---
  {
    slug: "add-and-manage-contacts",
    categoryId: "contacts",
    title: "Add and manage contacts",
    summary:
      "A contact is the person/household you work with — it holds the inquiry, billing identity, travellers and trip history.",
    steps: [
      { heading: "Add a contact", body: "Contacts → New contact. Capture name, phone, email, source and the trip inquiry." },
      { heading: "Switch views", body: "Use Board / Table at the top right. Board is your pipeline kanban; Table is for sorting and scanning." },
      { heading: "Open a profile", body: "Click any contact to see their timeline, trips, tasks, WhatsApp thread and traveller profiles." },
    ],
  },
  {
    slug: "move-contacts-pipeline",
    categoryId: "contacts",
    title: "Move contacts through the pipeline",
    summary:
      "Drag a card between columns on the Board to update its status — it saves automatically.",
    steps: [
      { body: "Open Contacts and stay on the Board view." },
      { body: "Press and drag a card anywhere on the card to another column." },
      { body: "The status updates instantly and is logged on the contact's timeline." },
    ],
    tip: "The whole card is a drag handle. A normal click (without dragging) still opens the contact.",
  },
  {
    slug: "traveller-profiles",
    categoryId: "contacts",
    title: "Traveller profiles & passports",
    summary:
      "Store passports, dates of birth, dietary needs and loyalty numbers once — reuse on every trip.",
    steps: [
      { heading: "Open the Travellers tab", body: "On a contact's profile, open the Travellers tab and add each traveller." },
      { heading: "Capture passport details", body: "Add passport number and expiry — you'll get an amber warning when a passport expires within 6 months, red if expired." },
      { heading: "Link companions", body: "Mark one traveller as primary and add spouse/children/companions to the same contact." },
    ],
  },

  // --- Trips ---
  {
    slug: "create-a-trip",
    categoryId: "trips",
    title: "Create a trip",
    summary:
      "Two ways: the quick wizard for a fresh idea, or a detailed brief when you already know the plan.",
    steps: [
      { heading: "Quick wizard", body: "Trips → New trip → Quick wizard. Answer a few prompts (destination, days, travellers, style) and AI drafts a day-by-day itinerary." },
      { heading: "Detailed brief", body: "Switch to the Detailed brief tab and paste the full plan in plain language (e.g. '4N5D Shimla-Manali, 2N+2N, BB+D, day 1 local…'). AI builds exactly that." },
      { heading: "From a contact", body: "Open a contact and click Create trip to link the trip to them automatically." },
    ],
    tip: "Started a trip without linking a contact? Open it and use 'Link to contact' in the header — it threads the trip into that contact's timeline and reporting.",
  },
  {
    slug: "edit-itinerary",
    categoryId: "trips",
    title: "Edit the day-by-day itinerary",
    summary:
      "Refine the AI draft — hotels, activities, meals and notes — in the Plan editor.",
    steps: [
      { body: "Open the trip → Plan & Quote tab → the itinerary editor." },
      { body: "Edit any day's title, summary, hotel, meal plan and activities. Add or remove days with the day controls." },
      { body: "Use 'Regenerate' on a single day to have AI rewrite just its prose around your facts." },
    ],
  },
  {
    slug: "flights-and-trains",
    categoryId: "trips",
    title: "Add flights & trains",
    summary: "Capture travel segments with times, PNRs and seats.",
    steps: [
      { body: "In the Plan editor, open the Travel / segments section and add a flight or train." },
      { body: "Arrival must be after departure. The day number is derived automatically from the departure date relative to the trip start." },
    ],
  },

  // --- Quotes & proposals ---
  {
    slug: "build-a-quote",
    categoryId: "quotes",
    title: "Build a quote",
    summary:
      "Add line items with costs, set your markup, and the selling price + margin compute live.",
    steps: [
      { heading: "Add line items", body: "In the Quote panel, add items by category (Hotel, Transport, Activities, Flights, Other) with a description and cost." },
      { heading: "Pull from itinerary", body: "Click 'Pull from itinerary' to auto-add hotels, activities and flights from the trip — fill in the costs after." },
      { heading: "Set markup & discount", body: "Adjust markup % and discount (toggle ₹ or %). Selling price, profit and margin update instantly. Toggle Total / Per person." },
    ],
    tip: "Quotes autosave while you edit. Use 'Internal notes' for operator-only context (haggle limits, reminders) — it never reaches the customer.",
  },
  {
    slug: "send-proposal",
    categoryId: "quotes",
    title: "Customise & send the proposal",
    summary:
      "Preview the branded, customer-safe proposal and share it as a link, PDF or on WhatsApp.",
    steps: [
      { body: "On the trip, click 'Preview proposal' to see exactly what the customer will see." },
      { body: "Share the link, download a real PDF, or hit 'Send on WhatsApp'." },
      { body: "The customer can accept the quote online from the shared link." },
    ],
    tip: "Cost, markup and profit never appear on the proposal — only the selling price, broken down by category.",
  },
  {
    slug: "proposal-branding",
    categoryId: "quotes",
    title: "Proposal branding & templates",
    summary: "Pick a template, accent colour and which sections customers see.",
    steps: [
      { body: "Avatar → Proposal branding (Owners)." },
      { body: "Choose a template (Classic / Editorial / Minimal), set an accent colour and cover style." },
      { body: "Toggle sections (at-a-glance, inclusions, terms) and add a closing sign-off. A live preview shows your changes." },
    ],
  },

  // --- Bookings & payments ---
  {
    slug: "accept-quote-booking",
    categoryId: "payments",
    title: "Turn an accepted quote into a booking",
    summary:
      "Accepting a quote creates the booking and seeds vendor assignments automatically.",
    steps: [
      { body: "In the Quote panel, click Accept (or the customer accepts from the shared proposal)." },
      { body: "A booking is created, the trip moves to Booked, and draft vendor assignments are generated from the quote." },
      { body: "The Booking panel appears at the top of the trip with the balance and payment tools." },
    ],
  },
  {
    slug: "record-a-payment",
    categoryId: "payments",
    title: "Record a payment",
    summary: "Log payments you collect offline (cash, bank transfer, UPI).",
    steps: [
      { body: "On the Booking panel, click 'Add payment'." },
      { body: "Enter the amount, type (advance/partial/final) and method. The paid total and progress bar update." },
    ],
  },
  {
    slug: "collect-payment-online",
    categoryId: "payments",
    title: "Collect payment online",
    summary:
      "Generate a Razorpay payment link, send it on WhatsApp, and it's recorded automatically when paid.",
    steps: [
      { heading: "Create a link", body: "On a booking with a pending balance, click 'Collect payment', enter the amount and create the link." },
      { heading: "Send it", body: "Copy the link or hit 'Send on WhatsApp'. The customer pays on Razorpay's secure page." },
      { heading: "Auto-reconcile", body: "When they pay, the payment is recorded against the booking and the balance updates — no manual entry." },
    ],
    tip: "Don't see 'Collect payment'? You need an accepted booking with a balance still owing, and your Razorpay keys configured.",
  },
  {
    slug: "generate-gst-invoice",
    categoryId: "payments",
    title: "Generate a GST invoice",
    summary: "Issue a numbered, GST-compliant tax invoice from a booking.",
    steps: [
      { body: "On the Booking panel, click 'Generate tax invoice' to create a draft." },
      { body: "Review the line items, tax scheme and place of supply, then Issue to lock the invoice number." },
      { body: "Download the PDF or send it on WhatsApp." },
    ],
  },

  // --- Account / plan ---
  {
    slug: "plans-and-billing",
    categoryId: "account",
    title: "Plans, trial & upgrading",
    summary: "Understand your trial, plan limits and how to upgrade.",
    steps: [
      { body: "Every agency starts on a 14-day free trial with full access." },
      { body: "Avatar → Billing & plan shows your current plan, trial countdown and seat usage." },
      { body: "Starter includes 3 seats; Pro includes 15 plus Reports and WhatsApp automations." },
    ],
  },
  {
    slug: "reading-reports",
    categoryId: "account",
    title: "Reading your reports",
    summary:
      "The Reports dashboard (Pro) shows your funnel, revenue, margins, agents and lead sources.",
    steps: [
      { body: "Open Reports from the sidebar and pick a date range." },
      { body: "Review the conversion funnel, revenue trend, lead-source ROI and agent performance." },
    ],
    tip: "Reports is a Pro feature. On Starter you'll see an upgrade prompt.",
  },
];

export const HELP_FAQS: HelpFaq[] = [
  {
    q: "My WhatsApp message won't send",
    a: "Check that WhatsApp is connected (valid access token) and that you're either replying within 24 hours of the customer's last message or using a Meta-approved template. Outside the 24-hour window, free-text messages are blocked by Meta — use the 'open in WhatsApp' link as a fallback.",
  },
  {
    q: "I can't see the 'Collect payment' button",
    a: "It only appears on a booking that has a pending balance — so the quote must be accepted (creating a booking) and not fully paid. It also requires your Razorpay keys to be configured; until then it shows a setup hint.",
  },
  {
    q: "Reports is locked / asking me to upgrade",
    a: "Reports is a Pro feature. You'll have access during your trial; on the Starter plan it's gated. Upgrade from avatar → Billing & plan.",
  },
  {
    q: "A page won't load or shows an error",
    a: "First refresh the page. If it persists, sign out and back in. If you're self-hosting in development, a stale build cache can cause this — restart the dev server. Still stuck? Contact support with the page URL.",
  },
  {
    q: "I forgot my password",
    a: "On the sign-in page, click 'Forgot password?', enter your email, and follow the reset link we send (valid for 1 hour).",
  },
  {
    q: "A trip isn't showing in Reports or a contact's history",
    a: "The trip probably isn't linked to a contact. Open the trip and use 'Link to contact' in the header — that threads it into the contact's timeline, lifetime value and source attribution.",
  },
  {
    q: "Dragging a contact card did nothing",
    a: "Make sure you're on the Board view (not Table). Press and drag anywhere on the card to another column; a quick click just opens the contact.",
  },
];

export function articleBySlug(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}

export function categoryById(id: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((c) => c.id === id);
}

export function articlesInCategory(categoryId: string): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.categoryId === categoryId);
}
