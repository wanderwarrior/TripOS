# Handoff: tripOS Motion System

## Overview
A cohesive motion system for the **tripOS** product, built entirely from the brand's **C·Stack** logo mark (three offset rounded "records" with the top one live in gold). It covers the moments where the product needs motion: first-run intro, app boot loader, inline spinners, skeleton loading, page/route transitions, and an empty state. The goal is a **premium, cinematic, calm** feel — slow reveals, soft easing, never busy — consistent across **dark and light** themes.

The reference file `tripOS Motion System.html` is an interactive showcase: each animation plays in its own card with a **↻ Replay** control, there's a **Replay all** button, and a **Dark/Light** theme toggle in the header.

## About the Design Files
The files in this bundle are **design references created in HTML/CSS/JS** — prototypes that demonstrate the intended look, timing, and behavior. They are **not** meant to be dropped into production as-is.

The task is to **recreate these animations in the target codebase using its existing environment and patterns** (e.g. React + CSS modules / styled-components / Tailwind / Framer Motion, Vue + transitions, SwiftUI, etc.). Reuse the app's existing logo component, color tokens, and theming mechanism. If no front-end environment exists yet, choose the most appropriate framework for the project and implement there.

The CSS keyframes in the reference are clean and portable — most can be ported nearly verbatim. Where the reference uses a CSS-only trick (e.g. class toggling via JS), map it to the framework's idiomatic approach (state + conditional classes, `<Transition>`, `AnimatePresence`, etc.).

## Fidelity
**High-fidelity.** Colors, timing, easing curves, and sizes are final and intentional. Recreate them precisely. The one thing that should come from the host app rather than this bundle is the **logo/mark component** — use the app's canonical `Mark`/`Logo` rather than re-inlining the SVG, as long as it matches the C·Stack geometry documented below.

---

## The Mark (foundation for everything)
All animations animate the three records of the **C·Stack** mark. SVG geometry (viewBox `0 0 100 100`):

```html
<svg class="mark" viewBox="0 0 100 100">
  <rect class="rec rec-top" x="22" y="22" width="44" height="15" rx="7.5"/>  <!-- gold "live" record -->
  <rect class="rec rec-mid" x="30" y="43" width="52" height="15" rx="7.5"/>
  <rect class="rec rec-bot" x="18" y="64" width="48" height="15" rx="7.5"/>
</svg>
```
- `.rec-top` is filled with the **accent (gold)**; `.rec-mid` and `.rec-bot` are filled with the **mark foreground** (near-black on light, off-white on dark).
- `transform-box: fill-box; transform-origin: center;` is set on `.rec` so each record scales/rotates about its own center.

### Wordmark
`trip` in the foreground color + `OS` in the accent color, weight 700, `letter-spacing: -.04em`. In the lockup the mark and wordmark sit **very tight** (gap ~1–3px).

---

## Animations

### 1 · Brand intro / splash  (`.intro`)
**Purpose:** first impression / brand moment.
**Sequence:** the three records fly in from the left and settle, bottom-first → mid → top, each blurring into focus; the gold top record lands last and then **breathes** (a slow infinite gold glow pulse); the wordmark fades up; a tagline fades up after it; a soft radial gold glow pops behind the lockup and settles.
**Timing:** records `0.8s` each, staggered `0s / .14s / .3s`; wordmark `.9s` at `.58s`; tagline `.9s` at `.8s`; glow `1.4s` at `.3s`; mark settle `1.2s`. Easing `cubic-bezier(.22,1,.36,1)`.
Trigger: plays on load and on Replay (toggle a `run` class — remove, force reflow, re-add).

### 2 · App loader / first boot  (`.loader`)
**Purpose:** cover real boot/data-loading; **loops until "loaded", then resolves into the logo.**
**Loop state (`.loading`):** the gold "live" signal sweeps **down** the stack — each record briefly turns gold and scales up `1.05`, staggered `0s / .18s / .36s`, `1.5s` loop. A thin track bar shows an indeterminate gold sweep. A mono status line cycles `Booting… → Syncing records… → Almost there…`.
**Resolve state (`.done`):** sweep stops, top record is gold, mark does a quick `settlePop` (scale down to `.9` and back), wordmark fades up, bar fades out, status reads `Ready`.
**Implementation:** in a real app, stay in `.loading` while the boot promise is pending; switch to `.done` when it resolves. The reference fakes this with a 3s timeout.

### 3 · Inline spinners  (`.wave`, `.ring`, button)
**Purpose:** small in-context loading — buttons, rows, toolbars.
- **Wave:** 3 gold bars scaling vertically `0.35 → 1`, staggered `.12s`, `1s` loop (`scaleY` + opacity). Two sizes (`.wave` / `.wave.sm`).
- **Ring:** 26px SVG ring, gold arc (`stroke-dasharray: 90 210`) spinning `1.1s linear infinite` over a track circle.
- **Button:** primary gold button; on `.loading` it swaps label `Sync trips → Syncing…` and reveals an inline `.wave.sm` (navy bars on the gold button). Reverts after the async action.

