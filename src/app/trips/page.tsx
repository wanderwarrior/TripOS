import Link from "next/link";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { prisma, getOrCreateDemoUser } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TripsIndexPage() {
  const user = await getOrCreateDemoUser();
  const trips = await prisma.trip.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell>
      <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sand-700">
            Studio
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl text-navy leading-tight">
            Trips
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every itinerary you've drafted, in one place.
          </p>
        </div>
        <Link href="/trips/new">
          <Button>
            <Plus className="h-4 w-4" />
            New trip
          </Button>
        </Link>
      </header>

      {trips.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white/60 p-16 text-center">
          <p className="font-display text-2xl text-navy">No trips yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Start your first proposal — it takes a few minutes.
          </p>
          <div className="mt-6">
            <Link href="/trips/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create new trip
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t, i) => (
            <TripCard
              key={t.id}
              index={i}
              id={t.id}
              destination={t.destination}
              days={t.days}
              travelers={t.travelers}
              travelType={t.travelType}
              startDate={t.startDate}
              createdAt={t.createdAt}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
