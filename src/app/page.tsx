import Link from "next/link";
import {
  CalendarClock,
  Plus,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/crm/stat-tile";
import {
  ActivityFeed,
  type ActivityFeedItem,
} from "@/components/crm/activity-feed";
import { FollowUpRow, type FollowUpRowData } from "@/components/crm/follow-up-row";
import { NewLeadDialog } from "@/components/crm/lead-form-dialog";
import { prisma, getOrCreateDemoUser } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getOrCreateDemoUser();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    leadsTotal,
    leadsActive,
    leadsWonThisMonth,
    revenueAgg,
    overdueCount,
    customers,
    activitiesRaw,
    upcomingTasks,
  ] = await Promise.all([
    prisma.lead.count({ where: { userId: user.id, deletedAt: null } }),
    prisma.lead.count({
      where: {
        userId: user.id,
        deletedAt: null,
        status: { notIn: ["WON", "LOST"] },
      },
    }),
    prisma.lead.count({
      where: {
        userId: user.id,
        deletedAt: null,
        status: "WON",
        updatedAt: { gte: startOfMonth },
      },
    }),
    prisma.payment.aggregate({
      where: {
        booking: { trip: { userId: user.id }, status: { not: "CANCELLED" } },
        paidAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.task.count({
      where: {
        completedAt: null,
        dueAt: { lt: now },
        OR: [
          { lead: { userId: user.id, deletedAt: null } },
          { leadId: null },
        ],
      },
    }),
    prisma.customer.count({
      where: { lead: { userId: user.id, deletedAt: null } },
    }),
    prisma.activity.findMany({
      where: { lead: { userId: user.id, deletedAt: null } },
      include: { lead: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.task.findMany({
      where: {
        completedAt: null,
        OR: [
          { lead: { userId: user.id, deletedAt: null } },
          { leadId: null },
        ],
      },
      include: { lead: { select: { id: true, name: true } } },
      orderBy: { dueAt: "asc" },
      take: 5,
    }),
  ]);

  const conversionPct =
    leadsTotal > 0
      ? Math.round((leadsWonThisMonth / leadsTotal) * 100)
      : 0;

  const monthLabel = now.toLocaleString("en-IN", { month: "long" });

  const activities = activitiesRaw as unknown as ActivityFeedItem[];
  const followUps: FollowUpRowData[] = upcomingTasks.map((t) => ({
    id: t.id,
    title: t.title,
    dueAt: t.dueAt,
    completedAt: t.completedAt,
    lead: t.lead ? { id: t.lead.id, name: t.lead.name } : null,
  }));

  return (
    <PageShell>
      <section className="grid gap-10 md:grid-cols-[1.4fr_1fr] items-end mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sand-700 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            {monthLabel}, {now.getFullYear()}
          </p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl text-navy leading-[1.05] text-balance">
            Today's pipeline.
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg text-ink/70 leading-relaxed">
            A snapshot of leads in motion, follow-ups on your plate, and
            revenue rolling in this month.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <NewLeadDialog
              trigger={
                <Button size="lg">
                  <UserPlus className="h-4 w-4" />
                  New lead
                </Button>
              }
            />
            <Link href="/trips/new">
              <Button size="lg" variant="outline">
                <Plus className="h-4 w-4" />
                New trip
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <StatTile
          icon={<Users className="h-3 w-3" />}
          label="Active leads"
          value={String(leadsActive)}
          hint={`${leadsTotal} total in pipeline`}
          href="/leads"
        />
        <StatTile
          icon={<TrendingUp className="h-3 w-3" />}
          label="Won this month"
          value={`${leadsWonThisMonth}`}
          hint={`${conversionPct}% lifetime conversion`}
          href="/customers"
        />
        <StatTile
          icon={<Wallet className="h-3 w-3" />}
          label="Collected this month"
          value={formatINR(revenueAgg._sum.amount ?? 0)}
          hint={`${customers} customers on the books`}
          href="/bookings"
          tone="navy"
        />
        <StatTile
          icon={<CalendarClock className="h-3 w-3" />}
          label="Overdue follow-ups"
          value={String(overdueCount)}
          hint={overdueCount > 0 ? "Triage first" : "All clear"}
          href="/follow-ups"
          tone={overdueCount > 0 ? "danger" : undefined}
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.5fr_1fr] items-start">
        <div>
          <SectionHeading
            title="Recent activity"
            cta={{ label: "All leads", href: "/leads" }}
          />
          <ActivityFeed activities={activities} />
        </div>

        <div>
          <SectionHeading
            title="Up next"
            cta={{ label: "All follow-ups", href: "/follow-ups" }}
          />
          {followUps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/60 p-8 text-center text-sm text-muted-foreground">
              Nothing scheduled. Add a follow-up from any lead.
            </div>
          ) : (
            <ul className="space-y-2">
              {followUps.map((t) => (
                <FollowUpRow key={t.id} task={t} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function SectionHeading({
  title,
  cta,
}: {
  title: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="font-display text-2xl text-navy">{title}</h2>
      {cta && (
        <Link
          href={cta.href}
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-navy transition-colors"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
