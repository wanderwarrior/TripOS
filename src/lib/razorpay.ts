import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

// Razorpay Payment Links integration — plain REST via fetch, no SDK.
// Configured through env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (for the API)
// and RAZORPAY_WEBHOOK_SECRET (to verify webhook signatures). When the keys
// are absent the feature degrades gracefully — the create action returns a
// clear "not configured" error rather than throwing opaquely.

const API_BASE = "https://api.razorpay.com/v1";

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
}

function authHeader(): string {
  const id = process.env.RAZORPAY_KEY_ID ?? "";
  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export type CreateLinkArgs = {
  /** Amount in rupees — converted to paise for Razorpay. */
  amountRupees: number;
  description: string;
  customer: { name?: string | null; phone?: string | null; email?: string | null };
  /** Opaque key/values echoed back on the webhook (we put our IDs here). */
  notes: Record<string, string>;
  /** Where Razorpay redirects the payer after success (optional). */
  callbackUrl?: string;
};

export type CreatedLink = {
  id: string; // plink_xxx
  shortUrl: string;
  status: string;
};

/** Normalise an Indian phone to Razorpay's expected +91XXXXXXXXXX-ish form. */
function normalizePhone(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  return `+${digits}`;
}

export async function createRazorpayPaymentLink(
  args: CreateLinkArgs
): Promise<CreatedLink> {
  if (!isRazorpayConfigured()) {
    throw new Error(
      "Online payments aren't configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable payment links."
    );
  }
  const body = {
    amount: Math.round(args.amountRupees * 100), // paise
    currency: "INR",
    accept_partial: false,
    description: args.description.slice(0, 2048),
    customer: {
      name: args.customer.name ?? undefined,
      contact: normalizePhone(args.customer.phone),
      email: args.customer.email ?? undefined,
    },
    // We deliver the link ourselves (WhatsApp / copy), so don't double-notify.
    notify: { sms: false, email: false },
    reminder_enable: true,
    notes: args.notes,
    ...(args.callbackUrl
      ? { callback_url: args.callbackUrl, callback_method: "get" }
      : {}),
  };

  const res = await fetch(`${API_BASE}/payment_links`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[razorpay] create link failed", res.status, text);
    throw new Error("Couldn't create payment link. Check Razorpay keys.");
  }
  const json = (await res.json()) as {
    id: string;
    short_url: string;
    status: string;
  };
  return { id: json.id, shortUrl: json.short_url, status: json.status };
}

export async function cancelRazorpayPaymentLink(linkId: string): Promise<void> {
  if (!isRazorpayConfigured()) return;
  const res = await fetch(`${API_BASE}/payment_links/${linkId}/cancel`, {
    method: "POST",
    headers: { Authorization: authHeader() },
  });
  // A link that's already paid/cancelled returns an error — non-fatal, the
  // webhook/status is the source of truth.
  if (!res.ok) {
    console.warn("[razorpay] cancel link non-ok", res.status);
  }
}

/**
 * Verify a Razorpay webhook signature. The header is the hex HMAC-SHA256 of
 * the raw request body keyed by RAZORPAY_WEBHOOK_SECRET.
 */
export function verifyRazorpayWebhook(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
