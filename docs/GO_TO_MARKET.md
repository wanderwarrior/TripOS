# tripOS — Go-To-Market Plan: 500 Paying Agencies in 6 Months

> Owner: Founder · Last updated: 2026-06-08
> Goal: **500 paying agencies** (net, retained) within 6 months.
> Product: All-in-one SaaS for Indian travel agencies. Lead → AI itinerary →
> branded WhatsApp proposal → online accept → Razorpay payment → GST invoice →
> vendor ops → reports.

---

## 0. The number, decoded

Blended ARPU assumption — founding-cohort prices (60% Starter @ ₹2,499 + 40%
Pro @ ₹4,999) ≈ **₹3,499/mo**. (Post-founding standard is ₹4,999 / ₹9,999, so
non-founding ARPU runs higher.)

| Milestone | Customers | MRR | ARR run-rate |
|---|---|---|---|
| Founding cohort | 100 | ₹3.5L | ₹42L |
| 6-month goal | **500** | **₹17.5L** | **₹2.1 Cr** |

To **net 500** we must **gross ~560** (assume ~6%/mo early churn). Everything
below is sized to that.

### Funnel model (the spine of the whole plan)

> **Reality check on trial→paid (verified benchmark).** A *no-card* free trial
> (ours) converts at a median of only **4–6% ("good") to 10–15% ("great")** —
> card-required trials hit ~30%, but at the cost of ~5× fewer trial starts
> (ChartMogul SaaS Conversion Report). So **30% is a *demo'd / hand-onboarded*
> number, not a self-serve one.** We run a **blended** model below: high
> conversion on the trials we personally babysit to both activation gates, low
> conversion on self-serve. As self-serve volume grows in months 4–6, blended
> trial→paid drifts down toward ~15% unless product-led onboarding holds it up.

Working backwards from 560 gross paid (blended trial→paid **~18%**, weighted to
hand-onboarded trials early, self-serve later):

- Trial → Paid: **~30%** for demo'd/babysat trials, **~10–12%** self-serve →
  blended **~18%** → need **~3,100 trial starts**.
- Qualified demo/lead → Trial start: **40%** → need **~7,800 qualified leads**.
- Touch → qualified lead: **~8%** → need **~97,000 quality touches** over 6 months
  (~16,000/mo, ~540/day across all channels). Aggressive but feasible for a
  WhatsApp-first Indian niche where the addressable base is 1L+ agents — and the
  reason the activation-babysitting (below) is non-negotiable: it's the only
  lever that keeps a no-card funnel near 30% instead of 10%.

Two activation gates decide whether trials convert (track these religiously):
1. **First AI itinerary generated** (the magic moment) within 24h of signup.
2. **First proposal sent to a real client over WhatsApp** within 72h.
Trials that hit both convert at 50–60%; trials that hit neither convert <8%.

---

## 1. Positioning

### One-liner
**"tripOS turns a client's trip enquiry into a branded proposal, a paid
booking, and a GST invoice — without leaving WhatsApp."**

### Category
"Run-your-whole-agency" software for Indian travel agents — not just an itinerary
builder, not just a CRM. The wedge is the **proposal**; the moat is the **full
workflow** (payments + GST + ops) that locks them in.

### Ideal Customer Profile (ICP), in priority order
1. **Solo / 2–5 person outbound & custom-tour agencies** (Starter): do
   honeymoon, family, group, pilgrimage, international FIT packages. Live in
   WhatsApp, build proposals in Word/Canva/PDF, chase payments by hand. **Primary
   target — biggest, fastest, most underserved.**
2. **Growing agencies 5–15 staff** (Pro): want reports, agent performance,
   automations. Higher ARPU, stickier, better referrers.
3. **Destination specialists & DMCs** doing high-volume quoting.

Disqualify (for now): pure OTAs, corporate-travel TMCs needing GDS, agencies
that only resell fixed packages and never quote.

