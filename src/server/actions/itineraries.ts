"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateItineraryAI, type ItineraryContent } from "@/lib/ai";

export async function regenerateItineraryAction(tripId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new Error("Trip not found");

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

  // upsert v1 — multi-version UI lands in Phase 3
  const existing = await prisma.itinerary.findUnique({
    where: { tripId_version: { tripId, version: 1 } },
  });
  if (existing) {
    await prisma.itinerary.update({
      where: { id: existing.id },
      data: { content: content as unknown as object, isActive: true },
    });
  } else {
    await prisma.itinerary.create({
      data: {
        tripId,
        version: 1,
        content: content as unknown as object,
      },
    });
  }

  revalidatePath(`/trips/${tripId}`);
  return { ok: true as const };
}

export async function saveItineraryAction(
  tripId: string,
  content: ItineraryContent
) {
  const existing = await prisma.itinerary.findUnique({
    where: { tripId_version: { tripId, version: 1 } },
  });
  if (existing) {
    await prisma.itinerary.update({
      where: { id: existing.id },
      data: { content: content as unknown as object },
    });
  } else {
    await prisma.itinerary.create({
      data: {
        tripId,
        version: 1,
        content: content as unknown as object,
      },
    });
  }
  revalidatePath(`/trips/${tripId}`);
  revalidatePath(`/trips/${tripId}/preview`);
  return { ok: true as const };
}
