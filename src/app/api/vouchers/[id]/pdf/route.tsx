// PDF endpoint for travel vouchers. Two access paths, both authenticated:
//
//   • Public  — the customer's voucher page (/v/[token]) and any external
//     fetch authenticate with a `?token=` query param matching shareToken.
//   • Internal — an operator downloading from the assignment card carries a
//     session cookie; we require a signed-in user whose active agency owns
//     the voucher (resolved via assignment → trip).
//
// Being logged in alone is NOT sufficient — otherwise any user could read any
// agency's vouchers (and traveller PII) by id.

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { constantTimeEquals } from "@/lib/crypto";
import { getSessionUser } from "@/lib/session";
import { VoucherDocument } from "@/components/vouchers/voucher-document";
import {
  publicShareUrl,
  type VoucherSnapshot,
} from "@/server/services/vouchers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const voucher = await prisma.voucher.findUnique({
    where: { id: params.id },
    include: {
      assignment: { select: { trip: { select: { agencyId: true } } } },
    },
  });
  if (!voucher) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const provided = req.nextUrl.searchParams.get("token");
  if (provided) {
    // Public path — the token must match this voucher's share token.
    if (!constantTimeEquals(provided, voucher.shareToken)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    // Internal path — must be signed in AND own this voucher's agency.
    const user = await getSessionUser();
    if (!user || user.activeAgencyId !== voucher.assignment.trip.agencyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const snapshot = voucher.content as unknown as VoucherSnapshot;

  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(publicShareUrl(voucher.shareToken), {
      margin: 1,
      width: 220,
      color: { dark: "#0B1C2C", light: "#FFFFFF" },
    });
  } catch {
    qrDataUrl = null;
  }

  const buffer = await renderToBuffer(
    <VoucherDocument snapshot={snapshot} qrDataUrl={qrDataUrl} />
  );

  // Increment download counter (fire-and-forget)
  prisma.voucher
    .update({
      where: { id: voucher.id },
      data: { downloadCount: { increment: 1 } },
    })
    .catch(() => {});

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${voucher.voucherNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
