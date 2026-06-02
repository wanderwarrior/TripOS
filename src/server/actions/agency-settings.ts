"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { upsertAgencySettings } from "@/server/services/agency-settings";

const TAX_SCHEMES = ["GST_5_NO_ITC", "GST_18_REGULAR", "EXEMPT"] as const;
const BASES = ["FULL_AMOUNT", "SERVICE_FEE_ONLY", "MARGIN_ONLY"] as const;

const optStr = (max = 200) =>
  z.string().max(max).optional().nullable().transform((v) => {
    if (v === undefined || v === null) return null;
    const t = v.trim();
    return t.length === 0 ? null : t;
  });

// 15-char GSTIN: 2-digit state code, 10-char PAN, entity digit, 'Z', checksum.
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const gstinSchema = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v && v.trim() ? v.trim().toUpperCase() : null))
  .refine((v) => v === null || GSTIN_RE.test(v), {
    message: "Enter a valid 15-character GSTIN (e.g. 27AAACT1234A1ZS).",
  });

const schema = z.object({
  legalName: z.string().min(2, "Legal name is required").max(160),
  tradeName: optStr(160),
  gstin: gstinSchema,
  pan: optStr(15),
  logoUrl: optStr(500),
  logoLightUrl: optStr(500),
  logoDarkUrl: optStr(500),

  addressLine1: optStr(200),
  addressLine2: optStr(200),
  city: optStr(80),
  state: optStr(80),
  stateCode: optStr(4),
  pincode: optStr(10),
  country: z.string().min(1).max(80).default("India"),

  phone: optStr(40),
  email: optStr(120),
  website: optStr(200),

  authorizedSignatory: optStr(120),
  signatoryDesignation: optStr(80),

  invoicePrefix: z
    .string()
    .min(1, "Prefix is required")
    .max(10, "Keep prefix short (≤10 chars)")
    .regex(/^[A-Z0-9_-]+$/i, "Use letters, digits, _ or - only"),
  defaultTaxScheme: z.enum(TAX_SCHEMES).default("GST_5_NO_ITC"),
  defaultTaxableBasis: z.enum(BASES).default("FULL_AMOUNT"),
  defaultSacCode: z
    .string()
    .min(4, "SAC code is required")
    .max(10),
  defaultPlaceOfSupplyState: optStr(80),
  defaultPlaceOfSupplyStateCode: optStr(4),

  bankName: optStr(120),
  bankAccountNumber: optStr(40),
  bankIfscCode: optStr(20),
  bankAccountHolder: optStr(120),

  invoiceTerms: optStr(2000),
  invoiceNotes: optStr(2000),

  eInvoiceEnabled: z.boolean().default(false),
  eWayBillEnabled: z.boolean().default(false),
});

export type AgencySettingsInput = z.input<typeof schema>;

export async function saveAgencySettingsAction(input: AgencySettingsInput) {
  const data = schema.parse(input);
  // The first two digits of a GSTIN ARE the state code — derive it so the
  // supplier state code can never drift from the GSTIN (it drives the
  // CGST+SGST vs IGST split on every invoice).
  const stateCode = data.gstin ? data.gstin.slice(0, 2) : data.stateCode;
  await upsertAgencySettings({
    legalName: data.legalName.trim(),
    tradeName: data.tradeName,
    gstin: data.gstin,
    pan: data.pan,
    logoUrl: data.logoUrl,
    logoLightUrl: data.logoLightUrl,
    logoDarkUrl: data.logoDarkUrl,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    city: data.city,
    state: data.state,
    stateCode,
    pincode: data.pincode,
    country: data.country,
    phone: data.phone,
    email: data.email,
    website: data.website,
    authorizedSignatory: data.authorizedSignatory,
    signatoryDesignation: data.signatoryDesignation,
    invoicePrefix: data.invoicePrefix.toUpperCase(),
    defaultTaxScheme: data.defaultTaxScheme,
    defaultTaxableBasis: data.defaultTaxableBasis,
    defaultSacCode: data.defaultSacCode,
    defaultPlaceOfSupplyState: data.defaultPlaceOfSupplyState,
    defaultPlaceOfSupplyStateCode: data.defaultPlaceOfSupplyStateCode,
    bankName: data.bankName,
    bankAccountNumber: data.bankAccountNumber,
    bankIfscCode: data.bankIfscCode,
    bankAccountHolder: data.bankAccountHolder,
    invoiceTerms: data.invoiceTerms,
    invoiceNotes: data.invoiceNotes,
    eInvoiceEnabled: data.eInvoiceEnabled,
    eWayBillEnabled: data.eWayBillEnabled,
  });
  revalidatePath("/settings/agency");
  return { ok: true as const };
}
