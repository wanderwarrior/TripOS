# TripOS Product Strategy & Roadmap (Phase 6)

Principle: at this stage, **product exists to drive activation, conversion,
retention and lock-in — not feature breadth.** TripOS already spans CRM, AI
itineraries, proposals, GST invoicing, payments, vendors/vouchers, analytics.
That's enough surface area. The job now is depth on the few things that make
agencies *activate, pay, stay, and refer*.

---

## 1. Feature prioritization matrix
Scored 1–5. **Priority = (Revenue + Retention + Moat) × Reach ÷ Effort.** Build top-down.

| Feature | Revenue | Retention | Moat | Effort | Verdict |
|---|---|---|---|---|---|
| **Template/sample itinerary library** (by destination) | 4 | 4 | 2 | Low | 🟢 BUILD NOW — biggest activation lift |
| **Excel/CSV lead import** | 4 | 3 | 2 | Low | 🟢 NOW — kills #1 switching friction |
| **In-app review/NPS capture loop** | 5 | 2 | 4 | Low | 🟢 NOW — fuels AI-discoverability moat |
| **In-app referral mechanic** | 4 | 3 | 3 | Low | 🟢 NOW — cheapest growth channel |
| **WhatsApp send polish** (2-tap, reliable) | 4 | 4 | 3 | Med | 🟢 NOW — the demo mic-drop |
| **Reusable vendor/supplier database** | 2 | 4 | 4 | Med | 🟡 90d — lock-in |
| **Saved/cloneable proposal templates** | 3 | 5 | 4 | Med | 🟡 90d — lock-in + speed |
| **Payment reconciliation depth** | 3 | 4 | 3 | Med | 🟡 90d |
| **Per-seat expansion pricing** | 5 | 3 | 3 | Med | 🟡 6mo — ARPU |
| **Agent-performance analytics polish** | 3 | 4 | 3 | Med | 🟡 6mo — Persona C retention |
| **Proposal theme marketplace (UGC)** | 3 | 3 | 5 | High | ⚪ 12mo — network seed |
| **Agent↔supplier/DMC network** | 4 | 5 | 5 | High | ⚪ 12mo — the real moat |
| **Anonymized industry-data product** | 2 | 2 | 5 | Med | ⚪ 12mo — data moat |
| **Native GDS/inventory booking** | 1 | 2 | 1 | V.High | ❌ NEVER — integrate, don't build |
| **Marketing-automation suite (HubSpot-chasing)** | 1 | 1 | 1 | High | ❌ NEVER |

## 2. Revenue impact analysis
- **Activation features (templates, import, WhatsApp polish)** raise trial→paid % — the single biggest revenue lever pre-PMF. A 10pt conversion lift beats any new module.
- **Per-seat expansion** is your natural ARPU growth — Persona C grows team → pays more. Build once base is stable.
- **Referral mechanic** lowers CAC to ~zero for a chunk of growth.

## 3. Retention impact analysis
Churn at this stage = **failure to activate**, not missing features. Fix order:
1. First-proposal-sent within 48h (templates + import + onboarding).
2. Their data/brand/money living in tripOS (lock-in features) → leaving gets painful.
3. Multi-seat (team works there) → org-level stickiness.

## 4. Expansion revenue opportunities
- **Seats** (Starter 3 → Pro 15 → Scale unlimited) — primary path.
- **Usage tiers** (AI itineraries/month).
- **Scale tier** for multi-branch/DMC (already an anchor on pricing — productize it).
- **Premium proposal themes** (marketplace) — small, high-margin.
- **Add-ons:** custom domain, WhatsApp automation volume.

## 5. Network-effect opportunities (ranked)
1. **Agent ↔ supplier/DMC network** — agents + DMCs transact on tripOS (rate sharing, package distribution). Each new agent makes tripOS more valuable to suppliers and vice versa. **The biggest long-term prize.**
2. **Referral/community network** — more agents → more shared templates, leads, knowledge.
3. **Proposal-theme/itinerary marketplace (UGC)** — agents create, everyone benefits.

## 6. Data-moat opportunities
Aggregate, anonymized platform data no competitor has: conversion rates, response-time→close correlation, most-sold destinations, seasonal pricing. Powers:
- **Industry reports** (backlinks + AI-citation + press — ties to content strategy).
- **In-product smart suggestions** ("trips like this convert better with X").
- A future **benchmark data product**. Compounds with every customer.

## 7. AI-moat opportunities
The AI itinerary feature is copyable; the *AI advantage* is not, if you build:
- **Proprietary itinerary/pricing data** → better, India-specific AI suggestions than a raw LLM call.
- **Learning loop:** which AI itineraries get accepted/edited → improve drafts over time.
- **Workflow AI:** draft follow-ups, summarize enquiries, suggest next action — embedded in the data only you have.
> Don't compete on "we use AI" (everyone will). Compete on "AI trained on how Indian agencies actually win bookings."

---

## Roadmaps (by revenue impact)

### 30-day — ACTIVATION & PROOF
- Template/sample itinerary library (destination starters).
- Excel/CSV lead import.
- In-app NPS → review-capture loop (wire to `docs/sales/review-capture-system.md`).
- In-app referral mechanic ("invite an agent, both get a month free").
- WhatsApp send polish (2-tap, reliable).
> Goal: trial→paid % up, first reviews flowing, word-of-mouth on.

### 90-day — RETENTION & LOCK-IN
- Saved/cloneable proposal templates.
- Reusable vendor/supplier database.
- Payment reconciliation depth.
- Onboarding checklist tied to the activation checklist (sales-engine.md).
- Ship first 3–5 case studies; public docs/changelog.
> Goal: churn down, switching costs up, discoverability up.

### 6-month — ARPU & SEGMENT DEPTH
- Per-seat expansion pricing + Scale tier productized.
- Agent-performance analytics polish (Persona C).
- Premium proposal themes (early marketplace).
- Tally/Zoho Books + calendar integrations (partnership-driven).
- First "State of Indian Travel Agencies" report (data moat).
> Goal: ARPU up, Persona C retained, partner integrations live.

### 12-month — DEFENSIBILITY & NETWORK
- Pilot agent↔supplier/DMC network (2–3 DMCs).
- Proposal-theme/itinerary marketplace (UGC).
- AI learning loop + smart suggestions on proprietary data.
- Second industry report; benchmark data feature.
> Goal: a moat competitors can't sprint past — network + data + AI + brand.

---

## What NOT to build (defends focus)
- Native flight/hotel GDS/inventory booking (integrate).
- Consumer-facing OTA / B2C trip planner.
- HubSpot-style marketing-automation suite.
- Multi-vertical expansion (real-estate CRM etc.).
- Heavy accounting/ERP (integrate with Tally/Zoho Books).
- Deep B2B rate-loading/contracting modules (Sembark/helloGTX's tarpit — irrelevant to owner-led ICP).
