import "server-only";
import { getAccessToken } from "./connection";

// Send mail as the agency's connected Google account via the Gmail API
// (users.messages.send). Requires the gmail.send scope. The message is a raw
// RFC 2822 MIME blob, base64url-encoded. Supports a single optional binary
// attachment (e.g. the proposal PDF) via multipart/mixed.

const SEND_ENDPOINT =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

export type GmailAttachment = {
  filename: string;
  contentType: string;
  content: Buffer;
};

export type SendGmailArgs = {
  agencyId: string;
  from: string; // the connected account's email (display name added by caller)
  fromName?: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: GmailAttachment[];
};

// Header values must not contain CR/LF (header-injection guard) and non-ASCII
// must be encoded. We keep it simple: encode any header that isn't pure ASCII
// as RFC 2047 base64, and strip newlines defensively.
function encodeHeader(value: string): string {
  const clean = value.replace(/[\r\n]+/g, " ").trim();
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(clean)) return clean;
  return `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}

function buildMime(args: SendGmailArgs): string {
  const fromHeader = args.fromName
    ? `${encodeHeader(args.fromName)} <${args.from}>`
    : args.from;

  const headersBase = [
    `From: ${fromHeader}`,
    `To: ${encodeHeader(args.to)}`,
    `Subject: ${encodeHeader(args.subject)}`,
    ...(args.replyTo ? [`Reply-To: ${encodeHeader(args.replyTo)}`] : []),
    "MIME-Version: 1.0",
  ];

  const altBoundary = "tc_alt_boundary_8f2a";
  const altPart = [
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    "",
    `--${altBoundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(args.text, "utf8").toString("base64"),
    `--${altBoundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(args.html, "utf8").toString("base64"),
    `--${altBoundary}--`,
  ].join("\r\n");

  if (!args.attachments?.length) {
    return [...headersBase, altPart].join("\r\n");
  }

  const mixedBoundary = "tc_mixed_boundary_3c7d";
  const lines = [
    ...headersBase,
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
    "",
    `--${mixedBoundary}`,
    altPart,
  ];
  for (const att of args.attachments) {
    lines.push(
      `--${mixedBoundary}`,
      `Content-Type: ${att.contentType}; name="${att.filename}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${att.filename}"`,
      "",
      // Wrap base64 at 76 chars per MIME convention.
      att.content.toString("base64").replace(/(.{76})/g, "$1\r\n")
    );
  }
  lines.push(`--${mixedBoundary}--`);
  return lines.join("\r\n");
}

export async function sendGmail(
  args: SendGmailArgs
): Promise<{ id: string; threadId: string }> {
  const accessToken = await getAccessToken(args.agencyId);
  const raw = Buffer.from(buildMime(args), "utf8").toString("base64url");

  const res = await fetch(SEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    throw new Error(`Gmail send failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { id: string; threadId: string };
  return json;
}