### Jobs To Be Done → feature mapping (use these as ad/headline angles)
| Their pain (their words) | What we say |
|---|---|
| "Proposals take half a day in Word and still look generic." | AI itinerary + white-label proposal in minutes. |
| "Leads slip across WhatsApp, notebooks and memory." | One pipeline; every enquiry tracked to ₹. |
| "I chase payments manually and dread GST season." | Razorpay links auto-reconcile; GST invoices in one click. |
| "No idea which agent/source/month makes money." | Reports: funnel, margins, agent & lead-source ROI. |

### Competitive framing (don't name-bash; contrast)
- **vs Word / Canva / PDF templates:** they make a document; we run the deal end
  to end and the client *accepts and pays* inside it.
- **vs generic CRM (Zoho/HubSpot):** built for travel — itineraries, vouchers,
  GST, vendor ops — not a blank CRM you must configure for weeks.
- **vs Excel + manual:** the margin/agent/source visibility you literally cannot
  get from spreadsheets.
- **vs foreign itinerary tools (e.g. global trip builders):** India-first — GST
  invoicing, Razorpay, official WhatsApp, INR pricing, ₹2,499 not $99.

### The proof points (already on the site — make them real, fast)
GST-compliant invoicing · Official WhatsApp Cloud API · Set up in minutes ·
"Proposals so good clients reply before they read the price."

---

## 2. The Pitch (every format you'll need)

### 30-second elevator
> "You know how building a travel proposal eats half your day in Word, and then
> you're chasing the client on WhatsApp and the payment by hand? tripOS does
> the whole thing — describe the trip, AI drafts a day-by-day itinerary, you
> price it, and send a branded proposal on WhatsApp. The client accepts and pays
> online, and your GST invoice generates itself. Agents close faster and finally
> see which trips actually make money. ₹2,499 a month, 14-day free trial, no card."

### Cold WhatsApp / Instagram DM (first touch — keep it short, human)
> Hi {Name} 👋 I saw {agency} does great {Kerala/Bali/honeymoon} packages. Quick
> one — how long does it take you to make a client proposal right now?
>
> We built tripOS for agencies like yours: type the trip → AI makes the
> day-wise itinerary → you send a branded proposal on WhatsApp → client accepts &
> pays online → GST invoice auto-generates. Most agents cut proposal time from
> hours to ~10 min.
>
> Can I send you a 90-sec video, or want a free 14-day trial (no card)?

### Cold call opener (Indian agency owner)
> "Namaste {Name}, this is {you} from tripOS. 30 seconds — is now okay? …
> We help travel agencies turn an enquiry into a paid booking without leaving
> WhatsApp: AI itinerary, branded proposal, online payment, GST invoice. Agencies
> like yours are saving a few hours per proposal. Can I show you a 15-minute demo
> this week — Thursday or Friday better?"

### The demo script (15 min — this is where deals are won)
Goal: trigger the two "aha" moments live, using *their* real upcoming trip.
1. **(1 min) Frame:** "I'll build a real proposal for a trip you're quoting right
   now. Give me a destination and rough brief."
2. **(3 min) AI itinerary:** type their brief → generate day-by-day → edit one
   day, swap a hotel. "This took 10 seconds; how long in Word?"
3. **(3 min) Quote + margin:** add line items, set markup. Show **cost / selling
   / profit** live. "You see your margin; the client never will."
4. **(3 min) Branded proposal on WhatsApp:** send to *your own* number live →
   open it on phone → "Accept" → show it flip to a booking.
5. **(2 min) Get paid + GST:** generate Razorpay link, show auto-reconcile, then
   one-click **GST invoice**.
6. **(2 min) The money slide:** Reports — funnel, margins, agent & source ROI.
7. **(1 min) Close:** "Want me to set this up on your real trips? I'll start your
   14-day trial now and import your first lead with you." → *start the trial on
   the call.*

### Objection handling
| Objection | Response |
|---|---|
| "Too expensive." | "One extra closed booking a month pays for a year. And founding price locks in lower — forever." |
| "I already use Word/Canva." | "Keep it for one more week. Run *one* live proposal through tripOS this week and compare. If Word wins, stay." |
| "My clients are on WhatsApp, not email." | "Exactly why we built on official WhatsApp Cloud API — proposals, reminders, payment links, all in chat." |
| "I'm not techie." | "If you can type a WhatsApp message you can run this. I'll do your first proposal *with* you on a call." |
| "Is my data / client list safe?" | "Per-agency isolation, customer views never show your cost or margin, payments via Razorpay. Here's our /security page." |
| "GST is complicated for me." | "We do per-FY compliant invoice numbering automatically. Your CA will love you." |
| "Let me think about it." | "Fair — trial's free, no card. Worst case you lose nothing. Shall I start it now so you can try it on today's enquiry?" |

