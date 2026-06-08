import "server-only";
import { prisma } from "@/lib/prisma";
import {
  computeFoundingStatus,
  type FoundingStatus,
} from "@/lib/founding";

/**
 * Live founding-offer status for the public marketing site.
 *
 * "Claimed" = the number of agencies that have actually started paying (an
 * ACTIVE or PAST_DUE subscription on a paid plan). This is the real,
 * defensible definition of a founding member — it counts down only as genuine
 * paying agencies join, so the scarcity shown to visitors is never fabricated.
 *
 * Safe to call on every public landing render: a single grouped count, and it
 * fails open (returns the full cap as available) if the DB is unreachable so
 * the marketing page never errors.
 */
export async function getFoundingStatus(): Promise<FoundingStatus> {
  let claimed = 0;
  try {
    claimed = await prisma.subscription.count({
      where: {
        status: { in: ["ACTIVE", "PAST_DUE"] },
      },
    });
  } catch {
    // Fail open — show the offer as fully available rather than erroring the
    // marketing home if the DB hiccups.
    claimed = 0;
  }
  return computeFoundingStatus(claimed, Date.now());
}
