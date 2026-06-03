import "server-only";
import type { FlightEnrichment, EnrichmentResult } from "./types";

// Flight schedule lookup via AeroDataBox (RapidAPI). Free tier is enough for
// proposal-building. We hit the "flight by number + date" endpoint, which
// returns the scheduled route + times for that day.
//
//   GET https://aerodatabox.p.rapidapi.com/flights/number/{number}/{date}
//   headers: X-RapidAPI-Key, X-RapidAPI-Host
//
// The response is an array of matching legs (a flight number can have >1 leg).
// We pick the first. Parsing is defensive — any missing field degrades to null
// rather than throwing, so a partial result still helps the operator.

const HOST = "aerodatabox.p.rapidapi.com";

type AdbAirport = {
  iata?: string;
  icao?: string;
  name?: string;
  shortName?: string;
  municipalityName?: string;
};
type AdbMovement = {
  airport?: AdbAirport;
  scheduledTime?: { local?: string; utc?: string };
  revisedTime?: { local?: string; utc?: string };
};
type AdbFlight = {
  number?: string;
  airline?: { name?: string };
  departure?: AdbMovement;
  arrival?: AdbMovement;
};

/** "Delhi (DEL)" from an airport object, falling back through its fields. */
function airportLabel(a: AdbAirport | undefined): string {
  if (!a) return "";
  const place = a.municipalityName || a.shortName || a.name || "";
  const code = a.iata || a.icao || "";
  if (place && code) return `${place} (${code})`;
  return place || code || "";
}

/** Airport code used to detect whether two legs connect. */
function airportCode(a: AdbAirport | undefined): string {
  return (a?.iata || a?.icao || "").toUpperCase();
}

/** Comparable epoch ms for a movement's scheduled time (UTC preferred). */
function movementTime(m: AdbMovement | undefined): number {
  const s = m?.scheduledTime?.utc || m?.scheduledTime?.local;
  if (!s) return Number.NaN;
  const t = Date.parse(s.replace(" ", "T"));
  return Number.isNaN(t) ? Number.NaN : t;
}

/**
 * A single flight number can operate several legs on a date. Build the chain
 * the passenger actually flies: start at the earliest departure, then keep
 * extending while the next leg departs from where the previous one arrived
 * (and after it lands). This turns A→B, B→C into one A→C through-journey while
 * NOT merging same-number legs that don't connect (e.g. a return A→B, B→A).
 */
function buildChain(list: AdbFlight[]): AdbFlight[] {
  const legs = list
    .filter((f) => f.departure && f.arrival)
    .sort((a, b) => movementTime(a.departure) - movementTime(b.departure));
  if (legs.length <= 1) return legs;

  const chain = [legs[0]];
  const used = new Set([0]);
  let current = legs[0];
  for (;;) {
    const arrCode = airportCode(current.arrival?.airport);
    const arrTime = movementTime(current.arrival);
    const nextIdx = legs.findIndex((leg, i) => {
      if (used.has(i)) return false;
      const samePlace =
        airportCode(leg.departure?.airport) === arrCode && arrCode !== "";
      const after =
        !Number.isNaN(arrTime) && movementTime(leg.departure) >= arrTime;
      return samePlace && after;
    });
    if (nextIdx === -1) break;
    used.add(nextIdx);
    current = legs[nextIdx];
    chain.push(current);
  }
  return chain;
}

// AeroDataBox local times look like "2026-01-03 06:30-08:00" (date, space,
// time, tz offset). The datetime-local input wants "YYYY-MM-DDTHH:mm" in plain
// local clock — so we lift the date + HH:mm and drop the offset.
function toLocalInput(t: { local?: string; utc?: string } | undefined): string | null {
  const s = t?.local || t?.utc;
  if (!s) return null;
  const m = s.match(/(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  return m ? `${m[1]}T${m[2]}` : null;
}

function normalizeNumber(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

/**
 * @param flightNumber e.g. "6E-234" / "6E 234" / "6E234"
 * @param dateISO      "YYYY-MM-DD" the flight departs (improves accuracy a lot)
 * @param key          AeroDataBox (RapidAPI) key — agency's own, or server env
 */
export async function lookupFlight(
  flightNumber: string,
  dateISO: string | null,
  key: string | null
): Promise<EnrichmentResult<FlightEnrichment>> {
  if (!key) {
    return {
      ok: false,
      error:
        "Flight lookup isn't set up. Add your AeroDataBox API key in Settings → Integrations.",
    };
  }
  const num = normalizeNumber(flightNumber);
  if (!num) return { ok: false, error: "Enter a flight number first." };

  const datePart = dateISO ? `/${dateISO}` : "";
  const url =
    `https://${HOST}/flights/number/${encodeURIComponent(num)}${datePart}` +
    `?withAircraftImage=false&withLocation=false`;

  let json: unknown;
  try {
    const res = await fetch(url, {
      headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST },
    });
    if (res.status === 404) {
      return { ok: false, error: "No flight found for that number and date." };
    }
    if (res.status === 429) {
      return { ok: false, error: "Flight lookup quota reached — try later or enter manually." };
    }
    if (!res.ok) {
      return { ok: false, error: `Flight lookup failed (${res.status}).` };
    }
    json = await res.json();
  } catch {
    return { ok: false, error: "Couldn't reach the flight service." };
  }

  // Endpoint returns an array; some shapes wrap it. Normalize to a list.
  const list: AdbFlight[] = Array.isArray(json)
    ? (json as AdbFlight[])
    : Array.isArray((json as { flights?: AdbFlight[] })?.flights)
      ? (json as { flights: AdbFlight[] }).flights
      : [];
  if (list.length === 0) {
    return { ok: false, error: "No flight found for that number and date." };
  }

  // Merge connecting legs flown under the same number into one through-journey.
  const chain = buildChain(list);
  const first = chain[0] ?? list[0];
  const last = chain[chain.length - 1] ?? first;
  // Intermediate stops = the arrival airport of every leg except the last.
  const stops = chain
    .slice(0, -1)
    .map((leg) => airportLabel(leg.arrival?.airport))
    .filter(Boolean);

  return {
    ok: true,
    data: {
      airline: first.airline?.name?.trim() || null,
      flightNumber: first.number?.trim() || flightNumber.trim(),
      from: airportLabel(first.departure?.airport),
      to: airportLabel(last.arrival?.airport),
      departureLocal: toLocalInput(first.departure?.scheduledTime),
      arrivalLocal: toLocalInput(last.arrival?.scheduledTime),
      stops,
    },
  };
}
