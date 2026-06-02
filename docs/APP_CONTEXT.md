# TripCraft — App Context (for AI agents)

> Paste this whole file into any AI assistant to give it full context on the
> codebase. It describes what the product is, the stack, the architecture, the
> data model, the routes, and the conventions. Last updated: 2026-05.

## 1. What it is

**TripCraft** is an all-in-one SaaS platform for **travel agencies / tour
operators** (India-first). It runs the entire workflow from first enquiry to a
paid, delivered trip:

> Lead capture → AI itinerary → priced quote → branded proposal (PDF + share
> link + WhatsApp) → online acceptance → payment collection → GST invoice →
> vendor operations & vouchers → reports.

Target users: small-to-mid travel agencies and independent travel consultants,
primarily in India. Sold as a per-agency SaaS subscription.

## 2. Tech stack

- **Framework:** Next.js 14.2 (App Router, React Server Components, Server
  Actions), React 18, TypeScript (strict).
- **Auth:** NextAuth v5 (beta) — Credentials provider, JWT sessions. Edge-safe
  config in `src/lib/auth-edge.ts` drives middleware route protection.
- **DB/ORM:** Prisma 5 + PostgreSQL. Multi-tenant (scoped by `agencyId`).
- **UI:** Tailwind CSS + custom "Atelier Pro" design tokens (navy "inkwash" +
  gold), Radix UI primitives, `framer-motion`, `lucide-react`, `sonner` toasts.
- **PDFs:** `@react-pdf/renderer` (proposals, GST invoices, vouchers).
- **AI:** Google Gemini via `@google/genai` (itinerary generation/regeneration).
- **Messaging:** WhatsApp Cloud API (official) — proposals, invoices, reminders,
  templates, automations; inbound webhook.
- **Payments:** Razorpay (payment links, auto-reconciliation, subscriptions,
  webhooks).
- **Email:** Resend (transactional: password reset, invites, contact form) via
  plain REST (no SDK).
- **Validation:** Zod. **Hashing:** bcrypt. **QR:** `qrcode`. **DnD:** dnd-kit.
- **Analytics (optional):** PostHog via REST, consent-gated. **Errors:**
  `reportError` hook (ready for Sentry).
- **Testing/CI:** Vitest + GitHub Actions (`.github/workflows/ci.yml`:
  typecheck → lint → test).

## 3. Architecture & conventions

- **Multi-tenant:** `Agency` is the tenant. A `User` joins agencies via
  `Membership` with a role: `OWNER | STAFF | VIEWER`. Every query is scoped by
  `agencyId`.
- **Permissions:** Central engine in `src/lib/session.ts`:
  - `assertCan(action)` — throws in server actions before any mutation.
  - `can(role, action)` — boolean; client mirror in `src/lib/can-client.ts`
    used to hide UI. Action names use `"domain:verb"` (e.g. `invoice:cancel`).
  - Roles: OWNER = everything; STAFF = day-to-day ops; VIEWER = read-only.
- **Server code layout:**
  - `src/server/actions/*` — Server Actions (mutations; call `assertCan`).
  - `src/server/services/*` — business logic (PDF snapshots, invoicing,
    vouchers, WhatsApp, invoice numbering).
  - `src/lib/*` — shared utils (auth, prisma, email, rate-limit, analytics,
    consent, ai, plans, session).
- **Routing model:** Marketing site at `/` (public). Authenticated app home at
  `/dashboard`. Post-login redirects to `/dashboard`. Signed-in users may still
  browse `/` (shows "Go to dashboard" CTAs).
- **Route protection:** `src/middleware.ts` + `auth-edge.ts` `authorized()`
  allowlist public paths (marketing, `/share/`, `/v/`, `/api/webhooks`,
  `/api/auth`, PDF routes); everything else requires a session.
- **Public sharing:** Proposals/vouchers/invoices are shared via **unguessable
  tokens** (`/share/[token]`, `/v/[token]`, `?token=` on PDF routes). Customer
  views NEVER expose cost/markup/profit — only customer-safe selling prices.
- **Rate limiting:** `src/lib/rate-limit.ts` (in-memory, per-instance) on
  contact form, upload, password reset. (Swap for Upstash in multi-instance
  prod.)
- **SEO/system:** `robots.ts`, `sitemap.ts`, `manifest.ts`, generated
  `opengraph-image.tsx` + `icon.tsx`, global `not-found.tsx` / `error.tsx` /
  `global-error.tsx`.

## 4. Data model (Prisma entities)

**Identity & tenancy:** `User`, `Membership` (role), `Agency`, `AgencySettings`
(branding, proposal theme, GST/legal, WhatsApp/Razorpay config, invoice terms),
`Invite`, `Subscription` (plan/trial/Razorpay), `PasswordResetToken`.

**CRM:** `Contact` (lead→customer pipeline, status, owner), `Traveler`
(traveller/passport profiles), `Activity` (per-contact feed), `Task`
(follow-ups with due dates).

**Trips & proposals:** `Trip` (destination, days, travellers, dates, type),
`Itinerary` (versioned JSON `content`: summary, days[], trip-level
inclusions/exclusions, cover image), `TravelSegment` (flights/trains), `Quote`
(versioned, markup/discount, `shareToken`), `QuoteItem` (cost line items by
category).

