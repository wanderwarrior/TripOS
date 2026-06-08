# tripOS — App Context (for AI agents)

> Paste this whole file into any AI assistant to give it full context on the
> codebase. It describes what the product is, the stack, the architecture, the
> data model, the routes, and the conventions. Last updated: 2026-06.

## 1. What it is

**tripOS** is an all-in-one SaaS platform for **travel agencies / tour
operators** (India-first). It runs the entire workflow from first enquiry to a
paid, delivered trip:

> Lead capture → AI itinerary → priced quote → branded proposal (PDF + share
> link + WhatsApp + Gmail) → online acceptance → payment collection → GST
> invoice → vendor operations & vouchers → reports.

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
- **Object storage:** Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3` +
  presigned uploads — logos, proposal cover images, hero video. Falls back to
  local `public/uploads` in dev when R2 isn't configured (`src/lib/r2.ts`).
- **Messaging:** WhatsApp Cloud API (official) — proposals, invoices, reminders,
  templates, automations; inbound webhook.
- **Google Workspace (per-agency, opt-in):** send proposals from the agency's
  own Gmail and file PDFs into their Drive. Standalone OAuth (offline refresh
  token), non-restricted scopes only (`gmail.send`, `drive.file`,
  `userinfo.email`). See `docs/google-integration.md`.
- **Segment enrichment:** flight lookup (AeroDataBox) + train lookup (eRail,
  keyless) auto-fill travel segments. See `docs/segment-enrichment.md`.
- **Payments:** Razorpay (payment links, auto-reconciliation, subscriptions,
  webhooks).
- **Email:** Resend (transactional: password reset, invites, contact form) via
  plain REST (no SDK).
- **Validation:** Zod. **Hashing:** bcrypt. **Token encryption:** `crypto.ts`
  (AES, for stored OAuth/refresh tokens). **QR:** `qrcode`. **DnD:** dnd-kit.
- **Analytics (optional):** PostHog via REST, consent-gated. **Errors:**
  `reportError` hook (ready for Sentry).
- **Testing/CI:** Vitest + GitHub Actions (`.github/workflows/ci.yml`:
  typecheck → lint → test).

## 3. Architecture & conventions

- **Multi-tenant:** `Agency` is the tenant. A `User` joins agencies via
  `Membership` with a role: `OWNER | STAFF | VIEWER`. Every query is scoped by
  `agencyId`. Signup is open and self-serve (`Agency.status` defaults to
  `APPROVED`; the legacy `/pending` route now just redirects into the app).
- **Permissions:** Central engine in `src/lib/session.ts`:
  - `assertCan(action)` — throws in server actions before any mutation.
  - `can(role, action)` — boolean; client mirror in `src/lib/can-client.ts`
    used to hide UI. Action names use `"domain:verb"` (e.g. `invoice:cancel`).
  - Roles: OWNER = everything; STAFF = day-to-day ops; VIEWER = read-only.
- **Server code layout:**
  - `src/server/actions/*` — Server Actions (mutations; call `assertCan`).
  - `src/server/services/*` — business logic (PDF snapshots, invoicing,
    vouchers, WhatsApp, invoice numbering, subscription/billing,
    account-provisioning, search, integrations, operations dashboard).
  - `src/lib/*` — shared utils (auth, prisma, email, crypto, rate-limit,
    analytics, consent, ai, plans, session, r2, video, notify, google/,
    enrichment/, whatsapp/, plus content modules for blog/help/faq/SEO).
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
  `opengraph-image.tsx` + `icon.tsx`, JSON-LD via `structured-data.ts`,
  programmatic SEO landing pages (`seo-landings.ts`), a content blog
  (`blog-content.ts`), global `not-found.tsx` / `error.tsx` / `global-error.tsx`.

## 4. Data model (Prisma entities)

**Identity & tenancy:** `User`, `Membership` (role), `Agency` (`status`:
APPROVED/…), `AgencySettings` (branding, proposal theme, GST/legal,
WhatsApp/Razorpay/AeroDataBox config, invoice terms), `Invite`, `Subscription`
(plan/trial/Razorpay), `PasswordResetToken`, `GoogleConnection` (per-agency
OAuth tokens + cached Drive root), `PlatformSetting` (global platform config).

**Marketing inbound:** `DemoRequest` (demo/lead capture from the site),
`ContactMessage` (contact-form submissions).

**CRM:** `Contact` (lead→customer pipeline, status, owner), `Traveler`
(traveller/passport profiles), `Activity` (per-contact feed), `Task`
(follow-ups with due dates).

**Trips & proposals:** `Trip` (destination, days, travellers, dates, type,
`driveFolderId`), `Itinerary` (versioned JSON `content`: summary, days[],
trip-level inclusions/exclusions, cover image), `TravelSegment`
(flights/trains, enrichable), `Quote` (versioned, markup/discount,
`shareToken`), `QuoteItem` (cost line items by category).

**Booking & billing:** `Booking` (status), `Payment`, `PaymentLink` (Razorpay),
`Invoice` + `InvoiceItem` (GST tax invoice; DRAFT→ISSUED→CANCELLED, CGST/SGST
vs IGST scheme), `InvoiceCounter` (per-agency, per-FY GST-compliant numbering).

**Operations & vendors:** `Vendor`, `VendorAssignment`, `VendorPayment`,
`Voucher` (per-service, QR, public `/v/[token]`), `OperationTask`.

**Communications:** `WhatsappMessage` (inbound/outbound), `WhatsappTemplate`,
`WhatsappAutomationRule`.

## 5. Feature modules → routes

**Public / marketing:** `/` (landing — hero video + scroll animations,
features, stats, testimonials, comparison, FOMO/pricing, FAQ), `/pricing`,
`/about`, `/security`, `/contact` (working form → email), `/changelog`,
`/blog` + `/blog/[slug]`, SEO landing pages
(`/travel-agency-software-india`, `/travel-agency-crm`,
`/travel-proposal-software`, `/gst-invoicing-for-travel-agents`),
`/legal/{terms,privacy,refund}`, `/help` + `/help/[slug]`.

**Auth:** `/login`, `/signup`, `/forgot-password`, `/reset-password`,
`/accept-invite/[token]`. (`/pending` is a legacy redirect into `/dashboard`.)

**App (authenticated):**
- `/dashboard` — pipeline KPIs, activity feed, follow-ups (personal/agency lens).
- `/contacts` + `/contacts/[id]` — CRM/leads. `/customers` — converted. `/follow-ups`.
- `/trips` + `/trips/new` + `/trips/[id]` + `/trips/[id]/preview` — trips,
  itinerary editor (AI generate/regenerate, per-day + trip-level
  inclusions), quote builder, proposal preview (with Save-to-Drive / Email-via-
  Gmail when Google is connected).
- `/bookings`, `/invoices` + `/invoices/[id]`.
- `/vendors` + `/vendors/[id]`, `/operations`.
- `/communications` (+ `/templates`, `/automations`) — WhatsApp.
- `/reports` — funnel, revenue, margins, agent ROI, lead-source ROI.
- `/settings/{agency,proposal,integrations,team,billing}`.
- `/admin` — platform owner console (gated by `PLATFORM_ADMIN_EMAILS`).

**Customer-facing (public, token):** `/share/[token]` (live proposal +
accept), `/v/[token]` (voucher).

**API routes:** `/api/auth/[...nextauth]`, `/api/upload`, `/api/upload/video`
(+ `/presign`), `/api/proposals/[quoteId]/pdf`, `/api/invoices/[id]/pdf`,
`/api/vouchers/[id]/pdf`, `/api/share/[token]/pdf`,
`/api/integrations/google/{connect,callback}`,
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

Source of truth: `src/lib/plans.ts`. Annual = ~2 months free vs monthly.

- **Trial:** 14 days, full access (everything in Pro), up to 15 seats, no card.
- **Starter:** ₹4,999/mo (₹49,990/yr) standard — solo agents / small teams. Up
  to **3 seats**, **100 AI itineraries/mo**, branded proposals & PDFs, quotes,
  bookings, GST invoices, WhatsApp messaging, online payment collection,
  vendors/vouchers.
- **Pro:** ₹9,999/mo (₹99,990/yr) standard — growing agencies. Up to **15
  seats**, **unlimited AI itineraries**, plus reports/analytics, WhatsApp
  automations, priority support.
- **Founding offer (first 100 paying agencies):** 50% off, **locked for life** —
  Starter ₹2,499/mo, Pro ₹4,999/mo. Real spots-left counter + fixed deadline on
  the landing/pricing pages. Config in `src/lib/founding.ts`; live count in
  `src/server/services/founding.ts` (counts ACTIVE/PAST_DUE subscriptions).
  ₹2,499 is the price floor — nothing sells below it.

## 8. Environment variables (names only)

Core: `DATABASE_URL`, `AUTH_SECRET`/`NEXTAUTH_SECRET`, `AUTH_URL`,
`NEXT_PUBLIC_APP_URL`/`APP_URL`, `CREDENTIALS_KEY` (encrypts stored OAuth
tokens), `PLATFORM_ADMIN_EMAILS`, `NODE_ENV`.
Email: `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_INBOX`.
AI: `GEMINI_API_KEY`, `GEMINI_MODEL`.
Storage (Cloudflare R2): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` (omit all → local
`public/uploads` fallback in dev).
Google Workspace: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
Enrichment: `AERODATABOX_API_KEY` (flights; server-wide fallback — agencies can
set their own key in Settings. Trains via eRail need no key).
Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
WhatsApp: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_APP_SECRET`,
`WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_API_VERSION`,
`WHATSAPP_DEFAULT_COUNTRY_CODE`, `WHATSAPP_OPS_PHONE`, `WHATSAPP_REVIEW_LINK`,
`WHATSAPP_CRON_SECRET`.
Analytics (optional): `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.

## 9. Known limitations / roadmap candidates

- Rate limiting is in-memory per-instance (needs Upstash/Redis at scale).
- No 2FA, no security audit log, no SOC2; no native mobile app (responsive web +
  PWA manifest only).
- Integrations are first-party only (WhatsApp, Razorpay, Gemini, Resend, Google
  Gmail/Drive, AeroDataBox/eRail) — no public API, Zapier, GDS/supplier
  inventory, or accounting export (Tally) yet.
- Enrichment uses free-tier/unofficial sources (AeroDataBox monthly quota; eRail
  is keyless but unofficial) — treat times as a strong draft, operator edits.
- Inbound supplier-email parsing (Gmail `gmail.readonly`) is deferred — it's a
  restricted scope requiring a paid Google CASA assessment.
- Test coverage is thin (first tests cover pricing math, permissions, rate
  limiting).
- Some marketing social proof (stats, testimonials, "founding spots") are
  placeholders to replace with real data.

## 10. Useful commands

`npm run dev` · `npm run build` · `npm run typecheck` · `npm run lint` ·
`npm run test` · `npm run db:push` · `npm run db:studio`.
Demo/seed scripts live in `scripts/` (e.g. `seed-dashboard-demo.mjs`,
`seed-wanderwarrior-demo.mjs`, `seed-video-demo.mjs`).
