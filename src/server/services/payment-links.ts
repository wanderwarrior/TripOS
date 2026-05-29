import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/server/helpers/log-activity";
import { formatINR } from "@/lib/utils";

/**
 * Record a paid Razorpay payment link: create the matching Payment row,
 * recompute the booking balance, advance status, and flip the link to PAID.
 * Idempotent — a duplicate webhook delivery for an already-paid link is a
 * no-op. Returns a short status string for webhook logging.
 */
export async function recordPaymentLinkPaid(args: {
  providerLinkId: string;
  providerPaymentId: string | null;
}): Promise<"recorded" | "duplicate" | "unknown_link"> {
  const link = await prisma.paymentLink.findUnique({
    where: { providerLinkId: args.providerLinkId },
    include: {
      booking: {
        include: { trip: { select: { id: true, contactId: true } } },
      },
    },
  });
  if (!link) return "unknown_link";
  if (link.status === "PAID") return "duplicate";

  const booking = link.booking;

  await prisma.$transaction(async (tx) => {
    // Sum existing payments to classify this one and recompute the balance.
    const agg = await tx.payment.aggregate({
      where: { bookingId: booking.id },
      _sum: { amount: true },
    });
    const priorPaid = agg._sum.amount ?? 0;
    const newPaid = priorPaid + link.amount;

    const type =
      newPaid >= booking.totalAmount
        ? "FINAL"
        : priorPaid <= 0
          ? "ADVANCE"
          : "PARTIAL";

    const payment = await tx.payment.create({
      data: {
        bookingId: booking.id,
        type,
        amount: link.amount,
        method: "Razorpay",
        reference: args.providerPaymentId ?? link.providerLinkId,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: { id: booking.id },
      data: {
        paidAmount: newPaid,
        status: booking.status === "PENDING" ? "CONFIRMED" : booking.status,
      },
    });

    await tx.paymentLink.update({
      where: { id: link.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        providerPaymentId: args.providerPaymentId,
        paymentId: payment.id,
      },
    });
  });

  if (booking.trip.contactId) {
    await logActivity({
      contactId: booking.trip.contactId,
      type: "PAYMENT_RECORDED",
      title: `Online payment received — ${formatINR(link.amount)}`,
      body: "Paid via Razorpay payment link",
      metadata: {
        bookingId: booking.id,
        paymentLinkId: link.id,
        providerPaymentId: args.providerPaymentId,
      },
    });
  }

  revalidatePath(`/trips/${booking.trip.id}`);
  revalidatePath("/bookings");
  return "recorded";
}

/** Mark a link CANCELLED/EXPIRED from a provider event (best-effort). */
export async function markPaymentLinkStatus(
  providerLinkId: string,
  status: "CANCELLED" | "EXPIRED"
): Promise<void> {
  const link = await prisma.paymentLink.findUnique({
    where: { providerLinkId },
    select: { id: true, status: true },
  });
  if (!link || link.status === "PAID") return;
  await prisma.paymentLink.update({
    where: { id: link.id },
    data: { status },
  });
}
