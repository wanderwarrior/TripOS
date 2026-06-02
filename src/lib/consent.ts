// Cookie/analytics consent, stored locally. Analytics ([analytics.ts]) only
// fires when this returns "granted". Guarded by `typeof window` so it's safe to
// import anywhere.

export const CONSENT_KEY = "tc-cookie-consent";
export const CONSENT_EVENT = "tc-consent-change";

export type Consent = "granted" | "denied";

export function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export function setConsent(value: Consent): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}
