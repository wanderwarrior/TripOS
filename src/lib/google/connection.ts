import "server-only";
import { prisma } from "@/lib/prisma";
import { encryptSecret, decryptSecret } from "@/lib/crypto";
import { refreshAccessToken, revokeToken, GOOGLE_SCOPES } from "./oauth";

// Resolves a usable, non-expired Google access token for an agency from the
// stored (encrypted) refresh token. The access token is cached on the row and
// refreshed lazily ~1 minute before it expires.

// Refresh this many ms before the real expiry to avoid edge-of-expiry 401s.
const EXPIRY_SKEW_MS = 60_000;

export type GoogleCapability = "gmail.send" | "drive.file";

const SCOPE_FOR: Record<GoogleCapability, string> = {
  "gmail.send": "https://www.googleapis.com/auth/gmail.send",
  "drive.file": "https://www.googleapis.com/auth/drive.file",
};

export type AgencyGoogleConnection = {
  id: string;
  email: string;
  scope: string;
  sendFromGmail: boolean;
  saveToDrive: boolean;
  driveRootFolderId: string | null;
};

/** Public-safe view of the connection (no token material). */
export async function getGoogleConnection(
  agencyId: string
): Promise<AgencyGoogleConnection | null> {
  const c = await prisma.googleConnection.findUnique({
    where: { agencyId },
    select: {
      id: true,
      email: true,
      scope: true,
      sendFromGmail: true,
      saveToDrive: true,
      driveRootFolderId: true,
    },
  });
  return c;
}

/** Does the granted scope string cover this capability? */
export function hasScope(scope: string, cap: GoogleCapability): boolean {
  return scope.split(/\s+/).includes(SCOPE_FOR[cap]);
}

/** True when the current scopes cover everything the app now asks for — i.e. no
 * re-consent needed after we widen GOOGLE_SCOPES in a future release. */
export function scopesUpToDate(scope: string): boolean {
  const granted = new Set(scope.split(/\s+/));
  return GOOGLE_SCOPES.filter((s) => s !== "openid").every((s) =>
    granted.has(s)
  );
}

export class GoogleNotConnectedError extends Error {
  constructor(msg = "This agency has not connected a Google account.") {
    super(msg);
    this.name = "GoogleNotConnectedError";
  }
}

/**
 * Return a fresh access token for the agency, refreshing + persisting it if the
 * cached one is missing or near expiry. Throws GoogleNotConnectedError when no
 * connection exists.
 */
export async function getAccessToken(agencyId: string): Promise<string> {
  const c = await prisma.googleConnection.findUnique({ where: { agencyId } });
  if (!c) throw new GoogleNotConnectedError();

  const cached = decryptSecret(c.accessTokenEnc);
  const stillFresh =
    cached &&
    c.accessTokenExp &&
    c.accessTokenExp.getTime() - EXPIRY_SKEW_MS > Date.now();
  if (stillFresh) return cached;

  const refresh = decryptSecret(c.refreshTokenEnc);
  if (!refresh) {
    // Refresh token unreadable (key rotated?) — force a reconnect.
    throw new GoogleNotConnectedError(
      "Google connection is invalid — please reconnect."
    );
  }

  const { accessToken, expiresInSec } = await refreshAccessToken(refresh);
  await prisma.googleConnection.update({
    where: { agencyId },
    data: {
      accessTokenEnc: encryptSecret(accessToken),
      accessTokenExp: new Date(Date.now() + expiresInSec * 1000),
    },
  });
  return accessToken;
}

/** Create or replace the agency's Google connection after a successful OAuth. */
export async function saveGoogleConnection(args: {
  agencyId: string;
  email: string;
  refreshToken: string;
  accessToken: string;
  expiresInSec: number;
  scope: string;
  connectedById: string | null;
}): Promise<void> {
  const data = {
    email: args.email,
    refreshTokenEnc: encryptSecret(args.refreshToken),
    accessTokenEnc: encryptSecret(args.accessToken),
    accessTokenExp: new Date(Date.now() + args.expiresInSec * 1000),
    scope: args.scope,
  };
  await prisma.googleConnection.upsert({
    where: { agencyId: args.agencyId },
    // On reconnect we keep existing feature toggles + cached drive folder.
    update: data,
    create: {
      agencyId: args.agencyId,
      connectedById: args.connectedById,
      ...data,
    },
  });
}

/** Revoke at Google (best-effort) and delete the local connection. */
export async function disconnectGoogle(agencyId: string): Promise<void> {
  const c = await prisma.googleConnection.findUnique({ where: { agencyId } });
  if (!c) return;
  const refresh = decryptSecret(c.refreshTokenEnc);
  if (refresh) await revokeToken(refresh);
  await prisma.googleConnection.delete({ where: { agencyId } });
}