### 4 · Skeleton / content loading  (`.skelcard`, `.sk`)
**Purpose:** placeholder while content fetches (lists, detail panes).
A card with an avatar block + title/subtitle + three body lines. Each `.sk` element has a **gold-tinted shimmer**: `linear-gradient(100deg, skel 30%, skel-hi 50%, skel 70%)`, `background-size: 220% 100%`, animated `1.5s linear infinite`. Line widths `100% / 85% / 65%`. Replay = reset the animation.

### 5 · Page / route transition  (`.transcard`)
**Purpose:** navigating between routes (e.g. Dashboard → a Trip).
A **navy wipe panel carrying the mark** sweeps left→right across the viewport (`wipeX`, `1.15s`, `cubic-bezier(.65,0,.35,1)`); the mark fades in only while the panel covers the screen. Underneath, the outgoing screen drifts left + fades (`outLeft`) and the incoming screen slides in from the right (`inRight`, delayed `.28s`). In a router, trigger on route change and swap the screens at the wipe's midpoint.

### 6 · Empty state  (`.emptycard`)
**Purpose:** zero-data states (e.g. "No trips yet").
A dashed rounded frame containing the mark; the top and mid records **float** gently (`floatTop` / `floatMid`, ~`-5px`, `2.8s` ease-in-out infinite) and the frame border **pulses** toward gold. Calm, always-on, low-amplitude — it should read as breathing, not spinning. Includes heading, subtext, and a CTA chip.

---

## Design Tokens

### Easing
| Token | Value | Use |
|---|---|---|
| `--ease` | `cubic-bezier(.22,1,.36,1)` | reveals, settles (decelerate) |
| `--ease-io` | `cubic-bezier(.65,0,.35,1)` | wipes, sweeps (in-out) |

### Colors — Dark theme (`data-theme="dark"`)
| Token | Value |
|---|---|
| `--bg` | `#0A131C` |
| `--panel` | `#101e29` |
| `--panel-2` | `#0c1923` |
| `--stage` | `#0C1620` |
| `--fg` | `#EFEAE0` |
| `--muted` | `#7e93a3` |
| `--line` | `rgba(255,255,255,.09)` |
| `--mark-fg` | `#EFEAE0` |
| `--accent` (gold) | `#C8A96A` |
| `--skel` | `rgba(255,255,255,.06)` |
| `--skel-hi` | `rgba(200,169,106,.16)` |

### Colors — Light theme (`data-theme="light"`)
| Token | Value |
|---|---|
| `--bg` | `#EFEDE7` |
| `--panel` | `#FFFFFF` |
| `--panel-2` | `#F7F5F0` |
| `--stage` | `#F4F1EA` |
| `--fg` | `#16191D` |
| `--muted` | `#8a8378` |
| `--line` | `#E6E2D8` |
| `--mark-fg` | `#0C1620` |
| `--accent` (gold) | `#9F7C36` |
| `--skel` | `rgba(12,22,32,.05)` |
| `--skel-hi` | `rgba(159,124,54,.14)` |

### Brand constants
- Navy `#0C1620` · Gold `#C8A96A` (dark) / `#9F7C36` (light) · Paper `#EFEDE7`
- Fonts: **Inter** (UI/wordmark, 400–800), **JetBrains Mono** (status/labels). Wordmark weight 700, `letter-spacing: -.04em`.

### Radius
- Cards `18px` · stages inherit · buttons `11px` · chips `20px` · mark records `rx 7.5` (on the 100-unit viewBox).

---

## Theming
The reference toggles `data-theme` on `<body>` and lets all values fall out of CSS variables; both themes transition over `.5s var(--ease)`. In the host app, hook these tokens into the existing theme provider rather than a body attribute if one exists.

## Accessibility
Wrap continuous/looping motion in `@media (prefers-reduced-motion: reduce)` and either disable or strongly reduce it. The intro, loader sweep, spinners, skeleton shimmer, and empty-state float should all degrade to a static or minimal state. (Not yet implemented in the reference — please add on integration.)

## Files in this bundle
- `tripOS Motion System.html` — the full interactive showcase (all 6 animations, theme toggle, replay controls). **Primary reference** — open it and use Replay to study timing.
- `logo-marks-v4.jsx` — the canonical mark system (`MarkV4`), including the `stack` variant used throughout. Reference for exact geometry; map to the host app's logo component.

## Implementation order (suggested)
1. Port the **mark** + **theme tokens** first — everything else depends on them.
2. **Spinners** + **skeleton** (most reused, lowest risk).
3. **Loader** (wire to real boot/data promise).
4. **Intro splash**.
5. **Page transition** (wire to the router).
6. **Empty state**.
7. Add **`prefers-reduced-motion`** fallbacks.
