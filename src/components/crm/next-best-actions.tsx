import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock,
  ListChecks,
  UserPlus,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAgency } from "@/lib/session";

// "Your next best actions" — a prioritised, always-correct nudge list derived
// from live pipeline state, so a user (especially a new one) always knows the
// most useful thing to do right now. Each row only appears when it has a count
// > 0; when everything's clear it shows a calm all-done state.

type Action = {
  key: string;
  icon: typeof BellRing;
  label: string;
  href: string;
  tone: "gold" | "danger" | "default";
};

export async function NextBestActions() {
  const { agencyId } = await requireAgency();

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [newLeads, dueFollowUps, awaitingVendors, overdueTasks, quotedNoBook] =
    await Promise.all([
      prisma.contact.count({
        where: { agencyId, deletedAt: null, status: "NEW" },
      }),
      prisma.contact.count({
        where: {
          agencyId,
          deletedAt: null,
          status: { notIn: ["WON", "LOST"] },
          nextFollowUpAt: { lte: endOfToday },
        },
      }),
      prisma.vendorAssignment.count({
        where: {
          status: { in: ["PENDING", "REQUESTED"] },
          trip: { agencyId, deletedAt: null },
        },
      }),
      prisma.operationTask.count({
        where: {
          status: { in: ["PENDING", "IN_PROGRESS", "BLOCKED"] },
          dueDate: { lt: new Date() },
          trip: { agencyId, deletedAt: null },
        },
      }),
      prisma.trip.count({
        where: {
          agencyId,
          deletedAt: null,
          status: "QUOTED",
          bookings: { none: { status: { not: "CANCELLED" } } },
        },
      }),
    ]);

  const actions: (Action & { count: number })[] = [
    {
      key: "followups",
      icon: BellRing,
      count: dueFollowUps,
      label: `${dueFollowUps} follow-up${dueFollowUps === 1 ? "" : "s"} due — reach out before they go cold`,
      href: "/follow-ups",
      tone: "gold",
    },
    {
      key: "newleads",
      icon: UserPlus,
      count: newLeads,
      label: `${newLeads} new lead${newLeads === 1 ? "" : "s"} to contact for the first time`,
      href: "/contacts",
      tone: "gold",
    },
    {
      key: "vendors",
      icon: Clock,
      count: awaitingVendors,
      label: `${awaitingVendors} vendor${awaitingVendors === 1 ? "" : "s"} awaiting confirmation`,
      href: "/operations",
      tone: "default",
    },
    {
      key: "quoted",
      icon: ListChecks,
      count: quotedNoBook,
      label: `${quotedNoBook} quoted trip${quotedNoBook === 1 ? "" : "s"} not yet booked — nudge the customer`,
      href: "/trips?status=QUOTED",
      tone: "default",
    },
    {
      key: "tasks",
      icon: Wallet,
      count: overdueTasks,
      label: `${overdueTasks} overdue operations task${overdueTasks === 1 ? "" : "s"}`,
      href: "/operations",
      tone: "danger",
    },
  ];

  const live = actions.filter((a) => a.count > 0).slice(0, 5);

  return (
    <section className="mb-8 rounded-lg border border-line bg-paper p-5 md:p-6 shadow-soft">
      <div className="flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-gold-deep" />
        <p className="tc-eyebrow gold">Your next best actions</p>
      </div>

      {live.length === 0 ? (
        <div className="mt-3 flex items-center gap-2.5 text-sm text-muted">
          <CheckCircle2 className="h-4 w-4 text-ok" />
          You're all caught up — no follow-ups, confirmations or overdue tasks
          right now. Nice.
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line/70">
          {live.map((a) => {
            const Icon = a.icon;
            return (
              <li key={a.key}>
                <Link
                  href={a.href}
                  className="group flex items-center gap-3 py-2.5 transition-colors hover:text-ink"
                >
                  <span
                    className={
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border " +
                      (a.tone === "danger"
                        ? "border-bad/30 bg-bad-soft text-bad"
                        : a.tone === "gold"
                          ? "border-[var(--gold-line)] bg-gold-soft text-gold-deep"
                          : "border-line bg-paper-2 text-ink-2")
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 text-sm text-ink-2 group-hover:text-ink">
                    {a.label}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-gold-deep" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
