import "server-only";

// Minimal transactional email sender. Uses Resend's REST API when
// RESEND_API_KEY is configured (no SDK dependency — plain fetch). When it
// isn't, the message is logged to the server console so flows like password
// reset and team invites remain testable in development. Swap the provider
// here without touching callers.

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM || "tripOS <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(
      `[email] RESEND_API_KEY not set — not sending. To: ${args.to}\n` +
        `Subject: ${args.subject}\n${args.text}`
    );
    return { ok: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });
    if (!res.ok) {
      console.error("[email] send failed", res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] send error", e);
    return { ok: false };
  }
}

/** Branded wrapper for transactional emails — navy header, ivory body. */
export function brandedEmail(opts: {
  heading: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
}): string {
  const cta = opts.cta
    ? `<a href="${opts.cta.url}" style="display:inline-block;background:#0B1C2C;color:#FAF7F0;text-decoration:none;padding:12px 24px;border-radius:9999px;font-size:14px;font-weight:600;margin-top:8px">${opts.cta.label}</a>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#FAF7F0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1A1A1A">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:22px;font-weight:700;color:#0B1C2C;letter-spacing:-0.5px">tripOS</span>
    </div>
    <div style="background:#fff;border:1px solid #E6E1D7;border-radius:20px;padding:28px">
      <h1 style="font-size:20px;color:#0B1C2C;margin:0 0 12px">${opts.heading}</h1>
      <div style="font-size:14px;line-height:1.6;color:#3A3A3A">${opts.bodyHtml}</div>
      ${cta}
    </div>
    ${craftedByFooter()}
  </div>
</body></html>`;
}

// --- helpers --------------------------------------------------------------

/** Escape user/agency-supplied text before interpolating into email HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Only allow a safe hex colour through to inline styles; else fall back. */
function safeColor(v: string | null | undefined, fallback: string): string {
  return v && /^#[0-9a-fA-F]{3,8}$/.test(v.trim()) ? v.trim() : fallback;
}

/** The small, consistent "Crafted by tripOS" sign-off used across emails. */
function craftedByFooter(): string {
  return `<p style="text-align:center;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#b3ab9c;margin:20px 0 0">Crafted by tripOS</p>`;
}

export type AgencyEmailIdentity = {
  name: string;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  tagline?: string | null;
  /** Brand colours (hex). Default to the tripOS navy/gold. */
  surface?: string | null;
  accent?: string | null;
};

/**
 * A polished, agency-branded proposal email. Leads with the agency's logo and
 * the destination, gives the client a prominent button to view the live
 * proposal online, notes the attached PDF, and closes with the agency's
 * contact details — then a small "Crafted by tripOS" sign-off.
 */
export function proposalEmail(opts: {
  agency: AgencyEmailIdentity;
  recipientName?: string | null;
  destination: string;
  message?: string | null;
  /** Public link to the live web proposal (/share/<token>). */
  proposalUrl?: string | null;
  hasPdf?: boolean;
  signatureNote?: string | null;
}): string {
  const { agency, recipientName, destination, message, proposalUrl } = opts;
  const hasPdf = opts.hasPdf ?? true;

  const surface = safeColor(agency.surface, "#0C1620");
  const accent = safeColor(agency.accent, "#C8A96A");
  const name = esc(agency.name);

  const header = agency.logoUrl
    ? `<img src="${agency.logoUrl}" alt="${name}" height="44" style="height:44px;max-height:44px;width:auto;display:inline-block" />`
    : `<div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#FAF7F0;letter-spacing:0.4px">${name}</div>`;

  const tagline = agency.tagline?.trim()
    ? `<div style="margin-top:10px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${accent}">${esc(agency.tagline.trim())}</div>`
    : "";

  const greeting = recipientName ? `Dear ${esc(recipientName)},` : "Hello,";
  const note = message?.trim()
    ? `<p style="margin:0 0 16px">${esc(message.trim()).replace(/\n/g, "<br/>")}</p>`
    : "";

  const cta = proposalUrl
    ? `<a href="${proposalUrl}" style="display:inline-block;background:${accent};color:${surface};text-decoration:none;padding:15px 34px;border-radius:9999px;font-size:15px;font-weight:700;letter-spacing:0.3px">View your proposal &rarr;</a>
       <div style="margin-top:14px;font-size:12px;color:#9a9285;word-break:break-all">or open: <a href="${proposalUrl}" style="color:#9a9285">${esc(proposalUrl)}</a></div>`
    : "";

  const pdfLine = hasPdf
    ? `<p style="margin:18px 0 0;font-size:13px;color:#8a8275">A printable PDF copy is attached to this email.</p>`
    : "";

  const signature = opts.signatureNote?.trim()
    ? `<tr><td style="padding:8px 36px 0;font-size:14px;line-height:1.6;color:#3A3A3A">
         <p style="margin:18px 0 0;font-style:italic;color:#5a5043">${esc(
           opts.signatureNote.trim()
         ).replace(/\n/g, "<br/>")}</p>
       </td></tr>`
    : "";

  const contactBits = [
    agency.phone ? esc(agency.phone) : "",
    agency.email
      ? `<a href="mailto:${esc(agency.email)}" style="color:#4a4a4a;text-decoration:none">${esc(
          agency.email
        )}</a>`
      : "",
    agency.website ? esc(agency.website) : "",
  ].filter(Boolean);
  const contactStrip = contactBits.length
    ? `<div style="font-size:13px;color:#4a4a4a;line-height:1.9">${contactBits.join(
        " &nbsp;&middot;&nbsp; "
      )}</div>`
    : "";
  const addressLine = agency.address?.trim()
    ? `<div style="margin-top:4px;font-size:12px;color:#8a8275">${esc(
        agency.address.trim()
      )}</div>`
    : "";
  const contactCard =
    contactStrip || addressLine
      ? `<tr><td style="padding:24px 36px 4px">
           <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;border:1px solid #EEE9DF;border-radius:14px">
             <tr><td style="padding:18px 20px;text-align:center">
               <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${accent};font-weight:700;margin-bottom:8px">${name}</div>
               ${contactStrip}
               ${addressLine}
             </td></tr>
           </table>
         </td></tr>`
      : "";

  return `<!doctype html><html><body style="margin:0;padding:0;background:#F1EDE4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1A1A1A">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1EDE4">
    <tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #E6E1D7;border-radius:20px;overflow:hidden">
        <tr><td style="background:${surface};padding:32px;text-align:center">
          ${header}
          ${tagline}
        </td></tr>
        <tr><td style="padding:34px 36px 6px">
          <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${accent};font-weight:700">Your travel proposal</div>
          <h1 style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;color:${surface}">${esc(
            destination
          )}</h1>
        </td></tr>
        <tr><td style="padding:18px 36px 4px;font-size:15px;line-height:1.65;color:#3A3A3A">
          <p style="margin:0 0 16px">${greeting}</p>
          ${note}
          <p style="margin:0">We&rsquo;ve put together a detailed itinerary and quotation for your trip &mdash; day-by-day plans, inclusions and pricing, all in one place. Tap below to view the full proposal online.</p>
        </td></tr>
        <tr><td style="padding:24px 36px 6px" align="center">
          ${cta}
          ${pdfLine}
        </td></tr>
        ${signature}
        ${contactCard}
        <tr><td style="padding:22px 36px 30px;text-align:center;border-top:1px solid #EEE9DF;margin-top:10px">
          <div style="font-size:13px;color:#6b6357">Looking forward to crafting this journey with you.</div>
          ${craftedByFooter()}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
