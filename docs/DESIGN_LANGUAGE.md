# TripCraft — Design Language Guide (for AI agents)

> Paste this file into any AI assistant before asking it to build a new screen,
> component, page, or marketing section for TripCraft. It is the single source of
> truth for *how things should look and feel*. The canonical implementation lives
> in [`src/app/globals.css`](../src/app/globals.css); this document explains the
> intent, the rules, and how to apply the tokens and component classes correctly.
>
> **Golden rule:** Never invent new colors, radii, shadows, or fonts. Compose new
> things from the existing tokens and `.tc-*` component classes below. If
> something genuinely can't be built from them, extend the token set in
> `globals.css` first, then use the new token — don't hardcode hex values inline.

---

## 1. Brand essence

**"Atelier Pro" — a premium travel-atelier brand meeting a precision pro tool.**

Two personalities held in tension, on purpose:

- **Atelier (the soul):** warm paper canvas, a serif display face, a single
  restrained gold accent, editorial whitespace, monogram seals. It should feel
  *crafted, considered, expensive* — like a luxury travel house's stationery.
- **Pro tool (the spine):** tight radii, tabular monospaced figures, dense data
  tables, calm status colors, fast micro-interactions. It should feel
  *precise, fast, trustworthy* — like a tool an operator lives in all day.

Adjectives to design toward: **warm, precise, editorial, calm, premium,
restrained.** Adjectives to avoid: playful, neon, rounded-bubbly, flat-generic,
gradient-heavy, loud.

**Light mode only.** There is no dark theme for the app shell. (Dark *surfaces*
exist — the navy sidebar, the proposal cover/investment sections — but the
system is fundamentally a light, warm-paper system.)

---

## 2. Color tokens

All colors are CSS custom properties on `:root`. **Always reference the token,
never the raw hex.** Use `var(--token)` in CSS, or the Tailwind arbitrary form
`bg-[var(--paper)]` / `text-[var(--ink)]` when writing utility classes.

### Surfaces (warm paper, never pure-white backgrounds)
| Token | Hex | Use |
|---|---|---|
| `--canvas` | `#f4f2ec` | The app background. Warm paper. The base everything sits on. |
| `--paper` | `#ffffff` | Cards, raised surfaces, table bodies. |
| `--paper-2` | `#fcfbf7` | Faint raised / hover fills / table headers / inset wells. |
| `--inkwash` | `#0c1620` | Deep navy-ink. The sidebar, primary buttons, dark badges. The "brand dark." |
| `--inkwash-2` | `#13212f` | Hover state for inkwash surfaces. |

### Text (an ink hierarchy, not pure black)
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#16191d` | Primary text, headings, strong values. |
| `--ink-2` | `#3c434b` | Body text, table cells, secondary content. |
| `--muted` | `#6b7077` | Labels, captions, metadata, sublabels. |
| `--faint` | `#9ba0a6` | Timestamps, placeholders, the quietest text. |
| `--on-dark` | `#efeae0` | Text on inkwash/navy surfaces. |
| `--on-dark-mut` | `#9db0be` | Muted text on dark surfaces. |

### Accent — a *single* gold, used with restraint
Gold is the only accent color. It signals brand, focus, and value — not every
interactive element. Most buttons/links are ink/navy; gold is a spotlight.
| Token | Hex | Use |
|---|---|---|
| `--gold` | `#c8a96a` | The accent. Icons, meters, the gold button gradient, seals. |
| `--gold-deep` | `#9f7c36` | **Legible gold for text/icons on light** (raw `--gold` fails contrast as text). |
| `--gold-soft` | `#f2e8d2` | Gold tinted backgrounds (icon tiles, gold badges, avatars). |
| `--gold-line` | `rgba(200,169,106,.45)` | Gold hairline borders, hover border on cards/chips. |

> **Contrast rule:** Use `--gold-deep` whenever gold is *text or a small icon on
> a light surface*. Use `--gold` for fills, meters, and large/decorative marks.

