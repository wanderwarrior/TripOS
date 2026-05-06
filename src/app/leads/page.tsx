import { PageShell } from "@/components/page-shell";
import { LeadKanban, type KanbanLead } from "@/components/crm/lead-kanban";
import { NewLeadDialog } from "@/components/crm/lead-form-dialog";
import { prisma, getOrCreateDemoUser } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const user = await getOrCreateDemoUser();
  const leads = await prisma.lead.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      destination: true,
      source: true,
      budget: true,
      adults: true,
      travelStartDate: true,
      nextFollowUpAt: true,
      status: true,
    },
  });

  const kanbanLeads: KanbanLead[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    destination: l.destination,
    source: l.source,
    budget: l.budget,
    adults: l.adults,
    travelStartDate: l.travelStartDate,
    nextFollowUpAt: l.nextFollowUpAt,
    status: l.status,
  }));

  return (
    <PageShell>
      <header className="flex items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sand-700">
            Pipeline
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl text-navy leading-tight">
            Leads
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Drag a card across columns to move it through your pipeline.
          </p>
        </div>
        <NewLeadDialog />
      </header>

      {leads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white/60 p-16 text-center">
          <p className="font-display text-2xl text-navy">No leads yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first lead to start the pipeline.
          </p>
          <div className="mt-6 inline-flex">
            <NewLeadDialog />
          </div>
        </div>
      ) : (
        <LeadKanban leads={kanbanLeads} />
      )}
    </PageShell>
  );
}
