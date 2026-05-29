# Handoff: TripCraft — "Atelier Pro" UI/UX Redesign

## Overview
A cohesive premium redesign of the **TripCraft** travel-agency platform. The goal: a precision "pro tool" feel (Linear / Superhuman density and craft) fused with a travel-atelier warmth — refined typography, richer data viz, subtle motion, and a bolder evolution of the existing navy / gold brand. **Light mode only.** UX/IA is largely unchanged — this is a visual + interaction-polish pass.

The redesign is delivered as a **clickable prototype** covering six core screens:
1. **Dashboard** (`/`) — KPI tiles w/ sparklines, revenue chart, activity, up-next, pipeline.
2. **Reports** (`/reports`) — charts: grouped bars, destinations donut, conversion funnel, leaderboard.
3. **Trips** (`/trips`) — dense filterable table + summary tiles.
4. **Trip workspace** (`/trips/[id]`) — workflow stepper, itinerary timeline, operations checklist, vendor board.
5. **Invoices & bookings** (`/invoices`, `/bookings`) — finance KPIs + invoice table with collection meters.
6. **Contacts / CRM** (`/contacts`) — table ⇄ kanban toggle.

## About the Design Files
The files in this bundle are a **design reference built in React + plain CSS** (no build step — Babel-in-browser). They are a **prototype of the intended look, density, and motion** — NOT production code to paste in. The task is to **apply this visual system to the existing tripOS codebase** (Next.js App Router + Tailwind + shadcn/ui + lucide-react), reusing its components and patterns. Keep all current routes, data fetching, server actions, and IA — restyle, don't re-architect.

