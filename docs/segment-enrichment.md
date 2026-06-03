# Flight & Train enrichment

When adding a travel segment, the operator types a **flight number** or **train
number**, clicks the ✨ button (or presses Enter), and the form auto-fills the
route, airline/train name, and scheduled departure/arrival times. They review
and save — nothing is written until they do.

## How it works

`segment-form-dialog.tsx` → server action → provider lookup → normalized result
back into the form.

| Layer | File |
|---|---|
| Normalized shapes | `src/lib/enrichment/types.ts` |
| Flight lookup (AeroDataBox) | `src/lib/enrichment/flights.ts` |
| Train lookup + leg resolution (eRail, keyless) | `src/lib/enrichment/trains.ts` |
| Server actions (auth-gated) | `src/server/actions/enrichment.ts` |
| UI (✨ Auto-fill buttons) | `src/components/segments/segment-form-dialog.tsx` |

The actions require a signed-in agency member (the lookups spend a shared
free-tier quota) and never touch the database.

### The journey date

Both lookups use the segment's chosen **departure date** (falling back to the
trip start date) to anchor the schedule:

- **Flights** — passed to AeroDataBox for an accurate same-day match.
- **Trains** — combined with each station's clock time, with day-rollover
  handled (long-distance trains cross midnight), so destination arrival lands
  on the correct calendar day. Without a date, a train lookup still returns the
  name + origin/destination but leaves the times blank.

### Connecting & through flights

- **Through-flight, one number** (e.g. a flight that stops en route under a
  single number): AeroDataBox returns each leg; we chain the ones that connect
  (next leg departs where the previous landed, and after) into one origin →
  final-destination journey and note `Via <stop>`.
- **Connecting flight, two+ numbers** (e.g. `6E 324, 6E 5177`): type both numbers
  comma-separated in the flight-number field and hit ✨. Each leg is looked up,
  then combined into one segment: origin → final destination, first-leg departure
  → last-leg arrival, airlines merged. The per-leg routing and the computed
  **layover** at each connection are written to Notes, e.g.

  ```
  6E 324: New Delhi (DEL) → Mumbai (BOM)
  Layover 4h 0m at Mumbai (BOM)
  6E 5177: Mumbai (BOM) → Mopa (GOX)
  ```

  If a leg's arrival airport ≠ the next leg's departure airport, a `⚠` line
  flags the mismatch instead of silently merging. Up to 3 legs.
- **Per-second rate limit:** the free plan limits calls/second, so multi-leg
  lookups are spaced ~1.2s apart to avoid a 429.

Alternatively, you can still model each leg as its own segment (separate PNRs,
separate proposal rows) — just enrich each one individually.

### Smart train legs

If the operator already typed `From`/`To`, the train lookup tries to match those
against the train's route (by station code or name) and fills the times for
**that leg**. Otherwise it uses the train's full origin → destination run.

## Setup (free)

**Trains need no setup** — eRail (erail.in) is keyless and works out of the box.

**Flights** need an AeroDataBox key, set **two ways** (agency key wins):

1. **Per agency (preferred)** — the owner pastes their key in **Settings →
   Integrations → Flight & train lookup** (in-app "How to get your flight lookup
   key" guide). Stored encrypted on `AgencySettings`; the quota is theirs.
   Resolution: `src/lib/enrichment/keys.ts`.
2. **Server-wide fallback** — set it in `.env`:

```bash
# Flights — AeroDataBox on RapidAPI
#   https://rapidapi.com/aedbx-aedbx/api/aerodatabox  (subscribe to the free Basic plan)
AERODATABOX_API_KEY="your-rapidapi-key"
```

With no flight key set anywhere, the flight ✨ reports "isn't set up" and manual
entry still works. Trains are unaffected (keyless).

## Train data source — eRail

`trains.ts` calls eRail's public `getTrains` endpoint (no key, no quota). It
returns the train name, origin → destination, departure, arrival and total run
time; the destination's calendar day is derived from the run time, so overnight
/ multi-day trains land on the correct date. It's an unofficial source —
accurate for proposal-building, and the operator can always edit.

## Free-tier caveats

- **AeroDataBox** free plan has a monthly call quota; a 429 surfaces a
  "quota reached — enter manually" toast.
- **eRail** is free/keyless but unofficial — treat times as a strong draft.
