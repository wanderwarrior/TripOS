import type { Prisma, VendorAssignmentCategory } from "@prisma/client";
import { ensureDefaultOpsChecklist } from "@/server/helpers/ops-checklist";

// Quote line categories → operational vendor-assignment categories.
const CATEGORY_MAP: Record<string, VendorAssignmentCategory> = {
  Hotel: "HOTEL",
  Transport: "TRANSFER",
  Activities: "ACTIVITY",
  Flights: "FLIGHT",
  Other: "OTHER",
};

/**
 * When a quote is accepted, turn its line items into draft vendor
 * assignments so the operator never re-enters what was already quoted.
 * Each seeded row carries the quoted cost and is left **without a vendor**
 * (vendorId null, status PENDING) — the operator just picks the supplier
 * and confirms.
 *
 * Idempotent: skips entirely if the trip already has any assignments, so a
 * re-accept or a manually-started ops workspace is never double-seeded.
 * Returns the number of assignments created.
 */
export async function seedVendorAssignmentsFromQuote(
  tx: Prisma.TransactionClient,
  args: { tripId: string; quoteId: string; bookingId: string }
): Promise<number> {
  const existing = await tx.vendorAssignment.count({
    where: { tripId: args.tripId },
  });
  if (existing > 0) return 0;

  const items = await tx.quoteItem.findMany({
    where: { quoteId: args.quoteId },
    orderBy: { position: "asc" },
  });
  if (items.length === 0) return 0;

  await tx.vendorAssignment.createMany({
    data: items.map((it) => ({
      tripId: args.tripId,
      bookingId: args.bookingId,
      vendorId: null,
      category: CATEGORY_MAP[it.category] ?? "OTHER",
      title: it.label,
      totalCost: it.cost,
      status: "PENDING" as const,
      customerVisible: true,
    })),
  });

  // First assignments of the trip → make sure the ops checklist exists.
  await ensureDefaultOpsChecklist(args.tripId, tx);

  return items.length;
}