### Founding offer (urgency engine for months 1–2)
**"Founding Agency" — first 100 paying agencies:**
- **50% off, price-locked for life** (Starter ₹2,499, Pro ₹4,999 forever — vs
  ₹4,999 / ₹9,999 standard). ₹2,499 is the floor; nothing sells below it.
- Priority white-glove onboarding (we set up branding + import first leads).
- "Founding Agency" badge + roadmap input + named in launch posts.
- Free WhatsApp template + branding setup (₹X value).
Scarcity is real (100 cap) and visible (counter on pricing page). This both
drives early revenue and manufactures the testimonials the site currently lacks.

---

## 3. Channel Strategy — where the 560 come from

Allocation by channel (gross paid target ≈ 560). Founder-led + community do the
heavy lifting early; content/SEO/referral compound late.

| Channel | Paid target | Primary months | Cost |
|---|---|---|---|
| Founder-led outbound (WhatsApp/call/LinkedIn) | 150 | 1–6 | Time |
| Travel-agent communities (FB/Telegram/WhatsApp groups) | 120 | 1–6 | Time |
| Associations & events (TAAI/TAFI/IATO/ADTOI/OTOAI) | 70 | 2–6 | Low–med |
| Referral program (agent-gets-agent) | 80 | 3–6 | Reward cost |
| Content / SEO / YouTube / Instagram | 60 | 2–6 | Time + small |
| Partnerships (B2B aggregators, DMCs, CAs, institutes) | 50 | 3–6 | Rev-share |
| Paid ads (Meta + Google, tightly targeted) | 30 | 2–6 | ₹ budget |
| **Total** | **560** | | |

