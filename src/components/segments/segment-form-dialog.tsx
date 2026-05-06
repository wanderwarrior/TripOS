"use client";

import { useState, useTransition } from "react";
import { Loader2, Plane, Train } from "lucide-react";
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
import { cn } from "@/lib/utils";

function isoLocal(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  // datetime-local needs YYYY-MM-DDTHH:mm in local time
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

type Props = {
  tripId: string;
  tripDays: number;
  segment?: TravelSegment;
  defaultType?: TravelSegmentType;
  trigger: React.ReactNode;
};

export function SegmentFormDialog({
  tripId,
  tripDays,
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
    dayNumber: segment?.dayNumber ?? 1,
    from: segment?.from ?? "",
    to: segment?.to ?? "",
    departureTime: isoLocal(segment?.departureTime),
    arrivalTime: isoLocal(segment?.arrivalTime),
    airline: segment?.airline ?? "",
    flightNumber: segment?.flightNumber ?? "",
    pnr: segment?.pnr ?? "",
    trainName: segment?.trainName ?? "",
    trainNumber: segment?.trainNumber ?? "",
    coach: segment?.coach ?? "",
    seat: segment?.seat ?? "",
    notes: segment?.notes ?? "",
  });

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    if (!form.from.trim() || !form.to.trim()) {
      toast.error("From and To are required");
      return;
    }
    if (!form.departureTime || !form.arrivalTime) {
      toast.error("Departure and arrival times are required");
      return;
    }
    const payload: CreateSegmentInput = {
      tripId,
      type,
      dayNumber: Math.max(1, Math.min(tripDays, form.dayNumber || 1)),
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
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <TypeButton
            active={type === "FLIGHT"}
            onClick={() => setType("FLIGHT")}
          >
            <Plane className="h-4 w-4" />
            Flight
          </TypeButton>
          <TypeButton
            active={type === "TRAIN"}
            onClick={() => setType("TRAIN")}
          >
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
              onChange={(e) => update("departureTime", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seg-arr">Arrival</Label>
            <Input
              id="seg-arr"
              type="datetime-local"
              value={form.arrivalTime}
              onChange={(e) => update("arrivalTime", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seg-day">Day number</Label>
            <Input
              id="seg-day"
              type="number"
              min={1}
              max={tripDays}
              value={form.dayNumber}
              onChange={(e) =>
                update("dayNumber", Number(e.target.value || 1))
              }
            />
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
                <Input
                  id="seg-flight"
                  value={form.flightNumber}
                  onChange={(e) => update("flightNumber", e.target.value)}
                  placeholder="6E-234"
                />
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
                <Input
                  id="seg-train-no"
                  value={form.trainNumber}
                  onChange={(e) => update("trainNumber", e.target.value)}
                  placeholder="12951"
                />
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

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending}>
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
        "h-11 rounded-2xl border text-sm transition-all flex items-center justify-center gap-2",
        active
          ? "border-navy bg-navy text-ivory shadow-soft"
          : "border-line bg-white text-navy hover:border-sand"
      )}
    >
      {children}
    </button>
  );
}
