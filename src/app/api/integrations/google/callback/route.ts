// Google OAuth callback. Verifies the CSRF state, exchanges the code for
// tokens, records who the account belongs to, and stores the (encrypted)
// connection against the active agency. Always redirects back to the
// integrations settings page with a status flag for the UI to toast.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAgency } from "@/lib/session";
import {
  exchangeCode,
  fetchUserEmail,
  isGoogleConfigured,
  STATE_COOKIE,
} from "@/lib/google/oauth";
import { saveGoogleConnection } from "@/lib/google/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function settingsRedirect(req: NextRequest, status: string): NextResponse {
  const url = new URL("/settings/integrations", req.nextUrl.origin);
  url.searchParams.set("google", status);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const { user, agencyId } = await requireAgency();
  if (user.activeAgencyRole !== "OWNER") {
    return settingsRedirect(req, "forbidden");
  }
  if (!isGoogleConfigured()) {
    return settingsRedirect(req, "unconfigured");
  }

  const sp = req.nextUrl.searchParams;
  const error = sp.get("error");
  if (error) {
    // User declined consent, etc.
    return settingsRedirect(req, "denied");
  }

  const code = sp.get("code");
  const state = sp.get("state");
  const expected = cookies().get(STATE_COOKIE)?.value;
  // Burn the state cookie regardless of outcome.
  cookies().delete(STATE_COOKIE);

  if (!code || !state || !expected || state !== expected) {
    return settingsRedirect(req, "badstate");
  }

  try {
    const tokens = await exchangeCode(code);
    if (!tokens.refreshToken) {
      // No refresh token means we'd lose offline access — usually a re-auth
      // without prompt=consent. Treat as a soft failure and ask to retry.
      return settingsRedirect(req, "norefresh");
    }
    const email = await fetchUserEmail(tokens.accessToken);
    await saveGoogleConnection({
      agencyId,
      email,
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
      expiresInSec: tokens.expiresInSec,
      scope: tokens.scope,
      connectedById: user.id,
    });
    return settingsRedirect(req, "connected");
  } catch (e) {
    console.error("[google oauth] callback failed", e);
    return settingsRedirect(req, "error");
  }
}
