import "server-only";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";

// Resolves the API key to use for a lookup: the agency's own key (BYO, stored
// encrypted on AgencySettings) takes precedence; otherwise we fall back to a
// server-wide key from the environment. Returns null when neither is set, so
// the caller can report "not configured".

// Trains use eRail (erail.in), which is keyless — so only flights need a key.

export async function getFlightApiKey(agencyId: string): Promise<string | null> {
  const s = await prisma.agencySettings.findUnique({
    where: { agencyId },
    select: { aerodataboxKeyEnc: true },
  });
  return (
    decryptSecret(s?.aerodataboxKeyEnc) ||
    process.env.AERODATABOX_API_KEY ||
    process.env.RAPIDAPI_KEY ||
    null
  );
}
