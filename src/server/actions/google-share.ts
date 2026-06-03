"use server";

// Google-powered proposal actions, both gated on the agency having connected a
// Google account (Settings → Integrations):
//   • saveProposalToDriveAction — render the proposal PDF and file it in the
//     trip's Google Drive folder (created lazily).
//   • emailProposalAction        — email the proposal PDF from the agency's
//     own Gmail to the client.
//
// Both authorize via the active agency's tenancy before touching the quote.

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAgency } from "@/lib/session";
import {
  getGoogleConnection,
  hasScope,
  GoogleNotConnectedError,
} from "@/lib/google/connection";
import { ensureTripFolder, uploadToDrive } from "@/lib/google/drive";
import { sendGmail } from "@/lib/google/gmail";
import { renderProposalPdf } from "@/server/services/proposal-pdf-render";
import { brandedEmail } from "@/lib/email";

type Result<T> = ({ ok: true } & T) | { ok: false; error: string };

/** Load a quote scoped to the agency, returning the data the actions share. */
async function loadQuoteForAgency(quoteId: string, agencyId: string) {
  return prisma.quote.findFirst({
    where: { id: quoteId, trip: { agencyId } },
    select: {
      id: true,
      trip: {
        select: {
          id: true,
          destination: true,
          contact: { select: { name: true, email: true } },
        },
      },
    },
  });
}

export async function saveProposalToDriveAction(
  quoteId: string
): Promise<Result<{ link: string }>> {
  const { agencyId } = await requireAgency();

  const conn = await getGoogleConnection(agencyId);
  if (!conn) return { ok: false, error: "Connect a Google account in Settings → Integrations first." };
  if (!conn.saveToDrive) return { ok: false, error: "Saving to Drive is turned off for this agency." };
  if (!hasScope(conn.scope, "drive.file")) {
    return { ok: false, error: "Reconnect Google to grant Drive access." };
  }

  const quote = await loadQuoteForAgency(quoteId, agencyId);
  if (!quote) return { ok: false, error: "Proposal not found." };

  try {
    const rendered = await renderProposalPdf(quoteId, agencyId);
    if (!rendered) return { ok: false, error: "Proposal not found." };

    const folderId = await ensureTripFolder(agencyId, quote.trip.id);
    const file = await uploadToDrive({
      agencyId,
      folderId,
      name: rendered.filename,
      contentType: "application/pdf",
      content: rendered.buffer,
    });
    return { ok: true, link: file.webViewLink };
  } catch (e) {
    if (e instanceof GoogleNotConnectedError) {
      return { ok: false, error: e.message };
    }
    console.error("[google] save proposal to drive failed", e);
    return { ok: false, error: "Couldn't save to Drive — please try again." };
  }
}

const emailSchema = z.object({
  quoteId: z.string().min(1),
  to: z.string().email().optional(),
  message: z.string().trim().max(2000).optional(),
});

export async function emailProposalAction(
  input: z.infer<typeof emailSchema>
): Promise<Result<{ to: string }>> {
  const { quoteId, to, message } = emailSchema.parse(input);
  const { agencyId } = await requireAgency();

  const conn = await getGoogleConnection(agencyId);
  if (!conn) return { ok: false, error: "Connect a Google account in Settings → Integrations first." };
  if (!conn.sendFromGmail) return { ok: false, error: "Sending from Gmail is turned off for this agency." };
  if (!hasScope(conn.scope, "gmail.send")) {
    return { ok: false, error: "Reconnect Google to grant send-mail access." };
  }

  const quote = await loadQuoteForAgency(quoteId, agencyId);
  if (!quote) return { ok: false, error: "Proposal not found." };

  const recipient = to ?? quote.trip.contact?.email ?? "";
  if (!recipient) {
    return { ok: false, error: "No client email on file — add one or enter a recipient." };
  }

  // Agency display name for the From header.
  const settings = await prisma.agencySettings.findUnique({
    where: { agencyId },
    select: { tradeName: true, legalName: true },
  });
  const fromName =
    settings?.tradeName || settings?.legalName || undefined;

  try {
    const rendered = await renderProposalPdf(quoteId, agencyId);
    if (!rendered) return { ok: false, error: "Proposal not found." };

    const greeting = quote.trip.contact?.name
      ? `Dear ${quote.trip.contact.name},`
      : "Hello,";
    const note = message?.trim()
      ? `<p>${message.replace(/\n/g, "<br/>")}</p>`
      : "";
    const html = brandedEmail({
      heading: `Your ${quote.trip.destination} proposal`,
      bodyHtml: `<p>${greeting}</p>${note}<p>Your detailed itinerary and quotation are attached as a PDF. We'd be glad to tailor anything to your preferences.</p>`,
    });
    const text =
      `${greeting}\n\n${message?.trim() ? message.trim() + "\n\n" : ""}` +
      `Your detailed itinerary and quotation for ${quote.trip.destination} are attached as a PDF.`;

    await sendGmail({
      agencyId,
      from: conn.email,
      fromName,
      to: recipient,
      replyTo: conn.email,
      subject: `Your ${quote.trip.destination} proposal`,
      html,
      text,
      attachments: [
        {
          filename: rendered.filename,
          contentType: "application/pdf",
          content: rendered.buffer,
        },
      ],
    });
    return { ok: true, to: recipient };
  } catch (e) {
    if (e instanceof GoogleNotConnectedError) {
      return { ok: false, error: e.message };
    }
    console.error("[google] email proposal failed", e);
    return { ok: false, error: "Couldn't send the email — please try again." };
  }
}
