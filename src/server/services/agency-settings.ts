import "server-only";
import type { AgencySettings, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAgency } from "@/lib/session";

const DEFAULTS: Omit<Prisma.AgencySettingsCreateWithoutAgencyInput, "legalName"> = {
  invoicePrefix: "TC",
  defaultTaxScheme: "GST_5_NO_ITC",
  defaultTaxableBasis: "FULL_AMOUNT",
  defaultSacCode: "998552",
  country: "India",
  eInvoiceEnabled: false,
  eWayBillEnabled: false,
};

/**
 * Returns the current agency's AgencySettings. NULL while the Owner hasn't
 * filled in legalName + GSTIN yet — callers show a setup prompt.
 */
export async function getAgencySettings(): Promise<AgencySettings | null> {
  const { agencyId } = await requireAgency();
  return prisma.agencySettings.findUnique({ where: { agencyId } });
}

export async function upsertAgencySettings(
  patch: Prisma.AgencySettingsUpdateInput & { legalName?: string }
): Promise<AgencySettings> {
  const { agencyId } = await requireAgency();

  const legalNameRaw =
    typeof patch.legalName === "string"
      ? patch.legalName
      : (patch.legalName as { set?: string } | undefined)?.set ?? "";
  const legalName = legalNameRaw.trim();
  if (legalName.length === 0) {
    throw new Error("Legal business name is required");
  }

  // Build the create payload from `patch` minus the keys we set explicitly,
  // layered on top of DEFAULTS.
  const { legalName: _legalNameOmit, agency: _agencyOmit, ...rest } =
    patch as Prisma.AgencySettingsUpdateInput & {
      legalName?: unknown;
      agency?: unknown;
    };
  void _legalNameOmit;
  void _agencyOmit;

  const createPayload: Prisma.AgencySettingsCreateInput = {
    ...DEFAULTS,
    ...(rest as Prisma.AgencySettingsCreateInput),
    legalName,
    agency: { connect: { id: agencyId } },
  };

  return prisma.agencySettings.upsert({
    where: { agencyId },
    create: createPayload,
    update: patch,
  });
}
