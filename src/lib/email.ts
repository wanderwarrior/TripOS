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
    process.env.EMAIL_FROM || "TripCraft <onboarding@resend.dev>";

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
      <span style="font-size:22px;font-weight:700;color:#0B1C2C;letter-spacing:-0.5px">TripCraft</span>
    </div>
    <div style="background:#fff;border:1px solid #E6E1D7;border-radius:20px;padding:28px">
      <h1 style="font-size:20px;color:#0B1C2C;margin:0 0 12px">${opts.heading}</h1>
      <div style="font-size:14px;line-height:1.6;color:#3A3A3A">${opts.bodyHtml}</div>
      ${cta}
    </div>
    <p style="text-align:center;font-size:11px;color:#9A9A9A;margin-top:20px">Crafted for premium travel</p>
  </div>
</body></html>`;
}
