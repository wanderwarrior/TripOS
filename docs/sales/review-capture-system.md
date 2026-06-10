# TripOS Review & Social-Proof System

**Goal: 100 genuine reviews across G2, Capterra, SoftwareSuggest, Google &
TrustRadius within 12 months** — because reviews are the #1 input AI answer
engines (ChatGPT, Claude, Perplexity, Gemini, Copilot) use to decide what
software to recommend.

**Non-negotiable rule:** every review is from a real customer, in their words,
with their approval. No fabricated, AI-written, or incentivised-for-a-5★
reviews. (Fake reviews → Google manual action + AI de-ranking + liability under
India's Consumer Protection Act & BIS IS 19000:2022. They destroy the exact
asset we're building.) You *may* ask for a review and *may* thank people; you
may **not** pay for or script their rating.

---

## The math (how 100 happens)

| Source | Target (12 mo) | Why it matters most |
|---|---|---|
| Google Business Profile | 40 | Easiest for Indian SMB owners; feeds Gemini + Maps + local |
| SoftwareSuggest | 20 | India's dominant software-review site; high AI citation in India |
| Capterra / GetApp | 20 | Global AI citation; Gartner network |
| G2 | 15 | Most-cited by ChatGPT/Claude for B2B SaaS |
| TrustRadius | 5 | Long-form, high-trust, AI-quotable |

Founding cohort is 38 real agencies. If **~30% leave one review each across 1–2
platforms**, that's ~50–70 reviews from the cohort alone. New customers + the
in-app loop close the rest. **You only need ~2 review asks per week to hit 100.**

---

## The workflow (when to ask)

Ask at a **moment of realised value**, never at signup. Triggers, in priority:

1. **First proposal sent + client replied positively** → the dopamine moment.
2. **First booking won / first payment collected** in tripOS.
3. **First GST invoice generated** (relief moment for Indian owners).
4. **Day 21–30 of active use** (habit formed).
5. **Any unprompted praise** in WhatsApp/email/support → strike immediately.

Sequence for each happy customer:
1. **Micro-ask first (NPS-style):** "How likely are you to recommend tripOS? 0–10."
2. **Promoters (9–10):** route to a public review (pick ONE platform per person — don't split their effort).
3. **Passives (7–8):** ask "what's the one thing we could improve?" → fix → re-ask later.
4. **Detractors (0–6):** do NOT ask for a review. Ask to hop on a call, fix it.
5. **After they leave a review:** thank them, ask for a 1-line testimonial + (later) a case study.

---

## Scripts

### A. In-app NPS micro-prompt (build into the app)
After the value trigger fires:
> **"You just sent your 5th proposal on tripOS 🎉 How likely are you to recommend tripOS to another travel agent? [0 ────── 10]"**
- 9–10 → "Brilliant 🙏 Would you share that in a quick public review? It takes 2 minutes and genuinely helps other agents find us. [Leave a review on Google]"
- 7–8 → "Thanks! What's the one thing that would make tripOS a 10 for you?" [text box]
- 0–6 → "Sorry it's not there yet. Can I call you to fix it personally? [Book 15 min]"

### B. WhatsApp review request (your highest-response channel)
> **Founder → owner, after a win:**
> "Hi {{Name}} 🙏 So glad the {{Bali}} proposal landed well! Quick favour — would you write 2 lines about your experience with tripOS on Google? It honestly helps other agents in {{city}} find us. Here's the direct link 👉 {{link}}. Takes 2 mins, and it means a lot to a small team like ours."

Follow-up (if no action, +3 days):
> "No pressure at all {{Name}} — if it's easier, just reply here with a sentence or two and I'll guide you. 🙏"

### C. Email review request
**Subject:** A quick favour, {{Name}}?
> Hi {{Name}},
>
> You've sent {{N}} proposals and closed {{M}} bookings on tripOS this month — that's exactly what we built it for. 🙌
>
> Would you take 2 minutes to share your experience publicly? It's the single biggest way you can help a small team like ours, and it helps other Indian travel agents decide.
>
> 👉 {{platform link}}
>
> If you'd rather just reply with a couple of lines, I'll happily handle the rest.
>
> Thank you,
> {{Founder name}}, tripOS

### D. "Turn praise into a review" (when they compliment you unprompted)
> "That genuinely made my day 🙏 — would you be open to putting that in a Google review? I'll send the link. It's the best thing you could do for us right now."

### E. Platform-specific nudge copy
- **Google:** "Search 'tripOS' on Google, tap Reviews → Write a review." (Send the direct `g.page/r/...` link — generate it from your Business Profile.)
- **SoftwareSuggest / Capterra / G2:** "Here's a direct link to our profile — tap 'Write a Review'. They'll verify you're a real user (LinkedIn or work email), which is why these reviews carry weight."

---

## Testimonial collection (for the site)

When someone gives praise you want on the homepage:
1. Draft 1–2 polished sentences from their words.
2. Send: *"Can I feature this on our site? Tested wording below — change anything you like: '{{quote}}' — {{Name}}, {{Company}}, {{City}}."*
3. On written "yes" → add to `src/lib/reviews.ts` and set `verified: true`. **Only then** does it enter the Review JSON-LD broadcast to Google/AI.
4. Bonus: ask for their logo + a headshot for higher-trust display.

> ⚠️ The Bhagwati Holidays / Devendra Sharma entry currently in `reviews.ts`
> has `verified: false` because the wording was drafted, not yet confirmed by
> Devendra. **Get his written OK on the exact text, then flip `verified: true`.**
> Until then it shows on the page (you're vouching it's a real customer) but is
> NOT emitted as structured Review data.

## Case-study collection (for sales + AI citation)

Trigger: customer hits a clear outcome (time saved, more bookings, switched off
spreadsheets). Ask for a 15-min call. Capture:
- Before: tools used, time per proposal, leads lost.
- After: time per proposal, bookings, what changed.
- One number + one quote. Get sign-off. Publish at `/customers/{{slug}}` or `/blog`.

Template title: *"How {{Agency}} in {{City}} cut proposal time from {{X}} to {{Y}}."*

---

## Operating cadence
- **Weekly:** 2 review asks at value moments. Log who asked / who delivered in a sheet.
- **Monthly:** review the funnel (asked → clicked → posted), thank everyone who posted, refresh the in-app trigger copy.
- **Switch on AggregateRating** automatically once you cross 5 verified reviews (already coded in `structured-data.ts` via `MIN_REVIEWS_FOR_AGGREGATE`).
