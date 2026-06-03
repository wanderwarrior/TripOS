import "server-only";
import type {
  TrainStation,
  TrainEnrichment,
  EnrichmentResult,
} from "./types";

// Indian Railways schedule via eRail (erail.in) — a free, public, keyless
// source. We call `getTrains`, which returns a "~"/"^"-delimited summary
// carrying the train name, origin, destination, departure, arrival and total
// run time. No API key or subscription is required.
//
// Field layout of a train record (split by "~"), confirmed across trains:
//   0 number · 1 name · 2 srcName · 3 srcCode · 4 dstName · 5 dstCode
//   10 departure "HH.MM" · 11 arrival "HH.MM" · 12 duration "HH.MM" · 13 days
//
// We derive the destination's day offset from the *duration* (not the arrival
// clock) so multi-day journeys land on the right calendar day.

const GET_TRAINS = "https://erail.in/rail/getTrains.aspx";

export type TrainSchedule = {
  trainName: string | null;
  trainNumber: string;
  route: TrainStation[];
};

/** "16.25" / "16:25" → "16:25"; anything else → null. */
function toHHMM(v: string | undefined): string | null {
  if (!v) return null;
  const m = v.match(/^(\d{1,2})[.:](\d{2})/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null;
}

/** "04.20" (4h 20m) → minutes. */
function durationToMinutes(v: string | undefined): number | null {
  if (!v) return null;
  const m = v.match(/^(\d{1,3})[.:](\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function normalizeNumber(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

/**
 * @param trainNumber e.g. "12951"
 * @param _key        unused — eRail needs no key (kept for interface symmetry)
 */
export async function lookupTrainSchedule(
  trainNumber: string,
  _key: string | null
): Promise<EnrichmentResult<TrainSchedule>> {
  const num = normalizeNumber(trainNumber);
  if (!num) return { ok: false, error: "Enter a train number first." };

  const url = `${GET_TRAINS}?TrainNo=${encodeURIComponent(
    num
  )}&DataSource=0&Language=0&Cache=true`;

  let text: string;
  try {
    // eRail blocks requests without a browser-like UA.
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      return { ok: false, error: `Train lookup failed (${res.status}).` };
    }
    text = await res.text();
  } catch {
    return { ok: false, error: "Couldn't reach the train service." };
  }

  // "<header>^<train1>^<train2>…"; train records start with the train number.
  const records = text
    .split("^")
    .map((c) => c.split("~"))
    .filter((f) => /^\d{4,6}$/.test((f[0] || "").trim()));
  const rec = records.find((f) => f[0].trim() === num) || records[0];
  if (!rec) {
    return { ok: false, error: "No train found for that number." };
  }

  const trainName = (rec[1] || "").trim() || null;
  const depClock = toHHMM(rec[10]);
  const arrClock = toHHMM(rec[11]);
  const durMin = durationToMinutes(rec[12]);

  // Destination day offset from the run time (handles overnight / multi-day).
  let destDayOffset = 0;
  if (depClock && durMin != null) {
    const [h, m] = depClock.split(":").map(Number);
    destDayOffset = Math.floor((h * 60 + m + durMin) / 1440);
  }

  const route: TrainStation[] = [
    {
      code: (rec[3] || "").trim(),
      name: (rec[2] || "").trim(),
      arrival: null,
      departure: depClock,
      dayOffset: 0,
      distanceKm: null,
    },
    {
      code: (rec[5] || "").trim(),
      name: (rec[4] || "").trim(),
      arrival: arrClock,
      departure: null,
      dayOffset: destDayOffset,
      distanceKm: null,
    },
  ];

  return { ok: true, data: { trainName, trainNumber: num, route } };
}

/** Combine a journey date + a station's clock + its day offset → datetime-local. */
function combineLocal(
  journeyDateISO: string,
  hhmm: string | null,
  dayOffset: number
): string | null {
  if (!hhmm) return null;
  const [y, m, d] = journeyDateISO.split("-").map(Number);
  if (!y || !m || !d) return null;
  const base = new Date(Date.UTC(y, m - 1, d + dayOffset));
  const iso = base.toISOString().slice(0, 10);
  return `${iso}T${hhmm}`;
}

// Match a free-text hint ("Mumbai", "MMCT", "Mumbai Central (MMCT)") to a station.
function matchStation(route: TrainStation[], hint: string): number {
  const h = hint.trim().toLowerCase();
  if (!h) return -1;
  const codeMatch = route.findIndex(
    (s) => s.code && h.includes(s.code.toLowerCase())
  );
  if (codeMatch >= 0) return codeMatch;
  return route.findIndex((s) => s.name && s.name.toLowerCase().includes(h));
}

/**
 * Resolve the operator's leg. With the origin → destination summary eRail
 * provides, from/to hints only match the endpoints; anything else falls back to
 * the full run (the common case — a train segment is its whole journey).
 */
export function resolveTrainLeg(
  schedule: TrainSchedule,
  journeyDateISO: string,
  fromHint: string,
  toHint: string
): TrainEnrichment {
  const route = schedule.route;
  const last = route.length - 1;

  let fromIdx = matchStation(route, fromHint);
  let toIdx = matchStation(route, toHint);
  if (fromIdx < 0 || toIdx < 0 || fromIdx >= toIdx) {
    fromIdx = 0;
    toIdx = last;
  }

  const board = route[fromIdx];
  const alight = route[toIdx];
  const label = (s: TrainStation) => (s.code ? `${s.name} (${s.code})` : s.name);

  return {
    trainName: schedule.trainName,
    trainNumber: schedule.trainNumber,
    from: label(board),
    to: label(alight),
    departureLocal: combineLocal(
      journeyDateISO,
      board.departure ?? board.arrival,
      board.dayOffset
    ),
    arrivalLocal: combineLocal(
      journeyDateISO,
      alight.arrival ?? alight.departure,
      alight.dayOffset
    ),
    route,
  };
}
