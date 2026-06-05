"use server";

// Google-powered proposal actions, both gated on the agency having connected a
// Google account (Settings → Integrations):
//   • saveProposalToDriveAction — render the proposal PDF and file it in the
//     trip's Google Drive folder (created lazily).
//   • emailProposalAction        — email the proposal PDF from the agency's
//     own Gmail to the client.
//
// Both authorize via the active agency's tenancy before touching the quote.

import { randomBytes } from "crypto";
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
import { proposalEmail } from "@/lib/email";
import { formatRegisteredAddress } from "@/lib/proposal-branding";

/** Absolute base URL for building public links (e.g. the share proposal page). */
function publicBase(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

/** Make a stored logo URL absolute so email clients can load it. */
function absoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${publicBase()}/${url.replace(/^\/+/, "")}`;
}

/** Return the quote's share token, generating + persisting one if absent. */
async function ensureShareToken(
  quoteId: string,
  existing: string | null
): Promise<string | null> {
  if (existing) return existing;
  for (let attempt = 0; attempt < 3; attempt++) {
    const token = randomBytes(18).toString("base64url");
    try {
      await prisma.quote.update({
        where: { id: quoteId },
        data: { shareToken: token },
      });
      return token;
    } catch {
      if (attempt === 2) return null;
    }
  }
  return null;
}

type Result<T> = ({ ok: true } & T) | { ok: false; error: string };

/** Load a quote scoped to the agency, returning the data the actions share. */
async function loadQuoteForAgency(quoteId: string, agencyId: string) {
  return prisma.quote.findFirst({
    where: { id: quoteId, trip: { agencyId } },
    select: {
      id: true,
      shareToken: true,
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

  // Agency identity — used for the From header, the branded email header and
  // the contact card the client sees.
  const settings = await prisma.agencySettings.findUnique({
    where: { agencyId },
    select: {
      tradeName: true,
      legalName: true,
      logoUrl: true,
      logoLightUrl: true,
      phone: true,
      email: true,
      website: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      pincode: true,
      country: true,
      proposalAccentColor: true,
      proposalSurfaceColor: true,
      proposalTagline: true,
      proposalSignatureNote: true,
    },
  });
  const agencyName =
    settings?.tradeName || settings?.legalName || "Your travel agency";
  const fromName = settings?.tradeName || settings?.legalName || undefined;
  const address = settings ? formatRegisteredAddress(settings) : "";

  try {
    const rendered = await renderProposalPdf(quoteId, agencyId);
    if (!rendered) return { ok: false, error: "Proposal not found." };

    // Always include a live link to the web proposal — generating a share
    // token on the fly if the quote doesn't have one yet.
    const shareToken = await ensureShareToken(quoteId, quote.shareToken);
    const proposalUrl = shareToken
      ? `${publicBase()}/share/${shareToken}`
      : null;

    const destination = quote.trip.destination;
    const recipientName = quote.trip.contact?.name ?? null;

    const html = proposalEmail({
      agency: {
        name: agencyName,
        // Prefer a light-on-dark logo for the dark email header.
        logoUrl: absoluteUrl(settings?.logoLightUrl || settings?.logoUrl),
        phone: settings?.phone ?? null,
        email: settings?.email ?? conn.email,
        website: settings?.website ?? null,
        address,
        tagline: settings?.proposalTagline ?? null,
        surface: settings?.proposalSurfaceColor ?? null,
        accent: settings?.proposalAccentColor ?? null,
      },
      recipientName,
      destination,
      message: message ?? null,
      proposalUrl,
      hasPdf: true,
      signatureNote: settings?.proposalSignatureNote ?? null,
    });

    const greeting = recipientName ? `Dear ${recipientName},` : "Hello,";
    const text =
      `${greeting}\n\n` +
      `${message?.trim() ? message.trim() + "\n\n" : ""}` +
      `We've put together a detailed itinerary and quotation for your ${destination} trip.\n\n` +
      (proposalUrl ? `View your proposal online: ${proposalUrl}\n\n` : "") +
      `A printable PDF copy is also attached to this email.\n\n` +
      `— ${agencyName}` +
      (settings?.phone ? `\n${settings.phone}` : "") +
      (settings?.email || conn.email
        ? `\n${settings?.email || conn.email}`
        : "") +
      (settings?.website ? `\n${settings.website}` : "") +
      (address ? `\n${address}` : "") +
      `\n\nCrafted by tripOS`;

    await sendGmail({
      agencyId,
      from: conn.email,
      fromName,
      to: recipient,
      replyTo: conn.email,
      subject: `Your ${destination} proposal — ${agencyName}`,
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