### Data-viz palette (muted, premium, shared tone)
For charts only. All desaturated to sit in the same tonal family.
`--dv-gold #c8a96a` · `--dv-sage #739c8c` · `--dv-slate #7b8fb2` ·
`--dv-clay #c2856a` · `--dv-plum #9180a6`.

### Functional / status (each has a soft-bg pair)
Calm, slightly earthy — never pure traffic-light colors.
| Meaning | Solid | Soft bg |
|---|---|---|
| OK / success | `--ok #5c8c69` | `--ok-soft #e7f0e8` |
| Warning | `--warn #b98a37` | `--warn-soft #f6ecd6` |
| Bad / error | `--bad #bd6354` | `--bad-soft #f6e2dc` |
| Info | `--info #6981a6` | `--info-soft #e6ebf3` |

### Lines / hairlines
`--line #e6e2d8` (default border) · `--line-2 #eeebe3` (faintest divider) ·
`--hair rgba(18,24,30,.07)` (overlay hairline).

---

## 3. Typography

Three families, each with a job. They are loaded in
[`layout.tsx`](../src/app/layout.tsx) as CSS variables.

| Token | Family | Role |
|---|---|---|
| `--serif` | **Playfair Display** | Display only: page titles, stat values, section headings, proposal headlines, agency names. Carries the "atelier" soul. |
| `--sans` | **Inter** | Everything else: body, UI, labels, buttons. The default (`body` is `font-sans`). |
| `--mono` | **JetBrains Mono** | Figures: currency, counts, %, codes, IDs, timestamps, deltas. Always with `tabular-nums`. The "pro tool" spine. |

### Hard rules
- **Money, counts, percentages, codes, dates-as-figures → always mono +
  tabular.** Use the `.mono` utility (sets family + `tnum`) or `.tnum`. Numbers
  must never reflow or jitter; they line up in columns.
- **Serif is for display, never body.** Don't set paragraphs in Playfair.
- **Body base is `14px` / line-height `1.45`** (set on `body`). UI is compact and
  dense by default — this is a pro tool, not a marketing page.

### Type helpers (classes)
- `.tc-eyebrow` — 10px, `0.22em` tracking, uppercase, 600, muted. The small
  kicker above a title. `.tc-eyebrow.gold` recolors to `--gold-deep`.
- `.tc-page-title` — Playfair 34px, the H1 of a screen.
- `.tc-page-sub` — 13.5px muted subtitle under a page title (max-width 560).
- `.tc-sec-head h2` — Playfair 20px, an in-page section heading (paired with an
  optional uppercase `.lnk` action on the right).

A page header is almost always: optional `.tc-eyebrow` → `.tc-page-title` →
`.tc-page-sub`.

---

## 4. Space, radius, elevation

### Radii (deliberately *tight* — a pro feel, not soft/bubbly)
`--r-xs 6px` · `--r-sm 8px` · `--r 10px` · `--r-lg 14px` · `--r-xl 18px`.
Cards/stats use `--r-lg`. Buttons are `9px`. Badges/chips `6–8px`. Avatars use
**rounded-rectangle** (`7–8px`), *not* circles — circles are reserved for seals
and status dots.

### Elevation (soft, navy-tinted, low — never harsh black drop shadows)
- `--sh-1` — resting card shadow (barely there).
- `--sh-2` — hover/raised (cards lift on hover with this).
- `--sh-pop` — popovers, menus, dialogs.

Hover pattern for interactive cards/tiles: `translateY(-2px)` + upgrade
`--sh-1`→`--sh-2` + border to `--gold-line`. Active/press: `translateY(1px)`.

### Layout constants
`--side-w: 248px` (sidebar width) · `--top-h: 60px` (top bar height).

---

## 5. Component vocabulary (`.tc-*` classes)

These plain-CSS classes are the **shared building blocks**. Prefer composing
these over writing bespoke styles. (They're authored outside `@layer` so they
intentionally beat Tailwind utilities on specificity.)