**Booking & billing:** `Booking` (status), `Payment`, `PaymentLink` (Razorpay),
`Invoice` + `InvoiceItem` (GST tax invoice; DRAFT→ISSUED→CANCELLED),
`InvoiceCounter` (per-agency, per-FY GST-compliant numbering).

**Operations & vendors:** `Vendor`, `VendorAssignment`, `VendorPayment`,
`Voucher` (per-service, QR, public `/v/[token]`), `OperationTask`.

**Communications:** `WhatsappMessage` (inbound/outbound), `WhatsappTemplate`,
`WhatsappAutomationRule`.

## 5. Feature modules → routes

**Public / marketing:** `/` (landing — hero video + scroll animations,
features, stats, testimonials, comparison, FOMO/pricing, FAQ), `/pricing`,
`/about`, `/security`, `/contact` (working form → email), `/changelog`,
`/legal/{terms,privacy,refund}`, `/help` + `/help/[slug]`.

**Auth:** `/login`, `/signup`, `/forgot-password`, `/reset-password`,
`/accept-invite/[token]`.

**App (authenticated):**
- `/dashboard` — pipeline KPIs, activity feed, follow-ups (personal/agency lens).
- `/contacts` + `/contacts/[id]` — CRM/leads. `/customers` — converted. `/follow-ups`.
- `/trips` + `/trips/new` + `/trips/[id]` + `/trips/[id]/preview` — trips,
  itinerary editor (AI generate/regenerate, per-day + trip-level
  inclusions), quote builder, proposal preview.
- `/bookings`, `/invoices` + `/invoices/[id]`.
- `/vendors` + `/vendors/[id]`, `/operations`.
- `/communications` (+ `/templates`, `/automations`) — WhatsApp.
- `/reports` — funnel, revenue, margins, agent ROI, lead-source ROI.
- `/settings/{agency,proposal,integrations,team,billing}`.
- `/admin` — platform owner console (gated by `PLATFORM_ADMIN_EMAILS`).

**Customer-facing (public, token):** `/share/[token]` (live proposal +
accept), `/v/[token]` (voucher).

**API routes:** `/api/auth/[...nextauth]`, `/api/upload`,
`/api/proposals/[quoteId]/pdf`, `/api/invoices/[id]/pdf`,
`/api/vouchers/[id]/pdf`, `/api/share/[token]/pdf`,
`/api/webhooks/{razorpay,whatsapp}` (+ per-agency variants),
`/api/cron/whatsapp`.

## 6. Permissions (action keys)

Domains: `contact`, `trip`, `quote`, `booking`, `payment`, `invoice`, `vendor`,
`ops`, `whatsapp`, `agency`, `team` — each with verbs like
`:create/:update/:delete/:read` plus specials (`quote:share`, `invoice:issue`,
`invoice:cancel`, `booking:cancel`, `team:setRole`, `agency:settings`).
VIEWER = `*:read` only. STAFF = ops + billing actions (no team/agency admin).
OWNER = all.

## 7. Pricing (the SaaS itself)

- **Trial:** 14 days, full access, no card.
- **Starter:** ₹1,499/mo — solo agents / small teams (core: AI itineraries,
  proposals, quotes, GST invoices, WhatsApp, payments, vendors/vouchers).
- **Pro:** ₹3,999/mo — adds reports/analytics, WhatsApp automations, priority
  support.

## 8. Environment variables (names only)

Core: `DATABASE_URL`, `AUTH_SECRET`/`NEXTAUTH_SECRET`, `AUTH_URL`,
`NEXT_PUBLIC_APP_URL`/`APP_URL`, `CREDENTIALS_KEY`, `PLATFORM_ADMIN_EMAILS`,
`NODE_ENV`.
Email: `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_INBOX`.
AI: `GEMINI_API_KEY`, `GEMINI_MODEL`.
Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
WhatsApp: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_APP_SECRET`,
`WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_API_VERSION`,
`WHATSAPP_DEFAULT_COUNTRY_CODE`, `WHATSAPP_OPS_PHONE`, `WHATSAPP_REVIEW_LINK`,
`WHATSAPP_CRON_SECRET`.
Analytics (optional): `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.

## 9. Known limitations / roadmap candidates

- File uploads write to local `public/uploads` (not durable on serverless /
  multi-instance — needs object storage like S3/R2).
- Rate limiting is in-memory per-instance (needs Upstash/Redis at scale).
- No 2FA, no security audit log, no SOC2; no native mobile app (responsive web +
  PWA manifest only).
- Integrations are first-party only (WhatsApp, Razorpay, Gemini, Resend) — no
  public API, Zapier, GDS/supplier inventory, or accounting export (Tally) yet.
- Test coverage is thin (first tests cover pricing math, permissions, rate
  limiting).
- Some marketing social proof (stats, testimonials, "founding spots") are
  placeholders to replace with real data.

## 10. Useful commands

`npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint` ·
`npm run test` · `npm run db:push` · `npm run db:studio`.
