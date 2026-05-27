// Public-fetchable PDF endpoint for travel proposals. Mirrors the invoice
// PDF route — auth via the unguessable share token in the URL. This is
// what customer browsers (and WhatsApp's server-side fetch) hit.

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProposalDocument } from "@/components/proposals/proposal-document";
import {
  getProposalSnapshotByToken,
  proposalPdfFilename,
} from "@/server/services/proposal-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const snapshot = await getProposalSnapshotByToken(params.token);
  if (!snapshot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<ProposalDocument snapshot={snapshot} />);

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${proposalPdfFilename(snapshot)}"`,
      // Short cache — proposals get re-edited often, but Meta/customers
      // shouldn't re-fetch on every scroll.
      "Cache-Control": "private, max-age=60",
    },
  });
}
