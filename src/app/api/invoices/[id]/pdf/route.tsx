// PDF endpoint for tax invoices. Two access paths, both authenticated:
//
//   • Public  — Meta's WhatsApp Cloud API and customer browsers fetch this
//     URL with NO cookies, so they authenticate with a `?token=` query param
//     that must match the invoice's shareToken.
//   • Internal — an operator clicking "Download PDF" carries their session
//     cookie and no token; we require a signed-in user whose active agency
//     owns the invoice.
//
// A request with neither a valid token nor a matching session is rejected —
// being logged in is NOT sufficient, or any user could read any agency's
// invoices by id (cross-tenant IDOR).

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { constantTimeEquals } from "@/lib/crypto";
import { getSessionUser } from "@/lib/session";
import { InvoiceDocument } from "@/components/invoices/invoice-document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { items: { orderBy: { position: "asc" } } },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const provided = req.nextUrl.searchParams.get("token");
  if (provided) {
    // Public path — the token must match this invoice's share token.
    if (!constantTimeEquals(provided, invoice.shareToken)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    // Internal path — must be signed in AND own this invoice's agency.
    // 404 (not 403) so we don't confirm the invoice exists to outsiders.
    const user = await getSessionUser();
    if (!user || user.activeAgencyId !== invoice.agencyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const buffer = await renderToBuffer(<InvoiceDocument invoice={invoice} />);

  const filename = `${invoice.invoiceNumber ?? `invoice-${invoice.id}`}.pdf`.replace(
    /[\/\\]/g,
    "-"
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      // Meta caches PDFs once, so a short cache is fine.
      "Cache-Control": "private, max-age=60",
    },
  });
}
