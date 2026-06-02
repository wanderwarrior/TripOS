// Minimal, dependency-free product analytics. Posts events to PostHog's HTTP
// capture endpoint (same "REST not SDK" approach as email.ts). It is a no-op
// unless BOTH are true:
//   1. NEXT_PUBLIC_POSTHOG_KEY is set, and
//   2. the visitor has granted cookie consent ([consent.ts]).
// So with no key, or before consent, nothing is sent — privacy-safe by default.

import { getConsent } from "./consent";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
).replace(/\/$/, "");
const ANON_KEY = "tc-anon-id";

function distinctId(): string {
  let id = window.localStorage.getItem(ANON_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `anon_${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

export function capture(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  if (!KEY) return;
  if (getConsent() !== "granted") return;

  const payload = JSON.stringify({
    api_key: KEY,
    event,
    distinct_id: distinctId(),
    properties: {
      ...properties,
      $current_url: window.location.href,
      $pathname: window.location.pathname,
    },
    timestamp: new Date().toISOString(),
  });

  const url = `${HOST}/capture/`;
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } else {
      void fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    }
  } catch {
    /* analytics must never break the app */
  }
}

export function pageview(): void {
  capture("$pageview");
}
