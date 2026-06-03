import "server-only";

// Google OAuth 2.0 — authorization-code flow with offline access.
//
// We talk to Google's REST endpoints with plain `fetch` (no googleapis SDK)
// to keep the bundle small and match the rest of the codebase (see
// [email.ts](src/lib/email.ts) and the WhatsApp integration). The flow lives
// OUTSIDE Auth.js: the app's login is Credentials/JWT only, and we need a
// long-lived *refresh token* for background sends — which means our own
// consent screen with `access_type=offline` + `prompt=consent`.
//
// Scopes are deliberately MINIMAL and NON-restricted so no Google CASA review
// is needed:
//   • gmail.send   — send mail as the connected account (cannot read inbox)
//   • drive.file   — only touch files/folders this app creates (not the
//                    user's whole Drive)
//   • userinfo.email / openid — learn which account was linked (for the UI)

/** Cookie name holding the OAuth CSRF state between connect → callback. */
export const STATE_COOKIE = "g_oauth_state";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

function clientId(): string {
  const v = process.env.GOOGLE_CLIENT_ID;
  if (!v) throw new Error("GOOGLE_CLIENT_ID is not set");
  return v;
}

function clientSecret(): string {
  const v = process.env.GOOGLE_CLIENT_SECRET;
  if (!v) throw new Error("GOOGLE_CLIENT_SECRET is not set");
  return v;
}

/** Absolute redirect URI registered in the Google Cloud OAuth client. */
export function redirectUri(): string {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${base}/api/integrations/google/callback`;
}

/** True when the platform has Google OAuth credentials configured at all. */
export function isGoogleConfigured(): boolean {
  return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
}

/**
 * Build the consent-screen URL the owner is redirected to. `state` is an
 * opaque CSRF token we mint and verify on the callback.
 */
export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    // offline → issue a refresh token; consent → re-issue it every time so we
    // never end up connected without one (Google omits it on silent re-auth).
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export type GoogleTokens = {
  accessToken: string;
  refreshToken: string | null;
  expiresInSec: number;
  scope: string;
};

/** Exchange the one-time auth code for tokens. */
export async function exchangeCode(code: string): Promise<GoogleTokens> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
  };
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresInSec: json.expires_in,
    scope: json.scope,
  };
}

/** Trade a stored refresh token for a fresh access token. */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresInSec: number }> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  return { accessToken: json.access_token, expiresInSec: json.expires_in };
}

/** Look up which Google account an access token belongs to. */
export async function fetchUserEmail(accessToken: string): Promise<string> {
  const res = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google userinfo failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { email?: string };
  if (!json.email) throw new Error("Google userinfo returned no email");
  return json.email;
}

/**
 * Best-effort token revocation on disconnect. Failures are swallowed — the
 * caller deletes the local row regardless so the agency is disconnected.
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    });
  } catch {
    // ignore — local disconnect is what matters
  }
}
