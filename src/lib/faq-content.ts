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
];
