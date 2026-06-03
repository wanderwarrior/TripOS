// Display helpers for travel segments, shared by the HTML preview
// (preview-renderer) and the PDF proposal (proposal-document) so the journey
// duration + stop summary read identically on screen and in the document.

/** "10 h 30 m" between two times. Spans midnight / multiple days fine. */
export function formatJourneyDuration(
  departure: Date | string,
  arrival: Date | string
): string | null {
  const dep = new Date(departure).getTime();
  const arr = new Date(arrival).getTime();
  if (!Number.isFinite(dep) || !Number.isFinite(arr) || arr <= dep) return null;
  const mins = Math.round((arr - dep) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} h ${m} m`;
}

/** "Mumbai (BOM)" → "Mumbai" for the human-facing "via …" text. */
function cityOf(label: string): string {
  return label.replace(/\s*\([^)]*\)\s*$/, "").trim() || label.trim();
}

/**
 * Stop summary line. For a flight: "Non-stop" when there are no stops, else
 * "1 stop via Mumbai" / "2 stops via Mumbai, Hyderabad". For a train we only
 * surface it when there are recorded stops (every train stops en route, so
 * "Non-stop" would be misleading).
 */
export function formatStopSummary(
  stops: string[] | null | undefined,
  type: "FLIGHT" | "TRAIN",
  // Optional fallback: a flight saved before stops were tracked still carries
  // its leg numbers (e.g. "6E 324, 6E 5106"). When no structured stops exist we
  // infer the count from the number of legs — we just can't name the city.
  identifier?: string | null
): string | null {
  const cities = (stops ?? []).map(cityOf).filter(Boolean);
  if (cities.length > 0) {
    const noun = cities.length === 1 ? "stop" : "stops";
    return `${cities.length} ${noun} via ${cities.join(", ")}`;
  }
  if (type === "FLIGHT") {
    const legs = (identifier ?? "")
      .split(/[,/]+|\band\b/i)
      .map((s) => s.trim())
      .filter(Boolean);
    if (legs.length > 1) {
      const n = legs.length - 1;
      return `${n} ${n === 1 ? "stop" : "stops"}`;
    }
    return "Non-stop";
  }
  return null;
}
