"use server";

// Auto-fill helpers for the travel-segment form: look up a flight or train by
// number and return normalized details (route, times, airline/train name) for
// the client to drop into the form.
//
// Auth-gated to any agency member — the lookups burn a shared (free-tier) API
// quota, so we don't expose them unauthenticated. They never write to the DB;
// the operator still reviews and saves the segment.

import { z } from "zod";
import { requireAgency } from "@/lib/session";
import { lookupFlight } from "@/lib/enrichment/flights";
import { lookupTrainSchedule, resolveTrainLeg } from "@/lib/enrichment/trains";
import { getFlightApiKey } from "@/lib/enrichment/keys";
import type { FlightEnrichment, TrainEnrichment } from "@/lib/enrichment/types";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const flightSchema = z.object({
  flightNumber: z.string().trim().min(2).max(12),
  // "YYYY-MM-DD" — the departure date, improves match accuracy.
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
});

export async function enrichFlightAction(
  input: z.infer<typeof flightSchema>
): Promise<ActionResult<FlightEnrichment>> {
  const parsed = flightSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid flight number." };
  }
  const { agencyId } = await requireAgency();
  const key = await getFlightApiKey(agencyId);
  return lookupFlight(parsed.data.flightNumber, parsed.data.date ?? null, key);
}

const trainSchema = z.object({
  trainNumber: z.string().trim().min(3).max(8),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  fromHint: z.string().trim().max(120).optional().default(""),
  toHint: z.string().trim().max(120).optional().default(""),
});

export async function enrichTrainAction(
  input: z.infer<typeof trainSchema>
): Promise<ActionResult<TrainEnrichment>> {
  const parsed = trainSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid train number." };
  }
  await requireAgency();

  // Trains use eRail (keyless).
  const schedule = await lookupTrainSchedule(parsed.data.trainNumber, null);
  if (!schedule.ok) return schedule;

  // No journey date → still useful: return name + origin/destination, but times
  // can't be anchored to a calendar date, so leave them out.
  const date = parsed.data.date;
  if (!date) {
    const last = schedule.data.route.length - 1;
    const board = schedule.data.route[0];
    const alight = schedule.data.route[last];
    const label = (s: { code: string; name: string }) =>
      s.code ? `${s.name} (${s.code})` : s.name;
    return {
      ok: true,
      data: {
        trainName: schedule.data.trainName,
        trainNumber: schedule.data.trainNumber,
        from: label(board),
        to: label(alight),
        departureLocal: null,
        arrivalLocal: null,
        route: schedule.data.route,
      },
    };
  }

  return {
    ok: true,
    data: resolveTrainLeg(
      schedule.data,
      date,
      parsed.data.fromHint,
      parsed.data.toHint
    ),
  };
}
