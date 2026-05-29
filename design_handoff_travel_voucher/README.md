# Handoff: TripCraft Travel Voucher — Redesign

## Overview
A premium redesign of the TripCraft **service voucher**, delivered in two visually-consistent surfaces:

1. **Web voucher** — the public, mobile-first page a traveler opens from a share link.
2. **Print / A4 PDF** — the downloadable document.

The redesign keeps the existing navy / sand-gold / ivory brand but elevates it: a TC monogram seal, Playfair Display serif titles, gold hairline rules, a full-bleed destination hero, a prominent **"Present at check-in" ticket stub** (QR + instructions), and an emphasized **24×7 emergency / concierge** support band. The structure is generic so it flexes across all service categories (HOTEL, TRANSFER, SIGHTSEEING, ACTIVITY, GUIDE, FLIGHT, TRAIN, OTHER).

## About the Design Files
`Travel Voucher.html` in this bundle is a **design reference created in plain HTML/CSS** — a prototype showing the intended look and layout, **not** production code to paste in. The task is to **recreate this design inside the existing tripOS codebase** using its established stack (Next.js App Router, Tailwind, `@react-pdf/renderer`, lucide-react, shadcn/ui), not to ship the HTML.

This design slots directly onto files that already exist — you are **modifying**, not greenfielding:

| Surface | File to modify |
|---|---|
| Web voucher | `src/app/v/[token]/page.tsx` |
| Print / A4 PDF | `src/components/vouchers/voucher-document.tsx` |
| (Data shape — reference only, do not change) | `src/server/services/vouchers.ts` → `VoucherSnapshot` |
| (Tokens — already defined) | `tailwind.config.ts` |

The data model (`VoucherSnapshot`), the PDF route (`src/app/api/vouchers/[id]/pdf/route.tsx`), and the QR generation (already done with the `qrcode` package in that route) **do not need to change**. This is a presentational redesign of the two view files.

## Fidelity
**High-fidelity.** Recreate pixel-for-pixel using the codebase's existing libraries. Exact colors, type, spacing, and copy are specified below. The HTML is the source of truth for layout; match it.

> Two things in the HTML are placeholders, NOT design intent:
> - The **QR** in the HTML is a faux SVG pattern. In the app, keep using the real `qrcode`-generated `qrDataUrl` already wired into both surfaces.
> - The **hero image** uses an `<image-slot>` web component (a prototype-only drag-drop placeholder). In the app this should be a real `<img>` / Next `<Image>` / `@react-pdf` `<Image>` fed by a hero image URL (see "Open question" below).

---

## Design Tokens
All of these already exist in `tailwind.config.ts` — **reuse them, do not invent new values.**

### Colors
| Token | Hex | Use |
|---|---|---|
| `navy` (DEFAULT) | `#0B1C2C` | Hero background, support band, primary text, CTA button |
| `navy-700` | `#06101A` | Deepest navy |
| `sand` (DEFAULT / 400) | `#C8A96A` | **Accent** — gold rule, eyebrows, seal, icons, status dot |
| `sand-100` | `#F4E9CE` | Confirmation-bar tint |
| `sand-200` | `#E7D29D` | Borders on accent surfaces |
| `ivory` | `#F8F6F2` | Web card body background, page background |
| `ink` | `#1A1A1A` | Body text |
| `line` | `#E8E4DB` | Hairline borders, field dividers |
| `muted` | `#565656` | Secondary labels |
| paper white | `#FFFFFF` | Cards |

Derived accent fills used in the mock (compute from `sand` with `color-mix`, or hardcode):
- `--accent-soft` = `sand` mixed 26% into white ≈ `#EFE3C8`
- `--accent-tint` = `sand` mixed 11% into white ≈ `#F7F0E1` (confirmation bar)
- `--accent-ink` = darkened gold for icon strokes/labels ≈ `#9A7B3C`

### Typography
- **Display / headings:** `font-display` → **Playfair Display** (already `var(--font-playfair)`), weight 600.
- **Body / labels:** `font-sans` → **Inter** (already `var(--font-inter)`).
- **Eyebrows / micro-labels:** Inter 600, UPPERCASE, `letter-spacing` 0.24em–0.30em, 9.5–10.5px.
- **Field labels:** Inter 600, UPPERCASE, 9.5px, `letter-spacing` 0.14em, color `muted`.
- **Field values:** Inter 400, 13.5px, color `ink`; "strong" variant Inter 600, color `navy`.

