"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertCan } from "@/lib/session";
import {
  getAgencySettings,
  upsertAgencySettings,
} from "@/server/services/agency-settings";
import {
  COVER_STYLES,
  PROPOSAL_THEMES,
} from "@/lib/proposal-branding";

const optStr = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v.trim() : null));

// Reasonably permissive hex — allows #fff / #ffffff / #ffffffff.
const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "Use a hex colour like #C8A96A")
  .optional()
  .nullable()
  .transform((v) => (v && v.trim() ? v.trim() : null));

const schema = z.object({
  theme: z.enum(PROPOSAL_THEMES).default("classic"),
  accentColor: hexColor,
  coverStyle: z.enum(COVER_STYLES).default("photo"),
  showAtAGlance: z.boolean().default(true),
  showInclusions: z.boolean().default(true),
  showTerms: z.boolean().default(true),
  signatureNote: optStr(400),
  repeatLogo: z.boolean().default(true),
});

export type ProposalBrandingInput = z.input<typeof schema>;

export async function saveProposalBrandingAction(input: ProposalBrandingInput) {
  const data = schema.parse(input);
  await assertCan("agency:settings");

  // Branding sits on AgencySettings, which requires legalName to exist.
  // If the Owner hasn't set up identity yet, force that first.
  const existing = await getAgencySettings();
  if (!existing) {
    throw new Error(
      "Add your agency name and GSTIN under Settings → Agency first."
    );
  }

  await upsertAgencySettings({
    legalName: existing.legalName,
    proposalTheme: data.theme,
    proposalAccentColor: data.accentColor,
    proposalCoverStyle: data.coverStyle,
    proposalShowAtAGlance: data.showAtAGlance,
    proposalShowInclusions: data.showInclusions,
    proposalShowTerms: data.showTerms,
    proposalSignatureNote: data.signatureNote,
    proposalRepeatLogo: data.repeatLogo,
  });

  revalidatePath("/settings/proposal");
  // Every proposal page reads these — bust them so the next preview is fresh.
  revalidatePath("/trips", "layout");
  revalidatePath("/share", "layout");

  return { ok: true as const };
}
