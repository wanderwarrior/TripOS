// Build a self-contained snapshot for the proposal PDF — everything the
// renderer needs in one object so the route handler only worries about
// auth/tenancy. Mirrors what the HTML preview page assembles.

import "server-only";
import type { Quote, QuoteItem, TravelSegment } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readDay, type ItineraryContent } from "@/lib/ai";
import {
  buildProposalPricing,
  type LineItemCategory,
  type ProposalPricing,
} from "@/types";
import {
  PROPOSAL_SETTINGS_SELECT,
  buildProposalAgency,
  buildProposalBranding,
  DEFAULT_SURFACE,
  DEFAULT_TINT,
  DEFAULT_ACCENT,
  type ProposalSettings,
} from "@/lib/proposal-branding";

const PROPOSAL_INCLUDE = {
  items: { orderBy: { position: "asc" as const } },
  trip: {
    include: {
      itineraries: { orderBy: { version: "desc" as const }, take: 1 },
      travelSegments: {
        orderBy: [
          { dayNumber: "asc" as const },
          { departureTime: "asc" as const },
        ],
      },
      agency: {
        select: {
          settings: { select: PROPOSAL_SETTINGS_SELECT },
        },
      },
    },
  },
};

export type ProposalPdfSnapshot = {
  trip: {
    destination: string;
    days: number;
    travelers: number;
    startDate: Date | null;
    travelType: string;
  };
  itinerary: ItineraryContent | null;
  segments: TravelSegment[];
  pricing: ProposalPricing | null;
  agency: {
    name: string;
    // Surface-specific marks (already absolutized). logoLight reverses onto
    // dark surfaces; logoDark sits on light pages. Either may be null.
    logoLight: string | null;
    logoDark: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    terms: string | null;
    gstin: string | null;
    registeredAddress: string;
  };
  branding: {
    theme: "classic" | "editorial" | "minimal";
    accent: string;
    surface: string;
    tint: string;
    coverStyle: "photo" | "gradient" | "solid";
    showAtAGlance: boolean;
    showInclusions: boolean;
    showTerms: boolean;
    tagline: string | null;
    showContactStrip: boolean;
    showRegisteredFooter: boolean;
    signatureNote: string | null;
    repeatLogo: boolean;
  };
  meta: {
    version: number;
    preparedAt: Date;
    validityDays: number;
  };
};

// @react-pdf renders server-side and must *fetch* every <Image src>. Uploaded
// images are stored relative (`/uploads/x.jpg`), which has no origin to
// resolve against on the server — so the cover/logo would silently drop.
// Promote relative paths to absolute using the app's public origin. Already-
// absolute (http/https) or data: URLs pass through untouched.
function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^(https?:|data:)/i.test(url)) return url;
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

function buildSnapshot(
  quote: Quote & {
    items: QuoteItem[];
    trip: {
      destination: string;
      days: number;
      travelers: number;
      startDate: Date | null;
      travelType: string;
      itineraries: { content: unknown }[];
      travelSegments: TravelSegment[];
      agency: {
        settings: ProposalSettings | null;
      };
    };
  }
): ProposalPdfSnapshot {
  const settings = quote.trip.agency.settings;
  const agencyData = buildProposalAgency(settings);
  const brandingData = buildProposalBranding(settings);

  // Same readDay normalization the HTML renderer applies.
  const rawItin = quote.trip.itineraries[0]?.content;
  const itinerary: ItineraryContent | null = rawItin
    ? (() => {
        const i = rawItin as ItineraryContent;
        return {
          ...i,
          // Absolutize so the server-side PDF renderer can fetch them.
          coverImageUrl: toAbsoluteUrl(i.coverImageUrl) ?? undefined,
          days: i.days.map((d) => {
            const day = readDay(d);
            return { ...day, imageUrl: toAbsoluteUrl(day.imageUrl) ?? undefined };
          }),
        };
      })()
    : null;

  const pricing =
    quote.items.length > 0
      ? buildProposalPricing({
          items: quote.items.map((it) => ({
            id: it.id,
            category: it.category as LineItemCategory,
            label: it.label,
            cost: it.cost,
          })),
          markupPct: quote.markupPct,
          discountPct: quote.discountPct,
          travelers: quote.trip.travelers,
        })
      : null;

  // buildProposalBranding already validated theme/coverStyle and applied
  // defaults; minimal always forces a flat cover (no photo hero).
  const theme = brandingData.theme;
  const coverStyle = theme === "minimal" ? "solid" : brandingData.coverStyle;

  // Smart logo fallback: variant → primary → (renderer falls back to monogram).
  const lightLogo = toAbsoluteUrl(agencyData.logoLight ?? agencyData.logoUrl);
  const darkLogo = toAbsoluteUrl(agencyData.logoDark ?? agencyData.logoUrl);

  return {
    trip: {
      destination: quote.trip.destination,
      days: quote.trip.days,
      travelers: quote.trip.travelers,
      startDate: quote.trip.startDate,
      travelType: quote.trip.travelType,
    },
    itinerary,
    segments: quote.trip.travelSegments,
    pricing,
    agency: {
      name: agencyData.name,
      logoLight: lightLogo,
      logoDark: darkLogo,
      phone: agencyData.phone,
      email: agencyData.email,
      website: agencyData.website,
      terms: agencyData.terms,
      gstin: agencyData.gstin,
      registeredAddress: agencyData.registeredAddress,
    },
    branding: {
      theme,
      coverStyle,
      accent: brandingData.accentColor?.trim() || DEFAULT_ACCENT,
      surface: brandingData.surfaceColor?.trim() || DEFAULT_SURFACE,
      tint: brandingData.tintColor?.trim() || DEFAULT_TINT,
      showAtAGlance: brandingData.showAtAGlance,
      showInclusions: brandingData.showInclusions,
      showTerms: brandingData.showTerms,
      tagline: brandingData.tagline?.trim() || null,
      showContactStrip: brandingData.showContactStrip,
      showRegisteredFooter: brandingData.showRegisteredFooter,
      signatureNote: brandingData.signatureNote?.trim() || null,
      repeatLogo: brandingData.repeatLogo,
    },
    meta: {
      version: quote.version,
      preparedAt: quote.updatedAt,
      validityDays: 14,
    },
  };
}

/** Fetch by public share token. Used by the customer-facing PDF endpoint. */
export async function getProposalSnapshotByToken(
  token: string
): Promise<ProposalPdfSnapshot | null> {
  const quote = await prisma.quote.findUnique({
    where: { shareToken: token },
    include: PROPOSAL_INCLUDE,
  });
  if (!quote) return null;
  return buildSnapshot(quote);
}

/** Fetch by quoteId — caller is responsible for agency-tenancy auth. */
export async function getProposalSnapshotByQuoteId(
  quoteId: string,
  agencyId: string
): Promise<ProposalPdfSnapshot | null> {
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, trip: { agencyId } },
    include: PROPOSAL_INCLUDE,
  });
  if (!quote) return null;
  return buildSnapshot(quote);
}

export function proposalPdfFilename(snap: ProposalPdfSnapshot): string {
  const dest = snap.trip.destination.replace(/[^A-Za-z0-9-]+/g, "-");
  return `${snap.agency.name.replace(/[^A-Za-z0-9-]+/g, "-")}-${dest}-v${snap.meta.version}.pdf`;
}