### Shape & elevation (already in config)
- Card radius: `14px` (between `rounded-xl`/`2xl`). Web ticket outer radius: `26px`.
- Web card shadow: `shadow-lift` (`0 2px 6px rgba(11,28,44,.05), 0 30px 70px rgba(11,28,44,.16)`).
- Gold rule: `3px` high, `linear-gradient(90deg, sand, sand-mixed-55%-white)`.

### Spacing (density "regular")
- Card padding: `20px`. Stack gap between sections: `16px`. (Compact = 15/12, Comfy = 26/20 — only needed if you keep the density tweak; otherwise hardcode regular.)

---

## Shared building blocks (used on BOTH surfaces)
Recreate these as small components so the two files stay consistent.

### 1. Monogram seal
A `38px` (web) / `44px` (PDF) circle. 1px `sand`-at-70%-opacity outer ring, plus an inner ring inset 3px at `sand`-30%. Centered "TC" in Playfair 600, color `sand`. On PDF, `@react-pdf` can't do `::after` — draw two concentric `<View>` circles with `borderRadius`.

### 2. Hero block
- Full-bleed background image with a navy scrim gradient on top:
  `linear-gradient(180deg, rgba(11,28,44,.62) 0%, rgba(11,28,44,.18) 34%, rgba(11,28,44,.40) 64%, rgba(11,28,44,.92) 100%)`.
- When no image / imagery disabled: solid `navy` with a subtle gold radial glow top-right.
- **Top row:** left = seal + `TRIPCRAFT` wordmark (Inter 700, 0.34em tracking, white) + tagline (`CRAFTED TRAVEL` web / `CRAFTED TRAVEL · VOUCHER OF SERVICE` PDF, 8.5px gold-tinted). Right = `VOUCHER` label + voucher number (`s.voucherNumber`, white, nowrap); PDF also shows `Issued {date}`.
- **Title block (bottom):** category eyebrow in `sand` (e.g. "Hotel Voucher" from `CATEGORY_LABEL[s.service.category]`), then service title `s.service.title` in Playfair (27px web / 38px PDF, white).
- **Hero meta strip:** thin top border `rgba(255,255,255,.16)`, then 3–4 inline stats. For HOTEL: Check-in / Check-out / Guests (PDF also Nights). Drive from `s.service.startDate/endDate`, `s.traveler.travelers`. For other categories these labels should generalize (see "Generic behavior").

### 3. Gold rule
3px gradient bar directly under the hero.

### 4. Confirmation bar
Full-width strip, background `--accent-tint`, bottom border `line`. Left: `CONFIRMATION` micro-label (gold) + value `s.service.confirmationNumber` (Inter 700, navy, 0.06em tracking). Right: status pill — navy bg, white text, gold dot, `CONFIRMED`, UPPERCASE 10px. Only render the bar if `confirmationNumber` exists.

### 5. "Present at check-in" stub  ← key new element
A bordered card (border `sand`-at-45%). 
- **Head:** navy bar, `PRESENT AT CHECK-IN` eyebrow in gold; web also shows "Boarding pass" in Playfair white on the right.
- **Body:** the real QR (`qrDataUrl`) at `108px` web / `124px` PDF in a white rounded box, beside copy: heading "Show this to check in" (Playfair, navy) + paragraph: *"Present this voucher — printed or on your phone — on arrival. A government photo ID for the lead guest may be requested."* Then a top-bordered facts row: Dates + Pax.
- Web: QR left, copy right. PDF: stacked/centered in the narrow side column.
- (Optional flourish from the mock: a dashed-gold "perforation" line + ticket notches. Skip on PDF if fiddly.)

### 6. Section card + field rows
`SECTION LABEL` (gold-less muted eyebrow with a trailing hairline that fills remaining width) above a white card. Inside, field rows: fixed 84px uppercase label column + value column, each row divided by a `line`-at-70% hairline (no divider on last row).

