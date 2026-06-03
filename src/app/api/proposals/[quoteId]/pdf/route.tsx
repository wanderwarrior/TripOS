// Operator-side PDF endpoint — auth via the session, scoped to the
// caller's agency. Used by the trip workspace "Download PDF" button so
// agents can grab the PDF for a quote without going through the public
// share link.

import { NextRequest, NextResponse } from "next/server";
import { requireAgency } from "@/lib/session";
import { renderProposalPdf } from "@/server/services/proposal-pdf-render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  const { agencyId } = await requireAgency();
  const rendered = await renderProposalPdf(params.quoteId, agencyId);
  if (!rendered) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(rendered.buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${rendered.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