### 3.1 Founder-led outbound (the engine — months 1–6)
The fastest path early. You personally talk to agency owners.
- **Source lists:** Justdolist/IndiaMART travel-agency listings, Google Maps
  "travel agency in {city}" scrapes, IATA/TAAI member directories, Instagram
  bios (#travelagent #honeymoonpackages #keralatourism), B2B portals' partner
  agent lists.
- **Cadence per lead (7-touch over 12 days):** Day 0 WhatsApp DM → Day 1 90-sec
  video → Day 3 call → Day 5 case-study/testimonial → Day 8 "start your trial?" →
  Day 10 limited founding-spots nudge → Day 12 break-up ("closing your spot").
- **Daily target:** 30–40 fresh touches + follow-ups. Track every lead **inside
  tripOS's own CRM** (dogfood + screenshots for content).
- **Personalize on their niche** (honeymoon vs pilgrimage vs adventure) — generic
  blasts die in WhatsApp.

### 3.2 Travel-agent communities (months 1–6)
India's travel-agent world lives in groups. Join, give value for 2 weeks, *then*
pitch.
- **Facebook groups:** "Travel Agents of India", "Tour Operators India",
  "Travel Agent Network", regional ("Kerala Travel Agents", "North India Tour
  Operators"). Dozens with 10k–100k members.
- **Telegram/WhatsApp B2B groups:** agent groups run by B2B aggregators (TBO,
  TravClan, Tripjack) and DMCs.
- **Play:** post genuinely useful things (free itinerary template, "GST for
  travel agents" cheat-sheet, a 60-sec proposal demo). Soft CTA to trial. DM
  people who engage. Never spam-drop links cold — admins ban that.
- **Host an "Ask me anything: faster proposals" thread** weekly.

### 3.3 Associations & events (months 2–6)
- **Bodies:** TAAI, TAFI, IATO, ADTOI, OTOAI, ETAA + regional chapters.
- **Plays:** sponsor/attend chapter meets (cheap, high-intent), get a 10-min demo
  slot, become an "approved tech partner," run a workshop ("Build a proposal in
  10 minutes") at a chapter meeting. Offer chapter members a special code.
- **Trade shows:** SATTE, OTM Mumbai, GPS (Great Indian Travel Bazaar), regional
  travel marts — a small booth or even just walking the floor with the live demo
  on a tablet.

### 3.4 Referral program (months 3–6 — compounds)
Travel agents trust other agents more than ads.
- **Offer:** refer an agency that subscribes → **1 month free** for both (or
  ₹1,000 credit each). Stack it: 3 successful referrals = 3 months free.
- Build a one-tap "Refer an agency" link inside the app; pre-fill a WhatsApp
  share message. Surface it after their first closed booking (peak goodwill).
- **Spotlight referrers** publicly; create friendly leaderboards in groups.

### 3.5 Content / SEO / social (months 2–6 — compounds)
Own the searches agents actually make.
- **SEO pillar pages:** "travel agency software India", "GST invoice format for
  travel agency", "free travel itinerary template", "how to make a travel
  proposal", "best CRM for travel agents". Each with a free downloadable + trial
  CTA.
- **Free lead magnets:** itinerary template, GST-invoice template, quotation
  template — gated by email → drip sequence.
- **YouTube/Instagram Reels:** "Build a 7-day Bali proposal in 2 minutes",
  before/after (Word vs tripOS), "₹0 to first WhatsApp proposal". Short,
  screen-recorded, fast. Post 4–5 reels/week.
- **Comparison/"vs" pages** for SEO long-tail.

### 3.6 Partnerships (months 3–6)
- **B2B travel aggregators** (TBO, TravClan, Tripjack, hotel/flight bedbanks):
  co-marketing to their agent base; we're the front-office to their inventory
  back-office — complementary, not competing.
- **DMCs & ground handlers:** they want agents to send them clean, branded
  proposals → they recommend us.
- **Chartered Accountants / Tally consultants** serving agencies: referral fee
  for the GST-invoicing angle.
- **IATA/travel-training institutes** (IITC, Trade Wings, college tourism depts):
  teach tripOS to new agents → they adopt the tool they learned on. Free for
  students/educators.

### 3.7 Paid ads (months 2–6 — small, surgical, measured)
- **Meta (FB/IG):** interest + lookalike targeting on travel-agency owners;
  creative = the 60-sec proposal reel; objective = trial signups. Start
  ₹500–1,000/day, scale only what beats target CAC.
- **Google Search:** bid on the high-intent terms above. Small budget, exact
  match, trial landing page.
- **CAC discipline:** with ARPU ₹3,499 and ~14-mo target LTV (~₹49k), keep blended
  CAC < ₹4,000. Kill any ad set above it.

---

## 4. Six-Month Operating Plan (month by month)

Net-customer ramp to 500 (with churn buffer → ~560 gross adds):

| Month | New (net) | Cumulative | Theme |
|---|---|---|---|
| 1 | 25 | 25 | Foundation + Founding cohort |
| 2 | 45 | 70 | Outbound + community engine on |
| 3 | 75 | 145 | Referral + content live |
| 4 | 105 | 250 | Scale channels, first events |
| 5 | 120 | 370 | Partnerships + paid scale |
| 6 | 130 | **500** | Push, close, retain |

### Month 1 — Foundation & Founding cohort (target +25)
- **Fix the proof gap:** replace placeholder stats/testimonials with real ones
  (from the first design-partner agencies). Add a live "Founding spots left: X"
  counter on /pricing.
- **Build the sales kit:** 90-sec demo video, 15-min demo script, 7-touch
  outbound sequence, WhatsApp/DM/call scripts, objection sheet, one-pager PDF.
- **Source 1,000 agencies** into tripOS's CRM (Maps, IndiaMART, IG, directories).
- **Personally onboard 25 founding agencies** via live demos. Do their first
  proposal *with* them on the call (activation gate #2).
- **Set up tracking:** PostHog events for signup → first itinerary → first
  proposal sent → first payment. Weekly funnel dashboard.
- **Join** 15–20 agent FB/Telegram/WhatsApp groups; start giving value (no pitch
  yet).

### Month 2 — Turn on the engine (target +45 → 70)
- Outbound to 1,000+ more agencies; 40 touches/day cadence.
- Start posting value content in the communities you warmed up; soft trial CTA.
- Launch the **founding offer publicly**; push to fill the 100 cap → urgency.
- Ship 8–10 reels + 2 SEO pillar pages + 3 lead magnets.
- Turn on **small Meta + Google** ads to the trial page.
- First **chapter-meet workshop** booked (TAAI/TAFI local).

### Month 3 — Referral + content compounding (target +75 → 145)
- Launch **referral program** in-app; ask every happy customer (post first booking).
- Founding cohort should be full → switch messaging to "now at standard price,
  but next 50 get X." Keep a rolling scarcity mechanic.
- Publish weekly: 2 SEO posts, 4 reels, 1 YouTube demo, 1 customer story.
- First **partnership** signed (a DMC or B2B aggregator co-marketing).
- Begin **webinar series**: weekly live "Build a proposal in 10 min" (registration
  → trial).

### Month 4 — Scale (target +105 → 250)
- Double down on whatever 2 channels have the best CAC (likely outbound +
  community/referral).
- **First trade-show/large event** presence (SATTE/OTM/GPS depending on calendar).
- Hire/contract **1–2 SDRs** to scale outbound past founder capacity.
- Optimize onboarding: in-app checklist, sample data, "do it with us" call slot.
- Localize: regional-language demo videos (Hindi + 1–2 others).

### Month 5 — Partnerships + paid scale (target +120 → 370)
- 2–3 partnerships live (aggregator base, CA network, training institute).
- Scale ad spend on proven sets; expand keyword set.
- Annual-plan push: "2 months free on annual" to lift cash + cut churn.
- Re-engage trial no-shows and churned trials with new case studies.

### Month 6 — Final push & retain (target +130 → 500)
- "Year-end / new-season" campaign (agencies gear up for peak booking season).
- Win-back + upgrade campaign (Starter → Pro on reports/automations value).
- Sales sprint: founder + SDRs clear the pipeline; limited-time annual deal.
- **Retention focus** so the 500 is *net*: QBR-style check-ins with top accounts,
  proactive outreach to low-activity accounts (activation < 2 gates hit).

---

## 5. Pricing & Offer Strategy

- **Keep the 14-day no-card trial** — it's the single biggest top-of-funnel asset.
- **Founding 50% lifetime lock** for first 100 (urgency + early revenue + proof).
- **Annual push** (₹24,990 / ₹49,990 = 2 months free): pitch hard from month 2 —
  improves cash and crushes churn. Aim 30%+ of paid on annual by month 6.
- **Starter → Pro upgrade path:** trigger upgrade prompts when a Starter agency
  (a) hits the 100-itinerary cap, (b) adds a 4th team member, or (c) opens
  /reports (gated). These are natural, value-led upgrades.
- **No discounting below founding price** publicly — protect price integrity;
  use *months-free* and *annual* as the only levers.

---

## 6. Sales Process & CRM (dogfood tripOS)

Run your *own* sales pipeline as a discipline. Stages:
`New → Contacted → Demo booked → Trial started → Activated (2 gates) →
Paid → Retained`. Track conversion at each; the weakest gate is your week's job.

- **SLA:** every inbound trial gets a personal WhatsApp within 1 hour.
- **Demo-or-die:** trials that get a live demo convert ~2x. Push everyone to a
  15-min demo.
- **Activation babysitting (months 1–4):** for every new trial, you/SDR manually
  ensure gate #1 (first itinerary) and gate #2 (first WhatsApp proposal) inside
  72h. This is the highest-ROI activity in the whole plan.

---

## 7. Onboarding, Activation & Retention (so 500 is *net*)

Churn is the silent killer of "net 500." Defend it:
- **In-app onboarding checklist:** set branding → generate first itinerary →
  build first quote → send first proposal → connect Razorpay/WhatsApp.
- **"Do it with us" call** offered to every trial (white-glove early).
- **Sample/seed data** so the workspace never looks empty.
- **Day-1 / 3 / 7 / 12 lifecycle emails + WhatsApp** nudging toward the next gate;
  Day-12 "trial ending — lock founding price" conversion push.
- **Health score** = (itineraries + proposals sent + payments collected last 14
  days). Reach out to anyone trending to zero *before* they churn.
- **Make switching costs real (the moat):** once their leads, vendors, GST invoice
  series and branding live in tripOS, leaving is painful — get them to import
  all of it early.

Target metrics: trial→paid ≥30%, month-1 logo churn ≤6% (improving to ≤3% by M6),
activation (2 gates) ≥55% of trials.

---

## 8. Content & Asset Checklist (build in Month 1)

- [ ] 90-second hero demo video (the WhatsApp proposal flow).
- [ ] 15-minute live demo script (above) + sandbox demo account.
- [ ] One-pager PDF (problem → flow → pricing → trial QR).
- [ ] 7-touch outbound sequence (WhatsApp + email + call) saved as templates.
- [ ] Objection-handling sheet.
- [ ] 3 lead magnets: itinerary template, GST-invoice template, quotation template.
- [ ] 5 SEO pillar articles (terms in §3.5).
- [ ] 20 short reels (before/after, speed demos, tips) — batch-shoot.
- [ ] 5 written/video case studies from founding cohort.
- [ ] Webinar deck + recurring registration page.
- [ ] Referral share assets (in-app link + WhatsApp message).

---

## 9. Metrics — the weekly dashboard

Review every Monday. Numbers, not vibes.

**Top of funnel:** touches, qualified leads, demos booked, trials started.
**Activation:** % trials hitting gate #1 (itinerary) and gate #2 (proposal sent).
**Conversion:** trial→paid %, demo→paid %, by channel.
**Revenue:** new MRR, total MRR, ARPU, Starter/Pro mix, annual %.
**Retention:** logo churn %, ₹ churn %, health-score distribution.
**Efficiency:** CAC by channel, LTV:CAC (target >3:1), payback < 6 mo.

Per-channel scorecard each week → **double down on the best 2, cut the worst**.

---

## 10. Budget (lean, 6 months)

| Item | Est. (₹) |
|---|---|
| Paid ads (Meta + Google) | 1.5–3.0 L |
| Events / chapter meets / 1 trade show | 1.0–2.5 L |
| Content production (editing, design) | 0.5–1.0 L |
| Tools (lists, email, scheduling, analytics) | 0.3–0.5 L |
| SDR(s) from month 4 (contract) | 1.5–3.0 L |
| Referral rewards (months-free = deferred) | (rev offset) |
| **Total cash** | **~5–10 L** |

Against ₹17.5L **monthly** MRR at goal, this is a strong return. The plan is
deliberately founder-led/community-first so it works even at the low end.

---

## 11. Risks & mitigations

- **Founder-time bottleneck on outbound/demos** → systematize early (scripts,
  recordings, sandbox), hire SDRs by M4, lean on self-serve trial + webinars.
- **Thin social proof today** → make founding-cohort testimonials the M1 priority;
  the site is built to show them.
- **WhatsApp/email spam bans** → always value-first in groups; warm sequences,
  never cold link-dumps; respect group rules.
- **Activation gap kills trials** → the "babysit to 2 gates" process is
  non-negotiable months 1–4.
- **Churn eats net growth** → annual push + onboarding + health-score outreach.
- **Operational limits at scale** (Redis rate-limit, no public API/Tally export —
  see APP_CONTEXT §9; uploads already on Cloudflare R2) → fix before M4–M6 volume.

---

## 12. Week-1 action checklist (start tomorrow)

1. Stand up the sales pipeline in tripOS's own CRM.
2. Pull the first 1,000 agency contacts (Maps + IndiaMART + IG).
3. Record the 90-sec demo video; write the 15-min demo script.
4. Save WhatsApp/DM/call/email templates (§2).
5. Add "Founding spots: X/100" counter + founding offer to /pricing.
6. Join 15 agent FB/Telegram/WhatsApp groups; start giving value.
7. Wire PostHog funnel events: signup → itinerary → proposal → payment.
8. Book 10 demos for next week. Start 5 founding trials. Do their first proposal
   live with them.
