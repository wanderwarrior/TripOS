// Normalized shapes returned by the flight/train enrichment providers. The
// segment form consumes these directly to pre-fill its inputs, so the field
// names mirror the form (from / to / departureLocal / arrivalLocal). Times are
// "YYYY-MM-DDTHH:mm" strings suited to a <input type="datetime-local"> — they
// carry the *local clock at the station/airport* (what a ticket shows), which
// is exactly what an operator wants on the proposal.

export type FlightEnrichment = {
  airline: string | null;
  flightNumber: string;
  from: string; // origin, e.g. "Delhi (DEL)"
  to: string; // final destination, e.g. "Goa (GOI)"
  departureLocal: string | null; // origin departure
  arrivalLocal: string | null; // final-destination arrival
  // Intermediate stops for a through-flight flown under one number, e.g.
  // ["Mumbai (BOM)"]. Empty for a normal non-stop.
  stops: string[];
};

export type TrainStation = {
  code: string;
  name: string;
  arrival: string | null; // "HH:MM" clock, null at origin
  departure: string | null; // "HH:MM" clock, null at destination
  dayOffset: number; // days since the train departed its origin (0-based)
  distanceKm: number | null;
};

export type TrainEnrichment = {
  trainName: string | null;
  trainNumber: string;
  from: string;
  to: string;
  departureLocal: string | null;
  arrivalLocal: string | null;
  // Full station list so the UI can resolve an intermediate from/to leg.
  route: TrainStation[];
};

export type EnrichmentResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
