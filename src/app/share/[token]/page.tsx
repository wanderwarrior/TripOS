import { notFound } from "next/navigation";
import { Compass } from "lucide-react";
import { PreviewRenderer } from "@/components/preview-renderer";
import { prisma } from "@/lib/prisma";
import type { ItineraryContent } from "@/lib/ai";
import type { LineItemCategory, PricingItem } from "@/types";

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
          itineraries: { where: { version: 1 }, take: 1 },
          travelSegments: {
            orderBy: [{ dayNumber: "asc" }, { departureTime: "asc" }],
          },
        },
      },
    },
  });
  if (!quote) notFound();

  const itinerary = (quote.trip.itineraries[0]?.content ?? null) as
    | ItineraryContent
    | null;

  const pricing = {
    items: quote.items.map((it) => ({
      id: it.id,
      category: it.category as LineItemCategory,
      label: it.label,
      cost: it.cost,
    })) as PricingItem[],
    markupPct: quote.markupPct,
    discountPct: quote.discountPct,
    markupAmount: Math.round(quote.totalCost * (quote.markupPct / 100)),
    discountAmount: Math.round(
      quote.totalCost * (1 + quote.markupPct / 100) * (quote.discountPct / 100)
    ),
    totalCost: quote.totalCost,
    sellingPrice: quote.sellingPrice,
    profit: quote.profit,
    version: quote.version,
    status: quote.status,
  };

  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-ivory/85 backdrop-blur-md print:hidden">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-ivory">
              <Compass className="h-4 w-4" />
            </span>
            <span className="font-display text-xl tracking-tight text-navy">
              TripCraft
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Quote v{quote.version}
          </span>
        </div>
      </header>

      <main className="container py-10 md:py-16 max-w-5xl">
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
        />
      </main>
    </div>
  );
}
