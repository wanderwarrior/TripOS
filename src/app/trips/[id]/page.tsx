import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { ItineraryEditor } from "@/components/itinerary-editor";
import { QuoteBuilder, type QuoteData } from "@/components/quotes/quote-builder";
import { BookingPanel } from "@/components/bookings/booking-panel";
import { SegmentList } from "@/components/segments/segment-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import type { ItineraryContent } from "@/lib/ai";
import type { LineItemCategory, PricingItem } from "@/types";
import { TRIP_STATUS_LABEL, TRIP_STATUS_TONE } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function TripWorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      lead: { select: { id: true, name: true } },
      itineraries: {
        where: { version: 1 },
        take: 1,
      },
      quotes: {
        orderBy: { version: "asc" },
        include: { items: { orderBy: { position: "asc" } } },
      },
      bookings: {
        where: { status: { not: "CANCELLED" } },
        include: {
          quote: { select: { version: true } },
          payments: { orderBy: { paidAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      travelSegments: {
        orderBy: [{ dayNumber: "asc" }, { departureTime: "asc" }],
      },
    },
  });
  if (!trip) notFound();

  const activeBooking = trip.bookings[0] ?? null;
  const segments = trip.travelSegments;

  const itineraryContent = (trip.itineraries[0]?.content ?? null) as
    | ItineraryContent
    | null;

  const quotes: QuoteData[] = trip.quotes.map((q) => ({
    id: q.id,
    version: q.version,
    status: q.status,
    markupPct: q.markupPct,
    discountPct: q.discountPct,
    shareToken: q.shareToken,
    items: q.items.map((it) => ({
      id: it.id,
      category: it.category as LineItemCategory,
      label: it.label,
      cost: it.cost,
    })) as PricingItem[],
  }));

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All trips
        </Link>
        <div className="flex items-center gap-3">
          {trip.lead && (
            <Link
              href={`/leads/${trip.lead.id}`}
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-navy transition-colors"
            >
              Lead · {trip.lead.name}
            </Link>
          )}
          <Badge variant={TRIP_STATUS_TONE[trip.status]}>
            {TRIP_STATUS_LABEL[trip.status]}
          </Badge>
          <Link href={`/trips/${trip.id}/preview`}>
            <Button variant="accent" size="sm">
              <Eye className="h-3.5 w-3.5" />
              Preview proposal
            </Button>
          </Link>
        </div>
      </div>

      {activeBooking && (
        <BookingPanel
          booking={{
            id: activeBooking.id,
            status: activeBooking.status,
            totalAmount: activeBooking.totalAmount,
            paidAmount: activeBooking.paidAmount,
            createdAt: activeBooking.createdAt,
            payments: activeBooking.payments,
            quoteVersion: activeBooking.quote.version,
          }}
        />
      )}

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] items-start">
        <Tabs defaultValue="itinerary">
          <TabsList>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="transport">
              Transport
              {segments.length > 0 && (
                <span className="ml-2 text-xs opacity-70">
                  {segments.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="itinerary">
            <ItineraryEditor
              tripId={trip.id}
              destination={trip.destination}
              initial={itineraryContent}
              segments={segments}
            />
          </TabsContent>
          <TabsContent value="transport">
            <SegmentList
              tripId={trip.id}
              tripDays={trip.days}
              segments={segments}
            />
          </TabsContent>
        </Tabs>
        <div className="lg:sticky lg:top-24">
          <QuoteBuilder tripId={trip.id} quotes={quotes} />
        </div>
      </div>
    </PageShell>
  );
}
