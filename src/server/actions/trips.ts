"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertCan, requireAgency } from "@/lib/session";
import { generateItineraryAI } from "@/lib/ai";
import { logActivity } from "@/server/helpers/log-activity";

const tripSchema = z.object({
  destination: z.string().min(2, "Destination is required").max(80),
  days: z.coerce.number().int().min(1).max(30),
  travelers: z.coerce.number().int().min(1).max(40),
  startDate: z.string().optional().nullable(),
  budget: z.coerce.number().int().min(0).optional().nullable(),
  travelType: z.enum(["Luxury", "Budget", "Family", "Honeymoon"]),
  pace: z.enum(["Relaxed", "Moderate", "Packed"]).default("Moderate"),
  hotelType: z
    .enum(["Boutique", "Luxury Resort", "Heritage", "Villa", "Standard"])
    .default("Boutique"),
  interests: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional().nullable(),
  leadId: z.string().optional().nullable(),
});

export type CreateTripInput = z.infer<typeof tripSchema>;

export async function createTripAction(input: CreateTripInput) {
  const data = tripSchema.parse(input);
  const user = await assertCan("trip:create");

  // Standalone trips still get a Lead so every trip is CRM-trackable.
  let leadId = data.leadId ?? null;
  if (!leadId) {
    const startDate = data.startDate ? new Date(data.startDate) : null;
    const endDate = startDate
      ? new Date(startDate.getTime() + data.days * 24 * 60 * 60 * 1000)
      : null;
    const directLead = await prisma.lead.create({
      data: {
        agencyId: user.activeAgencyId,
        ownerId: user.id,
        name: `Direct — ${data.destination.trim()}`,
        source: "MANUAL",
        status: "REQUIREMENT_UNDERSTOOD",
        destination: data.destination.trim(),
        travelStartDate: startDate,
        travelEndDate: endDate,
        adults: data.travelers,
        budget: data.budget ?? null,
        notes: data.notes ?? null,
      },
    });
    leadId = directLead.id;
  }

  const trip = await prisma.trip.create({
    data: {
      agencyId: user.activeAgencyId,
      ownerId: user.id,
      leadId,
      destination: data.destination.trim(),
      days: data.days,
      travelers: data.travelers,
      budget: data.budget ?? null,
      travelType: data.travelType,
      startDate: data.startDate ? new Date(data.startDate) : null,
      pace: data.pace,
      hotelType: data.hotelType,
      interests: data.interests,
      notes: data.notes ?? null,
    },
  });

  await logActivity({
    leadId: trip.leadId!,
    type: "TRIP_CREATED",
    title: `Trip created — ${trip.destination}`,
    metadata: { tripId: trip.id },
  });

  try {
    const content = await generateItineraryAI({
      destination: trip.destination,
      days: trip.days,
      travelType: trip.travelType,
      travelers: trip.travelers,
      budget: trip.budget,
      pace: trip.pace,
      hotelType: trip.hotelType,
      interests: trip.interests,
      notes: trip.notes,
    });
    await prisma.itinerary.create({
      data: {
        tripId: trip.id,
        version: 1,
        content: content as unknown as object,
      },
    });
  } catch (e) {
    console.error("itinerary generation failed", e);
  }

  revalidatePath("/");
  if (trip.leadId) revalidatePath(`/leads/${trip.leadId}`);
  redirect(`/trips/${trip.id}`);
}

export async function updateTripStatusAction(
  tripId: string,
  status: "PLANNING" | "QUOTED" | "BOOKED" | "COMPLETED" | "CANCELLED"
) {
  const { agencyId } = await requireAgency();
  await assertCan("trip:update");
  await prisma.trip.updateMany({
    where: { id: tripId, agencyId },
    data: { status },
  });
  revalidatePath(`/trips/${tripId}`);
  return { ok: true as const };
}

export async function deleteTripAction(tripId: string) {
  const { agencyId } = await requireAgency();
  await assertCan("trip:delete");
  await prisma.trip.updateMany({
    where: { id: tripId, agencyId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/");
  return { ok: true as const };
}

/**
 * Assign (or clear) the operations owner of a trip — the staffer
 * responsible for executing it.
 */
export async function assignTripOwnerAction(input: {
  tripId: string;
  ownerId: string | null;
}) {
  const { agencyId } = await requireAgency();
  await assertCan("trip:update");

  if (input.ownerId) {
    const member = await prisma.membership.findFirst({
      where: { agencyId, userId: input.ownerId },
      select: { id: true },
    });
    if (!member) {
      return { ok: false as const, error: "Not a member of this agency." };
    }
  }

  const res = await prisma.trip.updateMany({
    where: { id: input.tripId, agencyId },
    data: { ownerId: input.ownerId },
  });
  if (res.count === 0) return { ok: false as const, error: "Trip not found." };

  revalidatePath(`/trips/${input.tripId}`);
  return { ok: true as const };
}

export async function markTripStartedAction(tripId: string) {
  const { agencyId } = await requireAgency();
  await assertCan("trip:update");
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, agencyId },
    select: { id: true, leadId: true, status: true },
  });
  if (!trip) throw new Error("Trip not found");
  if (trip.status === "IN_PROGRESS") return { ok: true as const };

  await prisma.trip.update({
    where: { id: tripId },
    data: { status: "IN_PROGRESS" },
  });

  await logActivity({
    tripId,
    leadId: trip.leadId,
    type: "TRIP_STARTED",
    title: "Trip started",
    metadata: { from: trip.status, to: "IN_PROGRESS" },
  });

  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/operations");
  return { ok: true as const };
}

export async function markTripCompletedAction(tripId: string) {
  const { agencyId } = await requireAgency();
  await assertCan("trip:update");
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, agencyId },
    select: { id: true, leadId: true, status: true },
  });
  if (!trip) throw new Error("Trip not found");
  if (trip.status === "COMPLETED") return { ok: true as const };

  await prisma.trip.update({
    where: { id: tripId },
    data: { status: "COMPLETED" },
  });

  await logActivity({
    tripId,
    leadId: trip.leadId,
    type: "TRIP_COMPLETED",
    title: "Trip completed",
    metadata: { from: trip.status, to: "COMPLETED" },
  });

  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/operations");
  return { ok: true as const };
}
