// Public marketing FAQ — one source of truth, consumed by both the rendered
// accordion (components/marketing/faq.tsx) and the FAQPage JSON-LD on the home
// page (so the answers search engines/AI agents read always match the page).

export type FaqItem = { q: string; a: string };

export const MARKETING_FAQS: FaqItem[] = [
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
    a: "Most agencies that switch were doing exactly that. tripOS replaces the scattered mess with one flow — and you can keep using WhatsApp, except now proposals, invoices and reminders go out branded and tracked.",
  },
  {
    q: "How much does tripOS cost?",
    a: "tripOS starts at ₹2,499/month for Starter and ₹4,999/month for Pro, billed per agency (not per seat). Every plan begins with a 14-day free trial, no credit card required, and you can cancel anytime.",
  },
  {
    q: "How is tripOS different from Sembark or helloGTX?",
    a: "tripOS is AI-first and proposal-led: the enquiry-to-proposal moment that wins the booking sits at the centre, with CRM, GST invoicing, WhatsApp, payments and operations flowing from it. It's built for small and owner-led agencies that want a modern, all-in-one tool with transparent INR pricing and self-serve setup, rather than an enterprise rollout.",
  },
  {
    q: "Can I just use a generic CRM like Zoho or HubSpot instead?",
    a: "You can, but generic CRMs aren't built for travel — no AI itineraries, no travel proposals, no GST tax invoicing and no vouchers, so you end up bolting on several tools. tripOS is travel-native out of the box, so it works on day one without weeks of configuration.",
  },
  {
    q: "Can I send proposals and invoices on WhatsApp?",
    a: "Yes. tripOS uses the official WhatsApp Cloud API to send branded proposals, GST invoices, payment links and reminders where your clients actually reply — with templates and, on Pro, automated follow-ups.",
  },
];
