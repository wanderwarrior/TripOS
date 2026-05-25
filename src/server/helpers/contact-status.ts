import type { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Pipeline rank — higher = further along. Mirrors the funnel in
// [analytics.ts](src/server/services/analytics.ts). FOLLOW_UP sits level
// with QUOTED (it's a post-quote nudge, not a distinct stage of progress).
const RANK: Record<LeadStatus, number> = {
  NEW: 0,
  CONTACTED: 1,
  REQUIREMENT_UNDERSTOOD: 2,
  QUOTED: 3,
  FOLLOW_UP: 3,
  WON: 4,
  LOST: -1,
};

/**
 * Recompute a contact's pipeline status from the reality of its trips.
 *
 * `Contact.status` is the sales pipeline ("will this person buy?");
 * `Trip.status` is the execution lifecycle of one specific trip. They are
 * complementary, not duplicates — but the contact's status must never
 * contradict its trips. This helper is the single place that keeps them
 * aligned, and it is **forward-only**:
 *
 *  - it advances a contact when a trip is quoted / booked,
 *  - it never drags a contact backwards (a quote on a 2nd trip can't undo
 *    a WON earned on the 1st),
 *  - it never overrides a contact the agent has parked as LOST.
 *
 * Call it after any event that changes a contact's trip/quote/booking
 * picture. Walk-backs (e.g. reverting an accepted quote) stay explicit in
 * their own action — this helper only ever moves forward.
 */
export async function recomputeContactStatus(
  contactId: string | null | undefined
): Promise<void> {
  if (!contactId) return;

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { status: true },
  });
  if (!contact || contact.status === "LOST") return;

  const trips = await prisma.trip.findMany({
    where: { contactId, deletedAt: null },
    select: {
      quotes: { select: { status: true } },
      bookings: {
        where: { status: { not: "CANCELLED" } },
        select: { id: true },
      },
    },
  });

  // Derive the furthest stage the trips imply.
  let implied: LeadStatus = "NEW";
  if (trips.some((t) => t.bookings.length > 0)) {
    implied = "WON";
  } else if (
    trips.some((t) =>
      t.quotes.some((q) => q.status === "SENT" || q.status === "ACCEPTED")
    )
  ) {
    implied = "QUOTED";
  } else if (trips.length > 0) {
    implied = "REQUIREMENT_UNDERSTOOD";
  }

  // Forward-only — never move a contact back down the pipeline.
  if (RANK[implied] > RANK[contact.status]) {
    await prisma.contact.update({
      where: { id: contactId },
      data: { status: implied },
    });
  }
}
