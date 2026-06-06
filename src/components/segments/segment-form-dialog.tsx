"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Loader2,
  Plane,
  Sparkles,
  Train,
} from "lucide-react";
import { toast } from "sonner";
import type { TravelSegment, TravelSegmentType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createTravelSegmentAction,
  updateTravelSegmentAction,
  type CreateSegmentInput,
} from "@/server/actions/segments";
import {
  enrichFlightAction,
  enrichTrainAction,
} from "@/server/actions/enrichment";
import type { FlightEnrichment } from "@/lib/enrichment/types";
import { cn, dayNumberForDate } from "@/lib/utils";

// Segment times are a fixed wall-clock (local airport time, stored as UTC).
// The datetime-local input must show exactly that wall-clock — never shifted by
// the viewer's timezone — so we read/write the UTC wall-clock directly.
function isoLocal(d: Date | string | null | undefined) {
  if (!d) return "";
  // A datetime-local / ISO string already carries the wall-clock — take it as-is.
  if (typeof d === "string") return d.slice(0, 16);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

/** Parse a datetime-local string as a fixed wall-clock instant (epoch, UTC). */
function parseLocal(s: string | null | undefined): number {
  if (!s) return NaN;
  return Date.parse(s.slice(0, 16) + ":00Z");
}

/** datetime-local default: the trip's start date at 09:00. */
function defaultDeparture(tripStartDate: string | null): string {
  const day = tripStartDate?.slice(0, 10) ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? `${day}T09:00` : "";
}

/** Pull the airport/station code out of a "Place (CODE)" label. */
function codeOf(label: string): string {
  const m = label.match(/\(([^)]+)\)\s*$/);
  return m ? m[1].toUpperCase() : "";
}