Sections, in order:
- **Service details** — Dates (`startDate → endDate · N nights`), Room/Qty, Quantity (`s.service.quantity`), Includes (`s.service.description`).
- **Vendor** — `s.vendor.name` (Playfair), type with building icon, address + city/state/country, then **contact chips** (pill buttons, white, `line` border): Call (`tel:`), WhatsApp (`wa.me`, green icon), Email (`mailto:`), Directions. Reuse the existing lucide icons already imported in `page.tsx` (`Phone`, `MessageCircle`, `Mail`, `MapPin`, `Building2`).
- **Your trip** — Destination, Duration (`s.trip.days`), Lead guest (`s.traveler.leadName`), Departs (`s.trip.startDate`).

### 7. Support band  ← emphasized
Navy rounded card with faint concentric gold ring decorations top-right. `24×7 EMERGENCY` micro-label with a shield icon (`ShieldAlert`), then the phone (`s.agency.emergencyPhone`) in **Playfair 22px**. Concierge email (`s.agency.email`) secondary. Web = side-by-side; PDF = stacked in the side column with a divider.

### 8. Footer
Hairline top border; left = `TRIPCRAFT · {phone}`, right = `Issued {date}` (web) / `VOUCHER {number}` (PDF). 10px, `muted`, letter-tracked.

---

## Web layout (`src/app/v/[token]/page.tsx`)
Mobile-first single column, max width ~430px ticket. Order:
1. Hero (with `Download PDF voucher` CTA — navy button, gold download icon, full width — placed right under the check-in stub as in the mock).
2. Gold rule → Confirmation bar → **Check-in stub** → Download CTA → Service details → Vendor → Your trip → Support band → Footer.

Keep the existing `Card` / `SectionLabel` / `Field` helper components in that file — just restyle them to match the spec above.

## Print layout (`src/components/vouchers/voucher-document.tsx`)
Single A4 page. `@react-pdf/renderer` `StyleSheet` (it does NOT support `color-mix`, CSS vars, gradients-as-CSS, `::before/::after`, or `gap` reliably — use explicit values, nested `<View>`s, and margins). Layout:
1. Hero band (full width, ~300px) → gold rule.
2. Confirmation bar (full width).
3. **Two columns**: main (flex 1.5) = Service details, Vendor, Your trip. Side (flex 1) = **Check-in stub** (QR centered) then Support band.
4. Fixed footer.

The existing file already has most of these styles (`hero`, `accent`, `card`, `field*`, `emergency`, `qrCard`, `footer`) — refactor toward the new spec rather than starting over. Notably: add the monogram seal, the meta strip in the hero, the check-in stub head + instruction copy, and the concentric-ring support treatment.

---

## Generic behavior (flex across categories)
The mock shows a HOTEL example, but the layout must generalize:
- **Eyebrow** comes from the existing `CATEGORY_LABEL` map (already in both files).
- **Hero meta strip** labels should adapt: HOTEL → Check-in / Check-out / Guests / Nights; TRANSFER → Date / Time / Pax; ACTIVITY/SIGHTSEEING → Date / Pax; etc. Derive sensibly from `s.service.startDate/endDate`, `s.service.quantity`, `s.traveler.travelers`. Where a value is missing, omit that stat (don't render an em-dash column).
- Everything else (confirmation, vendor, trip, support) is category-agnostic and already in the snapshot.

## Interactions & states (web only; PDF is static)
- Contact chips are real links: `tel:`, `https://wa.me/{digits}`, `mailto:`, and a maps URL for Directions.
- Download CTA → `/api/vouchers/{voucher.id}/pdf` (target `_blank`), exactly as today.
- Hover on chips: border shifts toward `sand-200` (match existing hover treatment).
- Render guards: hide Confirmation bar, individual fields, and contact chips when their snapshot value is null (the current file already does this — preserve it).

## Open question for the team
The hero image needs a source. `VoucherSnapshot` has no image field today. Options, in order of preference:
1. Add an optional `heroImageUrl` to the snapshot (e.g. vendor cover photo, or a destination/category stock image) in `buildVoucherSnapshot`.
2. Fall back to the **imagery-off** treatment (solid navy + gold glow) when absent — the design already specifies this state, so the voucher looks intentional with no photo.

Until #1 is decided, ship with the imagery-off hero as the default.

## Files in this bundle
- `Travel Voucher.html` — the high-fidelity design reference (both surfaces, side by side). Open it in a browser to inspect exact spacing/colors; it carries the full CSS.

## Assets
- No raster assets required. QR is generated server-side (existing `qrcode` package). Icons come from `lucide-react` (already a dependency). Fonts (Playfair Display, Inter) are already configured in the app.
