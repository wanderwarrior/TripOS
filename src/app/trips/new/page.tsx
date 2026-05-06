import { PageShell } from "@/components/page-shell";
import { TripWizard } from "@/components/trip-wizard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function daysBetween(start: Date | null, end: Date | null) {
  if (!start || !end) return null;
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return null;
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: { leadId?: string };
}) {
  let prefill = undefined;

  if (searchParams.leadId) {
    const lead = await prisma.lead.findFirst({
      where: { id: searchParams.leadId, deletedAt: null },
      select: {
        id: true,
        name: true,
        destination: true,
        travelStartDate: true,
        travelEndDate: true,
        adults: true,
        budget: true,
        notes: true,
      },
    });
    if (lead) {
      prefill = {
        leadId: lead.id,
        leadName: lead.name,
        destination: lead.destination,
        startDate: lead.travelStartDate
          ? lead.travelStartDate.toISOString().slice(0, 10)
          : null,
        days: daysBetween(lead.travelStartDate, lead.travelEndDate),
        travelers: lead.adults,
        budget: lead.budget,
        notes: lead.notes,
      };
    }
  }

  return (
    <PageShell>
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-sand-700">
          New trip
        </p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl text-navy">
          A few details, then we craft.
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto">
          Tell us the essentials. We'll generate a day-by-day plan you can
          shape, price, and share.
        </p>
      </div>
      <TripWizard prefill={prefill} />
    </PageShell>
  );
}
