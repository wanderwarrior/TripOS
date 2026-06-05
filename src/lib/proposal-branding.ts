// Plain constants/types + pure builders for proposal branding. Lives outside
// any `"use server"` file because Next.js forbids server modules from
// exporting anything other than async functions. Imported by both the server
// (snapshot builder, pages) and the client (settings form) — keep it free of
// server-only / runtime-prisma imports (the `Prisma` import below is types
// only, erased at build).

import type { Prisma } from "@prisma/client";

export const PROPOSAL_THEMES = ["classic", "editorial", "minimal"] as const;
export const COVER_STYLES = ["photo", "gradient", "solid"] as const;

export type ProposalTheme = (typeof PROPOSAL_THEMES)[number];
export type ProposalCoverStyle = (typeof COVER_STYLES)[number];

// --- palette --------------------------------------------------------------
// The three colours that define a proposal's look. `surface` is the dark
// backdrop (cover, price block, closing), `tint` the light paper of the
// content pages, `accent` the gold-equivalent used for eyebrows/rules/prices.

export const DEFAULT_ACCENT = "#C8A96A";
export const DEFAULT_SURFACE = "#0C1620";
export const DEFAULT_TINT = "#FAF7F0";
export const DEFAULT_TAGLINE = "Crafted travel";

export type ProposalPalette = {
  id: string;
  name: string;
  surface: string;
  accent: string;
  tint: string;
};

// Curated, designer-safe combinations. Clicking one in the settings form just
// sets the three custom colour fields — nothing about the preset id is stored.
export const PROPOSAL_PALETTES: ProposalPalette[] = [
  { id: "navy-gold", name: "Navy & Gold", surface: "#0C1620", accent: "#C8A96A", tint: "#FAF7F0" },
  { id: "forest-cream", name: "Forest & Cream", surface: "#16302A", accent: "#C2A878", tint: "#F4F1E8" },
  { id: "charcoal-rose", name: "Charcoal & Rose", surface: "#1F1D24", accent: "#C98B86", tint: "#F7F3F1" },
  { id: "plum-sand", name: "Plum & Sand", surface: "#271E2E", accent: "#CBA66A", tint: "#F6F1EA" },
  { id: "ocean-brass", name: "Ocean & Brass", surface: "#0E2A33", accent: "#C9A24B", tint: "#F2F2EC" },
];

// --- shared Prisma select -------------------------------------------------
// One source of truth for every AgencySettings field the proposal renderers
// (web + PDF) read. Used by both customer-facing pages and the PDF snapshot.

export const PROPOSAL_SETTINGS_SELECT = {
  legalName: true,
  tradeName: true,
  gstin: true,
  logoUrl: true,
  logoLightUrl: true,
  logoDarkUrl: true,
  phone: true,
  email: true,
  website: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  pincode: true,
  country: true,
  invoiceTerms: true,
  proposalTheme: true,
  proposalAccentColor: true,
  proposalSurfaceColor: true,
  proposalTintColor: true,
  proposalCoverStyle: true,
  proposalShowAtAGlance: true,
  proposalShowInclusions: true,
  proposalShowTerms: true,
  proposalTagline: true,
  proposalShowContactStrip: true,
  proposalShowRegisteredFooter: true,
  proposalSignatureNote: true,
  proposalRepeatLogo: true,
} satisfies Prisma.AgencySettingsSelect;

// The settings shape the builders consume — exactly the fields selected above.
export type ProposalSettings = {
  legalName: string;
  tradeName: string | null;
  gstin: string | null;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  invoiceTerms: string | null;
  proposalTheme: string;
  proposalAccentColor: string | null;
  proposalSurfaceColor: string | null;
  proposalTintColor: string | null;
  proposalCoverStyle: string;
  proposalShowAtAGlance: boolean;
  proposalShowInclusions: boolean;
  proposalShowTerms: boolean;
  proposalTagline: string | null;
  proposalShowContactStrip: boolean;
  proposalShowRegisteredFooter: boolean;
  proposalSignatureNote: string | null;
  proposalRepeatLogo: boolean;
};

// One line registered address, e.g. "12 MG Road, Indiranagar, Bengaluru,
// Karnataka 560038". Empty when nothing is set.
export function formatRegisteredAddress(s: {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
}): string {
  return [
    s.addressLine1,
    s.addressLine2,
    [s.city, s.state].filter(Boolean).join(", "),
    s.pincode,
    s.country && s.country !== "India" ? s.country : null,
  ]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(", ");
}

// Resolved agency identity for the proposal renderers. Logo URLs here are the
// raw stored values — the PDF snapshot absolutizes them separately.
export function buildProposalAgency(s: ProposalSettings | null | undefined) {
  const name = s?.tradeName?.trim() || s?.legalName?.trim() || "tripOS";
  return {
    name,
    logoUrl: s?.logoUrl ?? null,
    // Raw stored variants — each renderer applies the variant→primary fallback.
    logoLight: s?.logoLightUrl ?? null,
    logoDark: s?.logoDarkUrl ?? null,
    phone: s?.phone ?? null,
    email: s?.email ?? null,
    website: s?.website ?? null,
    terms: s?.invoiceTerms ?? null,
    gstin: s?.gstin ?? null,
    registeredAddress: s ? formatRegisteredAddress(s) : "",
  };
}

function isTheme(v: string | null | undefined): v is ProposalTheme {
  return !!v && (PROPOSAL_THEMES as readonly string[]).includes(v);
}
function isCover(v: string | null | undefined): v is ProposalCoverStyle {
  return !!v && (COVER_STYLES as readonly string[]).includes(v);
}

// Resolved look + content toggles. Defaults are sensible so an agency that
// never opened /settings/proposal still renders a polished document.
export function buildProposalBranding(s: ProposalSettings | null | undefined) {
  return {
    theme: isTheme(s?.proposalTheme) ? s!.proposalTheme : "classic",
    accentColor: s?.proposalAccentColor ?? null,
    surfaceColor: s?.proposalSurfaceColor ?? null,
    tintColor: s?.proposalTintColor ?? null,
    coverStyle: isCover(s?.proposalCoverStyle) ? s!.proposalCoverStyle : "photo",
    showAtAGlance: s?.proposalShowAtAGlance ?? true,
    showInclusions: s?.proposalShowInclusions ?? true,
    showTerms: s?.proposalShowTerms ?? true,
    tagline: s?.proposalTagline ?? null,
    showContactStrip: s?.proposalShowContactStrip ?? true,
    showRegisteredFooter: s?.proposalShowRegisteredFooter ?? true,
    signatureNote: s?.proposalSignatureNote ?? null,
    repeatLogo: s?.proposalRepeatLogo ?? true,
  };
}
