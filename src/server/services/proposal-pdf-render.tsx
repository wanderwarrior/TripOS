// Renders a proposal quote to a PDF Buffer. Extracted so the operator PDF
// route, the "Save to Drive" action and the "Email via Gmail" action all share
// one code path (snapshot → <ProposalDocument> → Buffer). Tenancy is the
// caller's responsibility — pass the agencyId you've already authorized.

import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProposalDocument } from "@/components/proposals/proposal-document";
import {
  getProposalSnapshotByQuoteId,
  proposalPdfFilename,
  type ProposalPdfSnapshot,
} from "./proposal-pdf";

export type RenderedProposal = {
  buffer: Buffer;
  filename: string;
  snapshot: ProposalPdfSnapshot;
};

/** Returns null when the quote doesn't exist for this agency. */
export async function renderProposalPdf(
  quoteId: string,
  agencyId: string
): Promise<RenderedProposal | null> {
  const snapshot = await getProposalSnapshotByQuoteId(quoteId, agencyId);
  if (!snapshot) return null;
  const buffer = await renderToBuffer(<ProposalDocument snapshot={snapshot} />);
  return { buffer, filename: proposalPdfFilename(snapshot), snapshot };
}