### Cards
- `.tc-card` — the base surface: paper, `--line` border, `--r-lg`, `--sh-1`.
- `.tc-card-head` — flex header row with bottom border; `h3` is the title; an
  optional `.ttl` group puts a gold icon before the title.

### Buttons — `.tc-btn` + one variant
36px tall, `9px` radius, weight 550. Variants:
- `.tc-btn-primary` — **inkwash/navy fill**, light text. The default primary
  action.
- `.tc-btn-gold` — gold gradient, navy text. The *spotlight* CTA (e.g. "Send
  proposal", "Upgrade"). Use sparingly — one per view at most.
- `.tc-btn-ghost` — paper fill, `--line` border; gold-line border on hover. The
  secondary/neutral action.
- `.tc-btn-sm` — 30px compact modifier.

> Hierarchy in one view: at most **one** gold button, paired with primary and/or
> ghost. Never two golds competing.

### Badges / status pills — `.tc-badge` + tone
21px pill with optional `.bdot` status dot. Tones map to the functional palette:
`.tc-b-ok`, `.tc-b-warn`, `.tc-b-bad`, `.tc-b-info`, `.tc-b-gold`,
`.tc-b-neutral`, `.tc-b-navy`. Use these for record status (lead stage, invoice
state, payment state) — consistent meaning across screens.

### Chips / filters — `.tc-chip`
30px outlined toggle. `.tc-chip.on` becomes inkwash-filled with a gold icon.
Used for filter bars and segment toggles.

### Tabs / segmented — `.tc-tabs`
Inset paper-2 track; `button.on` becomes a raised paper pill. For view switches.

### Stat tile — `.tc-stat`
The KPI tile. `.tc-stat-ic` (gold-soft icon chip; variants `.navy`, `.sage`,
`.clay`) + `.tc-stat-label` (uppercase muted) + `.tc-stat-val` (**Playfair
30px**) + `.tc-stat-foot` with a `.tc-delta.up`/`.down` (mono, ok/bad). Lifts on
hover.

### Table — `.tc-tbl`
The data table. `thead th` is 10px uppercase tracked on `--paper-2`; add `.r`
for right-aligned (numeric) columns. Rows hover to `--paper-2`. Helpers:
`.t-strong` (ink 600), `.t-mut` (muted 12px), `.tc-cell-lead` (avatar + text
lead cell), `.tc-ava-sm` (30px gold-soft rounded-rect avatar/monogram).
Right-align all numeric/money columns and set them in mono.

### Other primitives
- `.tc-meter` (6px progress bar; gold fill by default, `.sage`/`.slate`
  variants).
- `.tc-hr` (1px `--line-2` divider).
- `.tc-row` (activity/follow-up list row: `.tc-row-ic` icon chip + `.tc-row-main`
  + `.tc-row-time` mono timestamp).
- `.tc-kcol` / `.tc-kcard` (kanban column + draggable card; card lifts on hover).
- `.tc-sec-head` (section heading + uppercase `.lnk` action).
- `.tc-stack` / `.ava-xs` (overlapping 24px avatar stack).

### Screen entry motion
Wrap a newly-mounted screen in `.tc-screen` — it fades + rises 8px over 0.42s
with the house easing.

---

## 6. Motion

Motion is **quick, eased, and quiet**. It guides the eye; it never performs.

- **House easing curve:** `cubic-bezier(0.2, 0.7, 0.3, 1)` (a soft
  decelerate-out). Use it for entrances and reveals.
- **Micro-interactions:** `0.12s–0.18s` on transform/shadow/border/background.
  Buttons press down 1px; cards lift 2px. That's the whole vocabulary.
- **Charts reveal on scroll:** add `.tc-chart` to a chart, toggle `.rv-on` when
  it enters the viewport — bars scale up from the bottom, area lines draw via
  `stroke-dashoffset`, donut segments sweep via `stroke-dasharray`. Use an
  IntersectionObserver to add `.rv-on`.
- **Marketing only:** `.marketing-hero-aurora` (slow 26s drifting gold+teal
  aurora behind the hero video) and `.tc-marquee` (edge-masked testimonial
  marquee). `framer-motion` is used for scroll animations on the landing page.
- **Always respect `prefers-reduced-motion: reduce`** — the aurora and marquee
  already disable themselves; any new animation must do the same.

---

## 7. The proposal subsystem — "Atelier Editorial" (`.pp`)

The **customer-facing** proposal/voucher document is a distinct, more editorial
expression of the same brand, scoped entirely under the `.pp` class so it never
leaks into the app shell. If you build anything customer-facing, work inside
`.pp`.

Key differences from the app shell:
- **Per-agency accent:** gold comes from `--ppaccent` (defaults to `#c8a96a`),
  set at runtime by `preview-renderer` so each agency brands its own proposals.
  Use `var(--ppaccent)`, not `--gold`, inside `.pp`.
- **Ivory, not paper:** `--ivory #faf7f0` canvas; `[data-theme="minimal"]`
  switches to white. Navy `#0c1620` for cover/investment/closing sections.
- **Big editorial type:** cover titles `clamp(56px,9vw,92px)`, section headings
  42px, day numbers 62px Playfair — far larger and more dramatic than the
  app. Italic Playfair for sub/pull-quotes/signatures.
- **Signature devices:** the monogram `.seal` (circular, or uncropped when a
  logo is present), drop-cap first letter on the overview lead, dotted leader
  rows in the index, pull-quotes with a gold left rule, gilded section kickers.
- **Print-aware:** "Export PDF" calls `window.print()`, so `@media print` rules
  force backgrounds/gradients to render and neutralize off-screen reveal
  transforms. Any new proposal section must print correctly (avoid clipping,
  honor `print-color-adjust`).
- **Privacy:** customer views must **never** show cost/markup/profit — only
  customer-safe selling prices (see app-context §3).

---

## 8. Applying this — recipes

**A new app page**
1. `.tc-screen` wrapper for entry motion.
2. Header: `.tc-eyebrow` → `.tc-page-title` (Playfair) → `.tc-page-sub`.
3. KPIs as a row of `.tc-stat` tiles (values in Playfair, deltas in mono).
4. Content in `.tc-card`s with `.tc-card-head`. Lists as `.tc-tbl` or `.tc-row`.
5. Status as `.tc-badge` tones. Filters as `.tc-chip`. View switches as
   `.tc-tabs`.
6. Actions: one `.tc-btn-gold` spotlight max, plus `.tc-btn-primary` /
   `.tc-btn-ghost`.
7. Every number is mono + tabular and right-aligned in tables.

**A new component**
- Start from the nearest `.tc-*` primitive; extend with tokens, not hex.
- Borders `--line`; hover border `--gold-line`; lift `-2px` + `--sh-2`.
- Radius from the `--r-*` scale (tile/card = `--r-lg`).
- Gold is a spotlight, not a default. Icons on light = `--gold-deep`.

**A new marketing section**
- Navy/aurora dark backgrounds are allowed here (unlike the app shell).
- Big Playfair display, generous whitespace, gold kickers.
- `framer-motion` scroll reveals with the house easing; honor reduced-motion.

---

## 9. Checklist before shipping any new UI

- [ ] No raw hex/px-radius/shadow hardcoded — all from tokens / `.tc-*`.
- [ ] Numbers are mono + `tabular-nums`, right-aligned in tables.
- [ ] Serif used for display only; body is Inter at the dense 14px base.
- [ ] At most one gold spotlight action in the view; gold text uses `--gold-deep`.
- [ ] Surfaces are warm (`--canvas`/`--paper`), not pure flat white-on-white.
- [ ] Radii are tight; avatars are rounded-rects, circles only for seals/dots.
- [ ] Hover = lift 2px + `--sh-2` + gold-line border; press = down 1px.
- [ ] Status uses the calm functional palette via `.tc-badge` tones.
- [ ] Any motion respects `prefers-reduced-motion`.
- [ ] Customer-facing → built under `.pp`, uses `--ppaccent`, hides cost/markup,
      prints correctly.
