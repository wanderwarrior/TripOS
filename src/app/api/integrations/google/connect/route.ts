// Kicks off the Google OAuth consent flow for the active agency.
//
// Owner-only (linking a shared agency account is an owner decision, matching
// the rest of /settings/integrations). We mint a random CSRF `state`, stash it
// in a short-lived httpOnly cookie, and redirect to Google's consent screen.
// The callback verifies the cookie matches the returned `state`.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { requireAgency } from "@/lib/session";
import { buildAuthUrl, isGoogleConfigured, STATE_COOKIE } from "@/lib/google/oauth";
import { canEncryptSecrets } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await requireAgency();
  if (user.activeAgencyRole !== "OWNER") {
    return NextResponse.json({ error: "Owner only" }, { status: 403 });
  }
  if (!isGoogleConfigured()) {
    return NextResponse.json(
      { error: "Google OAuth is not configured on this server." },
      { status: 503 }
    );
  }
  if (!canEncryptSecrets()) {
    return NextResponse.json(
      { error: "Server cannot encrypt tokens — set CREDENTIALS_KEY." },
      { status: 503 }
    );
  }

  const state = randomBytes(24).toString("base64url");
  cookies().set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes to complete consent
  });

  return NextResponse.redirect(buildAuthUrl(state));
}
