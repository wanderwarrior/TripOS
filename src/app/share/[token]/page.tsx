import Image from "next/image";
import { notFound } from "next/navigation";
import { Compass, Download } from "lucide-react";
import { PreviewRenderer } from "@/components/preview-renderer";
import { AcceptQuoteButton } from "@/components/quotes/accept-quote-button";
import { prisma } from "@/lib/prisma";
import type { ItineraryContent } from "@/lib/ai";
import { buildProposalPricing, type LineItemCategory } from "@/types";
import {
  PROPOSAL_SETTINGS_SELECT,
  buildProposalAgency,
  buildProposalBranding,
} from "@/lib/proposal-branding";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Travel proposal — TripCraft",
  robots: { index: false, follow: false },
};

export default async function PublicQuotePage({
  params,
}: {
  params: { token: string };
}) {
  const quote = await prisma.quote.findUnique({
    where: { shareToken: params.token },
    include: {
      items: { orderBy: { position: "asc" } },
      trip: {
        include: {
          // Latest itinerary version, not v1 — operators iterate.
          itineraries: { orderBy: { version: "desc" }, take: 1 },
          travelSegments: {
            orderBy: [{ dayNumber: "asc" }, { departureTime: "asc" }],
          },
          agency: {
            select: {
              settings: { select: PROPOSAL_SETTINGS_SELECT },
            },
          },
        },
      },
    },
  });
  if (!quote) notFound();

  const itinerary = (quote.trip.itineraries[0]?.content ?? null) as
    | ItineraryContent
    | null;

  const settings = quote.trip.agency.settings;
  const proposalAgency = buildProposalAgency(settings);
  const proposalBranding = buildProposalBranding(settings);
  const agencyName = proposalAgency.name;

  // Customer-safe pricing — selling amounts only, no cost / markup / profit
  // ever reaches the client.
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

  const canAccept =
    quote.status === "DRAFT" ||
    quote.status === "SENT" ||
    quote.status === "ACCEPTED";

  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-ivory/85 backdrop-blur-md print:hidden">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            {settings?.logoUrl ? (
              // The agency's branding takes priority on customer-facing pages.
              <Image
                src={settings.logoUrl}
                alt={agencyName}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover border border-line"
                unoptimized
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-ivory">
                <Compass className="h-4 w-4" />
              </span>
            )}
            <span className="font-display text-xl tracking-tight text-navy">
              {agencyName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Quote v{quote.version}
            </span>
            <a
              href={`/api/share/${params.token}/pdf`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy hover:border-navy/40 hover:shadow-soft transition-all"
            >
              <Download className="h-3 w-3" />
              Download PDF
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl py-8 md:py-12 px-4 md:px-6 space-y-10">
        <div className="overflow-hidden rounded-xl border border-line shadow-lift print:border-0 print:shadow-none print:rounded-none">
          <PreviewRenderer
            trip={{
              destination: quote.trip.destination,
              days: quote.trip.days,
              travelers: quote.trip.travelers,
              startDate: quote.trip.startDate,
              travelType: quote.trip.travelType,
            }}
            itinerary={itinerary}
            pricing={pricing}
            segments={quote.trip.travelSegments}
            agency={proposalAgency}
            branding={proposalBranding}
            meta={{
              version: quote.version,
              preparedAt: quote.updatedAt.toISOString(),
              validityDays: 14,
            }}
          />
        </div>

        {canAccept ? (
          <div className="print:hidden">
            <AcceptQuoteButton
              token={params.token}
              alreadyAccepted={quote.status === "ACCEPTED"}
              agencyName={agencyName}
            />
          </div>
        ) : null}

        <footer className="text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground pt-6 print:hidden">
          Crafted with TripCraft · for {agencyName}
        </footer>
      </main>
    </div>
  );
}