### How the prototype is organized (mirror these when implementing)
| File | Role | Maps to in tripOS |
|---|---|---|
| `tripcraft.css` | **The design system** — all tokens, type, shell, primitives, charts, motion | `tailwind.config.ts` + `globals.css` + shadcn component classes |
| `tc-ui.jsx` | Icons, **Sidebar**, **Topbar**, chart components | `app-sidebar.tsx`, `page-shell.tsx`, a new `charts/` dir |
| `screen-dashboard.jsx` | Dashboard | `src/app/page.tsx` (auth'd branch) + `crm/stat-tile.tsx`, `crm/activity-feed.tsx` |
| `screen-reports.jsx` | Reports | `src/app/reports/page.tsx` |
| `screen-trips.jsx` | Trips list | `src/app/trips/page.tsx`, `trips-table.tsx`, `trip-card.tsx` |
| `screen-workspace.jsx` | Trip workspace | `src/app/trips/[id]/...`, `operations/*`, `itinerary-editor.tsx`, `vendor-assignment-board.tsx` |
| `screen-invoices.jsx` | Invoices & bookings | `src/app/invoices/page.tsx`, `invoices-table.tsx`, `bookings/*` |
| `screen-crm.jsx` | Contacts | `src/app/contacts/page.tsx`, `contacts-table.tsx`, `contact-kanban.tsx` |
| `TripCraft.html` | Shell that wires nav + screen transitions | `page-shell.tsx` behavior (you keep Next routing) |

Open `TripCraft.html` in a browser and click through it — it is the source of truth for spacing, color, and motion.

## Fidelity
**High-fidelity.** Recreate pixel-for-pixel using the codebase's existing libraries (Tailwind, shadcn, lucide). All tokens and component specs are below and in `tripcraft.css`.

---

## Design Tokens — the brand evolution
These extend/replace the current `tailwind.config.ts` palette. The heritage navy + gold stays, but the system gets warmer paper, a tighter neutral scale, a muted data-viz palette, a mono typeface for figures, and tighter radii. Copy these into the Tailwind theme (CSS variables shown; full values in `tripcraft.css` `:root`).

### Color
| Token | Value | Use |
|---|---|---|
| `--canvas` | `#F4F2EC` | App background (warm paper — slightly deeper than old `#F8F6F2`) |
| `--paper` | `#FFFFFF` | Cards, tables |
| `--paper-2` | `#FCFBF7` | Faint raised / table header / hover |
| `--inkwash` | `#0C1620` | **Sidebar**, primary buttons, dark accents (deepened from `#0B1C2C`) |
| `--inkwash-2` | `#13212F` | Hover on dark |
| `--ink` | `#16191D` | Primary text |
| `--ink-2` | `#3C434B` | Secondary text |
| `--muted` | `#6B7077` | Labels |
| `--faint` | `#9BA0A6` | Tertiary / timestamps |
| `--gold` | `#C8A96A` | **Singular accent** — used with restraint |
| `--gold-deep` | `#9F7C36` | Gold *text* on light (legible) |
| `--gold-soft` | `#F2E8D2` | Gold tint fills (icon chips, badges) |
| `--line` / `--line-2` | `#E6E2D8` / `#EEEBE3` | Borders / hairline dividers |

**Data-viz palette** (muted, premium, shared tone — use in this order for series):
`--dv-slate #7B8FB2`, `--dv-sage #739C8C`, `--dv-gold #C8A96A`, `--dv-clay #C2856A`, `--dv-plum #9180A6`.

**Functional** (each has a `-soft` tint for badges): `--ok #5C8C69`, `--warn #B98A37`, `--bad #BD6354`, `--info #6981A6`.

### Typography
- **Display / titles / big numbers:** Playfair Display (already loaded) — page titles ~34px, stat values ~30px, section headings ~20px.
- **UI / body:** Inter (already loaded) — weights 400/450/500/550/600.
- **NEW — figures, IDs, codes, deltas:** **JetBrains Mono** (`--mono`). Add to `next/font`. Always `tabular-nums` for money/counts. This mono is a key part of the new "pro tool" character — use it for every currency value, count, percentage, voucher/invoice number, and timestamp.
- **Micro-labels / eyebrows:** Inter 600, UPPERCASE, 10px, letter-spacing .22em, color `--muted` (gold variant uses `--gold-deep`).

### Shape, elevation, motion
- **Radii — tighter than today:** cards `14px`, controls/inputs `8–10px`, badges `6px`. (Move away from `rounded-2xl`/`3xl`.)
- **Shadows:** very soft, layered — `--sh-1` (resting cards), `--sh-2` (hover/raised), `--sh-pop` (popovers). See `:root`.
- **Motion (subtle, fast):**
  - Screen/route enter: fade + 8px rise, .42s `cubic-bezier(.2,.7,.3,1)` (`@keyframes scr`).
  - Cards/rows: `translateY(-2px)` + shadow bump on hover, .16–.18s.
  - Charts animate **once on mount**: bars scale up from baseline, line draws via `stroke-dashoffset`, donut segments sweep via `stroke-dasharray`. (See `.chart` rules + `useReveal` in `tc-ui.jsx`.)
  - Active nav item: gold left-edge bar + gold icon.

---

## Shell (applies to every authenticated page)
- **Sidebar** (`--side-w` 248px): full-height `--inkwash`, with a hairline gold edge-glow on the right. Brand = gold gradient mark (Compass icon) + "Trip**Craft**" in Playfair (gold "Craft"). Nav grouped exactly as `lib/nav.ts` (Dashboard/Reports · Pipeline · Operations · Engage). Active item: subtle white-alpha fill, gold icon, **gold left-edge bar**. Items support a count badge (mono). Footer = user avatar + agency. (Restyle `app-sidebar.tsx`; keep `NAV_GROUPS`.)
- **Topbar** (`--top-h` 60px): translucent canvas + blur, left = breadcrumb (muted › **bold current**), right = search box (with `⌘K` kbd hint) + bell w/ unread dot. (Restyle `page-shell.tsx` TopBar + `global-search.tsx`.)
- **Main:** `--canvas` background, scroll container, content max-width ~1180px, padding `30px 32px 64px`.

## Page anatomy (shared)
- **Page header:** gold eyebrow (icon + label) → Playfair title (~34px) → muted subtitle; primary actions top-right (`.btn-gold` for the main CTA, `.btn-ghost` for secondary). Tabs/segmented toggles use `.tabs`.

---

## Component specs (recreate as Tailwind/shadcn equivalents)
All live in `tripcraft.css` — these are the highlights:

- **Stat tile** (`.stat`): white card, icon chip (gold-soft, or navy/sage/clay variants), uppercase micro-label, **Playfair value** (~30px, tabular), and either a **delta** (mono, gold/green up · red down, with arrow) or a **sparkline** (SVG, gold by default). Hover lifts. → replaces `crm/stat-tile.tsx` & `vendor-stat-tile.tsx`.
- **Badge / status pill** (`.badge` + `.b-ok/warn/bad/info/gold/neutral/navy`): 21px, soft tint bg + colored dot. → replaces all `*-status-pill.tsx` and `ui/badge.tsx` variants.
- **Buttons** (`.btn` + `-primary` navy / `-gold` / `-ghost`, plus `-sm`): 36px, 9px radius, 1px press-down. → align `ui/button.tsx`.
- **Chips / filters** (`.chip`, `.chip.on`): filter pills; active = navy fill + gold icon. → `ui/table-filters.tsx`.
- **Table** (`.tbl`): paper-2 uppercase 10px header, 13px rows, hairline dividers, row hover tint, lead cell = `.ava-sm` square avatar + name/subtext, right-aligned **mono tabular** money. → `ui/data-table.tsx`, `*-table.tsx`.
- **Meter / progress** (`.meter`): 6px track, gold fill (sage/slate variants) — used for workflow %, collection %, funnel, leaderboard.
- **Kanban** (`.kanban`/`.kcol`/`.kcard`): paper-2 columns with count, white cards that lift on hover. → `contact-kanban.tsx`, `vendor-assignment-board.tsx`.
- **Workflow stepper** (workspace): horizontal; done = navy chip w/ gold check, active = gold chip, pending = outlined; gold connector for completed segments. → `operations/trip-workflow-stepper.tsx`.
- **Itinerary timeline** (workspace): day number (Playfair) + date, gold node on a vertical line, activity rows as paper-2 tiles w/ icon chips. → `itinerary-editor.tsx`.
- **Charts** (`tc-ui.jsx`): `Sparkline`, `Bars` (grouped), `AreaLine`, `Donut`. Hand-rolled SVG with mount animations. In production, reimplement with the same look — either keep as small SVG components or use a charting lib (e.g. Recharts/visx) themed to the `--dv-*` palette and animated on mount. Put them in a new `src/components/charts/` dir.

---

## Per-screen notes
- **Dashboard:** 5-up KPI row (sparklines), then 1.6fr/1fr split — left: revenue `AreaLine` card (6M/12M toggle) + recent activity list; right: "Up next" (color-dot priority) + pipeline meters. Keep the You/Agency scope toggle (now a `.tabs` segmented control).
- **Reports:** 4-up KPI row, then grouped `Bars` (booked vs collected) + destinations `Donut`, then conversion funnel (meters) + sales leaderboard (avatar + meter).
- **Trips:** 4 summary tiles, filter chips + secondary filters, dense table (avatar, status badge, dates, pax, mono value, progress meter, owner avatar, chevron → opens workspace).
- **Workspace:** back chip + trip id; status/type badges; Playfair title; key-fact row (icon + value); stepper; tabs **Itinerary / Operations / Vendors**; itinerary timeline + trip-summary card; operations = checklist + "needs attention"; vendors = assignment cards (status, cost, voucher state — links to the voucher you redesigned earlier).
- **Invoices:** 4 finance KPIs; Invoices/Bookings tabs; status filter chips; table with collection meter + due (overdue in red) + status badge.
- **CRM:** Table ⇄ Kanban toggle (`.tabs`); 4 summary tiles; table or 4-stage kanban (New/Qualified/Proposal/Won) with value (gold mono), source badge, owner avatar.

## Interactions & states
- Nav switches screens with the `scr` enter animation. Charts animate once on mount. Hovers on cards/rows/chips per specs. Active states use navy fill + gold.
- Preserve all existing empty/loading/error states and render-guards from the current pages; just restyle them.
- The prototype omits truly secondary screens (Customers, Vendors list, Communications, Follow-ups, Settings) — apply the **same system** to them: same shell, tiles, tables, badges, type.

## Notable deltas from current design (call-outs)
1. Warmer/deeper canvas + **dark sidebar** (was light `bg-white/60`).
2. **Tighter radii** and a **mono typeface** for all figures — the biggest "pro tool" levers.
3. **Restrained gold** — accent only (active nav, primary CTA, key numbers, focus), not broad fills.
4. **Real data viz** with mount motion, on a defined `--dv-*` palette.
5. Denser tables and a consistent badge/meter/stat-tile vocabulary across every screen.

## Files in this bundle
- `TripCraft.html` — clickable prototype shell (open this).
- `tripcraft.css` — the full design system (tokens → components → motion).
- `tc-ui.jsx` — icons, sidebar, topbar, chart components.
- `screen-*.jsx` — the six screens.

## Assets
No raster assets. Icons = lucide (paths inlined in `tc-ui.jsx`; use `lucide-react` in production). Fonts = Playfair Display + Inter (already configured) + **JetBrains Mono (add via `next/font/google`)**.
