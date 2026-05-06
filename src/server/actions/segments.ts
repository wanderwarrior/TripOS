"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const baseSchema = z.object({
  tripId: z.string(),
  type: z.enum(["FLIGHT", "TRAIN"]),
  dayNumber: z.coerce.number().int().min(1).max(60).default(1),
  from: z.string().min(1).max(80),
  to: z.string().min(1).max(80),
  departureTime: z.string(),
  arrivalTime: z.string(),
  airline: z.string().max(80).optional().nullable(),
  flightNumber: z.string().max(40).optional().nullable(),
  pnr: z.string().max(40).optional().nullable(),
  trainName: z.string().max(80).optional().nullable(),
  trainNumber: z.string().max(40).optional().nullable(),
  coach: z.string().max(20).optional().nullable(),
  seat: z.string().max(40).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type CreateSegmentInput = z.infer<typeof baseSchema>;

function normalize(data: CreateSegmentInput) {
  // Strip fields that don't apply to the chosen type so we don't store noise.
  const isFlight = data.type === "FLIGHT";
  return {
    type: data.type,
    dayNumber: data.dayNumber,
    from: data.from.trim(),
    to: data.to.trim(),
    departureTime: new Date(data.departureTime),
    arrivalTime: new Date(data.arrivalTime),
    airline: isFlight ? data.airline?.trim() || null : null,
    flightNumber: isFlight ? data.flightNumber?.trim() || null : null,
    pnr: isFlight ? data.pnr?.trim() || null : null,
    trainName: !isFlight ? data.trainName?.trim() || null : null,
    trainNumber: !isFlight ? data.trainNumber?.trim() || null : null,
    coach: !isFlight ? data.coach?.trim() || null : null,
    seat: !isFlight ? data.seat?.trim() || null : null,
    notes: data.notes?.trim() || null,
  };
}

export async function createTravelSegmentAction(input: CreateSegmentInput) {
  const data = baseSchema.parse(input);
  const segment = await prisma.travelSegment.create({
    data: {
      tripId: data.tripId,
      ...normalize(data),
    },
  });
  revalidatePath(`/trips/${data.tripId}`);
  revalidatePath(`/trips/${data.tripId}/preview`);
  return { id: segment.id };
}

const updateSchema = baseSchema.partial({
  tripId: true,
  type: true,
  from: true,
  to: true,
  departureTime: true,
  arrivalTime: true,
});

export async function updateTravelSegmentAction(
  segmentId: string,
  input: z.infer<typeof updateSchema>
) {
  const existing = await prisma.travelSegment.findUnique({
    where: { id: segmentId },
  });
  if (!existing) throw new Error("Segment not found");

  const merged = baseSchema.parse({
    tripId: existing.tripId,
    type: input.type ?? existing.type,
    dayNumber: input.dayNumber ?? existing.dayNumber,
    from: input.from ?? existing.from,
    to: input.to ?? existing.to,
    departureTime:
      input.departureTime ?? existing.departureTime.toISOString(),
    arrivalTime: input.arrivalTime ?? existing.arrivalTime.toISOString(),
    airline: input.airline === undefined ? existing.airline : input.airline,
    flightNumber:
      input.flightNumber === undefined
        ? existing.flightNumber
        : input.flightNumber,
    pnr: input.pnr === undefined ? existing.pnr : input.pnr,
    trainName:
      input.trainName === undefined ? existing.trainName : input.trainName,
    trainNumber:
      input.trainNumber === undefined
        ? existing.trainNumber
        : input.trainNumber,
    coach: input.coach === undefined ? existing.coach : input.coach,
    seat: input.seat === undefined ? existing.seat : input.seat,
    notes: input.notes === undefined ? existing.notes : input.notes,
  });

  await prisma.travelSegment.update({
    where: { id: segmentId },
    data: normalize(merged),
  });
  revalidatePath(`/trips/${existing.tripId}`);
  revalidatePath(`/trips/${existing.tripId}/preview`);
  return { ok: true as const };
}

export async function deleteTravelSegmentAction(segmentId: string) {
  const segment = await prisma.travelSegment.delete({
    where: { id: segmentId },
  });
  revalidatePath(`/trips/${segment.tripId}`);
  revalidatePath(`/trips/${segment.tripId}/preview`);
  return { ok: true as const };
}

export async function addSegmentToQuoteAction(segmentId: string) {
  const segment = await prisma.travelSegment.findUnique({
    where: { id: segmentId },
  });
  if (!segment) throw new Error("Segment not found");

  // Land it on the latest DRAFT, otherwise spin up a fresh DRAFT version.
  let quote = await prisma.quote.findFirst({
    where: { tripId: segment.tripId, status: "DRAFT" },
    orderBy: { version: "desc" },
  });
  if (!quote) {
    const latest = await prisma.quote.findFirst({
      where: { tripId: segment.tripId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    quote = await prisma.quote.create({
      data: {
        tripId: segment.tripId,
        version: (latest?.version ?? 0) + 1,
        status: "DRAFT",
      },
    });
  }

  const route = `${segment.from} → ${segment.to}`;
  const identifier =
    segment.type === "FLIGHT"
      ? segment.flightNumber || segment.airline
      : segment.trainNumber || segment.trainName;
  const label =
    segment.type === "FLIGHT"
      ? `Flight: ${route}${identifier ? ` (${identifier})` : ""}`
      : `Train: ${route}${identifier ? ` (${identifier})` : ""}`;

  const lastPos = await prisma.quoteItem.findFirst({
    where: { quoteId: quote.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.quoteItem.create({
    data: {
      quoteId: quote.id,
      category: "Transport",
      label,
      cost: 0,
      position: (lastPos?.position ?? -1) + 1,
    },
  });

  revalidatePath(`/trips/${segment.tripId}`);
  return { quoteId: quote.id, version: quote.version };
}
