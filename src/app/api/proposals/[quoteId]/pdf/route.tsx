// Operator-side PDF endpoint — auth via the session, scoped to the
// caller's agency. Used by the trip workspace "Download PDF" button so
// agents can grab the PDF for a quote without going through the public
// share link.

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProposalDocument } from "@/components/proposals/proposal-document";
import { requireAgency } from "@/lib/session";
import {
  getProposalSnapshotByQuoteId,
  proposalPdfFilename,
} from "@/server/services/proposal-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  const { agencyId } = await requireAgency();
  const snapshot = await getProposalSnapshotByQuoteId(
    params.quoteId,
    agencyId
  );
  if (!snapshot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<ProposalDocument snapshot={snapshot} />);

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${proposalPdfFilename(snapshot)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
