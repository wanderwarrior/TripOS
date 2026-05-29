// Razorpay webhook receiver. Razorpay POSTs payment-link lifecycle events;
// we verify the HMAC signature against RAZORPAY_WEBHOOK_SECRET (reading the
// raw body first so the hash sees the exact bytes), then record paid links.
//
// Events handled:
//   payment_link.paid       -> create Payment + advance booking
//   payment_link.cancelled  -> mark link CANCELLED
//   payment_link.expired    -> mark link EXPIRED
//
// We always answer 2xx on internal errors so Razorpay doesn't retry-storm;
// failures are logged.

import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhook } from "@/lib/razorpay";
import {
  markPaymentLinkStatus,
  recordPaymentLinkPaid,
} from "@/server/services/payment-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RazorpayEvent = {
  event?: string;
  payload?: {
    payment_link?: { entity?: { id?: string; status?: string } };
    payment?: { entity?: { id?: string } };
  };
};

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhook(raw, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let evt: RazorpayEvent;
  try {
    evt = JSON.parse(raw) as RazorpayEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const linkId = evt.payload?.payment_link?.entity?.id ?? null;
  const paymentId = evt.payload?.payment?.entity?.id ?? null;

  try {
    if (!linkId) {
      // Not a payment-link event we model — acknowledge and move on.
      return NextResponse.json({ ok: true, ignored: true });
    }
    switch (evt.event) {
      case "payment_link.paid": {
        const result = await recordPaymentLinkPaid({
          providerLinkId: linkId,
          providerPaymentId: paymentId,
        });
        return NextResponse.json({ ok: true, result });
      }
      case "payment_link.cancelled":
        await markPaymentLinkStatus(linkId, "CANCELLED");
        return NextResponse.json({ ok: true });
      case "payment_link.expired":
        await markPaymentLinkStatus(linkId, "EXPIRED");
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ ok: true, ignored: evt.event ?? "unknown" });
    }
  } catch (e) {
    console.error("[razorpay webhook] processing error", e);
    // Acknowledge anyway so Razorpay doesn't retry-storm; we've logged it.
    return NextResponse.json({ ok: false, logged: true });
  }
}