/** Human layover/duration between two datetime-local strings, e.g. "1h 35m". */
function durationBetween(aLocal: string, bLocal: string): string | null {
  const a = new Date(aLocal).getTime();
  const b = new Date(bLocal).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  const mins = Math.round((b - a) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h ? `${h}h ` : ""}${m}m`.trim();
}

function fmtDayDate(tripStartDate: string, dayNumber: number): string {
  const d = new Date(tripStartDate);
  d.setDate(d.getDate() + (dayNumber - 1));
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

type Props = {
  tripId: string;
  tripDays: number;
  /** ISO trip start date — drives automatic day assignment. */
  tripStartDate?: string | null;
  segment?: TravelSegment;
  defaultType?: TravelSegmentType;
  trigger: React.ReactNode;
};

export function SegmentFormDialog({
  tripId,
  tripDays,
  tripStartDate = null,
  segment,
  defaultType = "FLIGHT",
  trigger,
}: Props) {
  const editing = !!segment;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<TravelSegmentType>(
    segment?.type ?? defaultType
  );

  const [form, setForm] = useState({
    // Manual day number — only used as a fallback when the trip has no
    // start date to anchor against.
    dayNumber: segment?.dayNumber ?? 1,
    from: segment?.from ?? "",
    to: segment?.to ?? "",
    departureTime: segment
      ? isoLocal(segment.departureTime)
      : defaultDeparture(tripStartDate),
    arrivalTime: isoLocal(segment?.arrivalTime),
    airline: segment?.airline ?? "",
    flightNumber: segment?.flightNumber ?? "",
    pnr: segment?.pnr ?? "",
    trainName: segment?.trainName ?? "",
    trainNumber: segment?.trainNumber ?? "",
    coach: segment?.coach ?? "",
    seat: segment?.seat ?? "",
    // Intermediate stop labels for a connecting / through journey.
    stops: segment?.stops ?? ([] as string[]),
    notes: segment?.notes ?? "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Changing the departure shifts the arrival by the same amount, preserving
  // the journey duration — so the arrival date stays correct automatically
  // (a train departing late evening still arrives the next morning, etc.).
  function onDepartureChange(value: string) {
    setForm((f) => {
      let arrivalTime = f.arrivalTime;
      const oldDep = parseLocal(f.departureTime);
      const oldArr = parseLocal(f.arrivalTime);
      const newDep = parseLocal(value);
      if (
        value &&
        Number.isFinite(oldDep) &&
        Number.isFinite(oldArr) &&
        Number.isFinite(newDep) &&
        oldArr > oldDep
      ) {
        arrivalTime = isoLocal(new Date(newDep + (oldArr - oldDep)));
      }
      return { ...f, departureTime: value, arrivalTime };
    });
  }

  const [enriching, startEnrich] = useTransition();

  // The journey date that anchors a looked-up schedule: the chosen departure
  // date if set, else the trip start date. Returns "YYYY-MM-DD" or null.
  function journeyDate(): string | null {
    if (form.departureTime) return form.departureTime.slice(0, 10);
    if (tripStartDate) {
      const d = new Date(tripStartDate);
      if (!Number.isNaN(d.getTime())) return isoLocal(d).slice(0, 10);
    }
    return null;
  }

  function fetchFlight() {
    // Accept one number, or several connecting legs typed together:
    // "6E 324, 6E 5177" / "6E324 / 6E5177".
    const numbers = form.flightNumber
      .split(/[,/+]| and /i)
      .map((s) => s.trim())
      .filter(Boolean);
    if (numbers.length === 0) {
      toast.error("Enter a flight number to look up.");
      return;
    }
    if (numbers.length > 3) {
      toast.error("Enter up to 3 connecting flight numbers.");
      return;
    }

    startEnrich(async () => {
      const date = journeyDate();
      // Look each leg up in the order typed (= travel order). Space multi-leg
      // calls out — the AeroDataBox free plan enforces a per-second rate limit,
      // so back-to-back lookups for a connection would otherwise 429.
      const legs: FlightEnrichment[] = [];
      for (let i = 0; i < numbers.length; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 1200));
        const res = await enrichFlightAction({ flightNumber: numbers[i], date });
        if (!res.ok) {
          toast.error(`${numbers[i]}: ${res.error}`);
          return;
        }
        legs.push(res.data);
      }

      const first = legs[0];
      const last = legs[legs.length - 1];

      // --- Single flight (possibly a same-number through-flight) ---
      if (legs.length === 1) {
        const viaNote = first.stops.length > 0 ? `Via ${first.stops.join(", ")}` : "";
        setForm((f) => ({
          ...f,
          airline: first.airline || f.airline,
          flightNumber: first.flightNumber || f.flightNumber,
          from: first.from || f.from,
          to: first.to || f.to,
          departureTime: first.departureLocal || f.departureTime,
          arrivalTime: first.arrivalLocal || f.arrivalTime,
          stops: first.stops,
          notes:
            viaNote && !f.notes.includes(viaNote)
              ? f.notes ? `${f.notes}\n${viaNote}` : viaNote
              : f.notes,
        }));
        toast.success(
          first.stops.length > 0
            ? `Filled in — through flight with a stop at ${first.stops.join(", ")}.`
            : "Flight details filled in — review and save."
        );
        return;
      }

      // --- Connecting flight (multiple numbers) → one journey ---
      // Per-leg breakdown + layover/connection-airport sanity, written to notes
      // so the proposal reflects the routing.
      const lines: string[] = [];
      const connectionPoints: string[] = [];
      // Full ordered list of intermediate stops (each leg's own through-stops,
      // plus the connection airport between legs) — drives "N stops via …".
      const journeyStops: string[] = [];
      legs.forEach((leg, i) => {
        const num = (leg.flightNumber || numbers[i]).toUpperCase();
        const via = leg.stops.length > 0 ? ` (via ${leg.stops.join(", ")})` : "";
        lines.push(`${num}: ${leg.from} → ${leg.to}${via}`);
        journeyStops.push(...leg.stops);
        if (i < legs.length - 1) {
          const next = legs[i + 1];
          connectionPoints.push(leg.to);
          journeyStops.push(leg.to);
          // Layover at the connection point.
          if (leg.arrivalLocal && next.departureLocal) {
            const dur = durationBetween(leg.arrivalLocal, next.departureLocal);
            if (dur) lines.push(`Layover ${dur} at ${leg.to}`);
          }
          // Flag if the leg doesn't actually connect (arrival ≠ next departure).
          if (codeOf(leg.to) && codeOf(next.from) && codeOf(leg.to) !== codeOf(next.from)) {
            lines.push(`⚠ ${num} arrives ${leg.to} but next leg departs ${next.from}`);
          }
        }
      });
      const connectionNote = lines.join("\n");
      const airlines = Array.from(
        new Set(legs.map((l) => l.airline).filter(Boolean))
      ).join(" / ");

      setForm((f) => ({
        ...f,
        airline: airlines || f.airline,
        flightNumber: numbers.map((n) => n.toUpperCase()).join(", "),
        from: first.from || f.from,
        to: last.to || f.to,
        departureTime: first.departureLocal || f.departureTime,
        arrivalTime: last.arrivalLocal || f.arrivalTime,
        stops: journeyStops,
        notes: f.notes
          ? `${f.notes}\n${connectionNote}`
          : connectionNote,
      }));
      toast.success(
        `Connecting flight filled in — ${legs.length} legs via ${connectionPoints.join(", ")}.`
      );
    });
  }

  function fetchTrain() {
    if (!form.trainNumber.trim()) {
      toast.error("Enter a train number to look up.");
      return;
    }
    startEnrich(async () => {
      const res = await enrichTrainAction({
        trainNumber: form.trainNumber.trim(),
        date: journeyDate(),
        fromHint: form.from,
        toHint: form.to,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const d = res.data;
      setForm((f) => ({
        ...f,
        trainName: d.trainName || f.trainName,
        trainNumber: d.trainNumber || f.trainNumber,
        from: d.from || f.from,
        to: d.to || f.to,
        departureTime: d.departureLocal || f.departureTime,
        arrivalTime: d.arrivalLocal || f.arrivalTime,
      }));
      toast.success(
        d.departureLocal
          ? "Train details filled in — review and save."
          : "Train found — set a departure date to fill in times."
      );
    });
  }

  // --- Derived: which itinerary day this segment lands on ---
  const rawDerivedDay = useMemo(
    () =>
      form.departureTime
        ? dayNumberForDate(new Date(form.departureTime), tripStartDate)
        : null,
    [form.departureTime, tripStartDate]
  );
  const clampedDay =
    rawDerivedDay != null
      ? Math.max(1, Math.min(tripDays, rawDerivedDay))
      : Math.max(1, Math.min(tripDays, form.dayNumber || 1));
  // True when the picked departure falls before the trip starts or after it
  // ends — the day gets clamped, but we warn the operator.
  const outOfRange =
    rawDerivedDay != null && (rawDerivedDay < 1 || rawDerivedDay > tripDays);

  // --- Derived: the day the segment ARRIVES (for overnight / multi-day legs) ---
  const rawArrivalDay = useMemo(
    () =>
      form.arrivalTime
        ? dayNumberForDate(new Date(form.arrivalTime), tripStartDate)
        : null,
    [form.arrivalTime, tripStartDate]
  );
  const clampedArrivalDay =
    rawArrivalDay != null
      ? Math.max(1, Math.min(tripDays, rawArrivalDay))
      : clampedDay;
  // The journey crosses into a later itinerary day (e.g. an overnight train).
  const spansDays =
    rawArrivalDay != null &&
    rawDerivedDay != null &&
    rawArrivalDay > rawDerivedDay;

  // --- Derived: arrival-before-departure check ---
  const timeError = useMemo(() => {
    if (!form.departureTime || !form.arrivalTime) return null;
    const dep = new Date(form.departureTime).getTime();
    const arr = new Date(form.arrivalTime).getTime();
    if (Number.isFinite(dep) && Number.isFinite(arr) && arr <= dep) {
      return "Arrival is before departure — check the date and time. An overnight journey should arrive on a later date.";
    }
    return null;
  }, [form.departureTime, form.arrivalTime]);

  const tripRangeLabel =
    tripStartDate != null
      ? `${fmtDayDate(tripStartDate, 1)} – ${fmtDayDate(tripStartDate, tripDays)}`
      : null;

  function submit() {
    if (!form.from.trim() || !form.to.trim()) {
      toast.error("From and To are required");
      return;
    }
    if (!form.departureTime || !form.arrivalTime) {
      toast.error("Departure and arrival times are required");
      return;
    }
    if (timeError) {
      toast.error(timeError);
      return;
    }

    const payload: CreateSegmentInput = {
      tripId,
      type,
      dayNumber: clampedDay,
      from: form.from,
      to: form.to,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      airline: form.airline || null,
      flightNumber: form.flightNumber || null,
      pnr: form.pnr || null,
      trainName: form.trainName || null,
      trainNumber: form.trainNumber || null,
      coach: form.coach || null,
      seat: form.seat || null,
      stops: form.stops,
      notes: form.notes || null,
    };

    startTransition(async () => {
      try {
        if (editing) {
          await updateTravelSegmentAction(segment!.id, payload);
          toast.success("Segment updated");
        } else {
          await createTravelSegmentAction(payload);
          toast.success("Segment added");
        }
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit segment" : "Add travel segment"}
          </DialogTitle>
          <DialogDescription>
            Flight or train details — shows on the itinerary and proposal.
            {tripRangeLabel ? ` Trip runs ${tripRangeLabel}.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <TypeButton active={type === "FLIGHT"} onClick={() => setType("FLIGHT")}>
            <Plane className="h-4 w-4" />
            Flight
          </TypeButton>
          <TypeButton active={type === "TRAIN"} onClick={() => setType("TRAIN")}>
            <Train className="h-4 w-4" />
            Train
          </TypeButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="seg-from">From</Label>
            <Input
              id="seg-from"
              value={form.from}
              onChange={(e) => update("from", e.target.value)}
              placeholder="Delhi (DEL)"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seg-to">To</Label>
            <Input
              id="seg-to"
              value={form.to}
              onChange={(e) => update("to", e.target.value)}
              placeholder="Goa (GOI)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seg-dep">Departure</Label>
            <Input
              id="seg-dep"
              type="datetime-local"
              value={form.departureTime}
              onChange={(e) => onDepartureChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seg-arr">Arrival</Label>
            <Input
              id="seg-arr"
              type="datetime-local"
              value={form.arrivalTime}
              min={form.departureTime || undefined}
              onChange={(e) => update("arrivalTime", e.target.value)}
              className={
                timeError ? "border-bad/50 focus-visible:ring-bad/20" : ""
              }
            />
          </div>

          {/* Day assignment — derived from the departure date when the trip
              has a start date; a manual input otherwise. */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Itinerary day</Label>
            {tripStartDate ? (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-[10px] border px-3 py-2.5 text-sm",
                  outOfRange
                    ? "border-bad/30 bg-bad-soft/60 text-bad"
                    : "border-[var(--gold-line)] bg-gold-soft/60 text-ink"
                )}
              >
                <CalendarClock className="h-4 w-4 shrink-0 text-gold-deep" />
                {form.departureTime ? (
                  <span>
                    Departs{" "}
                    <span className="font-medium">Day {clampedDay}</span>
                    {" · "}
                    {fmtDayDate(tripStartDate, clampedDay)}
                    {spansDays && (
                      <>
                        {" → arrives "}
                        <span className="font-medium">
                          Day {clampedArrivalDay}
                        </span>
                        {" · "}
                        {fmtDayDate(tripStartDate, clampedArrivalDay)}
                      </>
                    )}
                    {outOfRange ? (
                      <span className="ml-1.5 text-bad">
                        — departure is outside the trip window; clamped to the
                        nearest day.
                      </span>
                    ) : (
                      <span className="ml-1.5 text-muted-foreground">
                        — assigned from the departure date.
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Pick a departure time and the day fills in automatically.
                  </span>
                )}
              </div>
            ) : (
              <>
                <Input
                  type="number"
                  min={1}
                  max={tripDays}
                  value={form.dayNumber}
                  onChange={(e) =>
                    update("dayNumber", Number(e.target.value || 1))
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Set a trip start date to have this assigned automatically
                  from the departure date.
                </p>
              </>
            )}
          </div>

          {type === "FLIGHT" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="seg-airline">Airline</Label>
                <Input
                  id="seg-airline"
                  value={form.airline}
                  onChange={(e) => update("airline", e.target.value)}
                  placeholder="Indigo, Vistara…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seg-flight">Flight number</Label>
                <div className="flex gap-2">
                  <Input
                    id="seg-flight"
                    value={form.flightNumber}
                    onChange={(e) => update("flightNumber", e.target.value)}
                    placeholder="6E-234  ·  or 6E-324, 6E-5177"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        fetchFlight();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Auto-fill route & times. For a connecting flight, enter both numbers comma-separated."
                    onClick={fetchFlight}
                    disabled={enriching || !form.flightNumber.trim()}
                  >
                    {enriching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seg-pnr">PNR</Label>
                <Input
                  id="seg-pnr"
                  value={form.pnr}
                  onChange={(e) => update("pnr", e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="seg-train-name">Train name</Label>
                <Input
                  id="seg-train-name"
                  value={form.trainName}
                  onChange={(e) => update("trainName", e.target.value)}
                  placeholder="Rajdhani Express"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seg-train-no">Train number</Label>
                <div className="flex gap-2">
                  <Input
                    id="seg-train-no"
                    value={form.trainNumber}
                    onChange={(e) => update("trainNumber", e.target.value)}
                    placeholder="12951"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        fetchTrain();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Auto-fill name, stations & times from this train number"
                    onClick={fetchTrain}
                    disabled={enriching || !form.trainNumber.trim()}
                  >
                    {enriching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seg-coach">Coach</Label>
                <Input
                  id="seg-coach"
                  value={form.coach}
                  onChange={(e) => update("coach", e.target.value)}
                  placeholder="2A"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seg-seat">Seat / Berth</Label>
                <Input
                  id="seg-seat"
                  value={form.seat}
                  onChange={(e) => update("seat", e.target.value)}
                  placeholder="12, 14"
                />
              </div>
            </>
          )}
        </div>

        {timeError ? (
          <p className="mt-1 text-xs text-bad inline-flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            {timeError}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending || !!timeError}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? "Save" : "Add segment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TypeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-[10px] border text-sm transition-all flex items-center justify-center gap-2",
        active
          ? "border-inkwash bg-inkwash text-[var(--on-dark)] shadow-soft"
          : "border-line bg-paper text-ink hover:border-[var(--gold-line)]"
      )}
    >
      {children}
    </button>
  );
}
