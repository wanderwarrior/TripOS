# TripCraft

AI-powered itinerary and quotation builder for premium travel agents in India.
Phase 1 MVP — built with Next.js 14 (App Router), TypeScript, Tailwind, ShadCN, Framer Motion, OpenAI, Prisma + Postgres.

## Flow

1. Dashboard — landing with previous trips and a "Create new trip" CTA.
2. Wizard (`/trips/new`) — three-step form (Where → When → Who).
3. Workspace (`/trips/[id]`) — editable AI-generated day-wise itinerary alongside a pricing builder (line items + markup → live cost / selling / profit).
4. Preview (`/trips/[id]/preview`) — premium proposal layout with subtle scroll animations. Share via link or print to PDF (`window.print()` against a tuned print stylesheet).

Phase 1 uses a single demo user (no auth) so the flow stays fast.

## Setup

```bash
npm install
cp .env.example .env       # fill DATABASE_URL and OPENAI_API_KEY
npm run db:push            # creates tables
npm run dev
```

Without `OPENAI_API_KEY`, itinerary generation falls back to a mock so the rest of the flow remains usable.

## Structure

```
src/
  app/                 # App Router pages
    page.tsx           # Dashboard
    trips/new/         # Wizard
    trips/[id]/        # Workspace + preview
  components/
    ui/                # ShadCN primitives (button, card, input, label, select, textarea, skeleton)
    trip-wizard.tsx    # Multi-step form
    itinerary-editor.tsx
    pricing-builder.tsx
    preview-renderer.tsx
    preview-actions.tsx
    trip-card.tsx
    page-shell.tsx
  server/actions.ts    # Server actions (create, regenerate, save itinerary/pricing)
  lib/                 # prisma, openai, utils
  types/index.ts       # PricingItem + computePricing
prisma/schema.prisma   # User, Trip, Itinerary, Pricing
```

## Design tokens

- Navy `#0B1C2C`, Sand `#C8A96A`, Ivory `#F8F6F2`, Ink `#1A1A1A`
- Inter for body, Playfair Display for headings
- Rounded `2xl`, soft shadows, generous whitespace
- Framer Motion for entry, step transitions, and scroll reveal
