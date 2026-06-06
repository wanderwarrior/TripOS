import "server-only";
import type { AgencyStatus, PlanTier, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

// Read models for the platform-owner console. All cross-tenant — only ever
// called behind requirePlatformAdmin / getPlatformAdmin.

export type PlatformStats = {
  agencies: number;
  byStatus: Record<SubscriptionStatus, number>;
  paying: number;
  trialing: number;
  users: number;
  trips: number;
  /** Approximate monthly recurring revenue from ACTIVE paid subscriptions. */
  mrr: number;
};

const EMPTY_STATUS: Record<SubscriptionStatus, number> = {
  TRIALING: 0,
  ACTIVE: 0,
  PAST_DUE: 0,
  CANCELLED: 0,
  EXPIRED: 0,
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const [agencies, users, trips, statusGroups, activePlanGroups] =
    await Promise.all([
      prisma.agency.count(),
      prisma.user.count(),
      prisma.trip.count({ where: { deletedAt: null } }),
      prisma.subscription.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.subscription.groupBy({
        by: ["plan"],
        where: { status: "ACTIVE" },
        _count: { _all: true },
      }),
    ]);

  const byStatus = { ...EMPTY_STATUS };
  for (const g of statusGroups) {
    byStatus[g.status as SubscriptionStatus] = g._count._all;
  }

  const mrr = activePlanGroups.reduce((sum, g) => {
    const def = PLANS[g.plan as PlanTier];
    return sum + (def?.priceMonthly ?? 0) * g._count._all;
  }, 0);

  return {
    agencies,
    byStatus,
    paying: byStatus.ACTIVE,
    trialing: byStatus.TRIALING,
    users,
    trips,
    mrr,
  };
}

// === Platform settings (key/value) =========================================

/** Namespaced keys for the hero video shown on the public landing page. */
export const HERO_VIDEO_KEY = "hero.videoUrl";
export const HERO_POSTER_KEY = "hero.posterUrl";

export type HeroMedia = {
  /** Public URL of the hero background video (mp4/webm), or null to fall back. */
  videoUrl: string | null;
  /** Public URL of the poster image shown before/instead of the video. */
  posterUrl: string | null;
};

/**
 * Reads the configured landing-page hero media. Safe to call on every public
 * landing render — a single indexed lookup, returns nulls when unset so the
 * hero falls back to its bundled defaults.
 */
export async function getHeroMedia(): Promise<HeroMedia> {
  const rows = await prisma.platformSetting.findMany({
    where: { key: { in: [HERO_VIDEO_KEY, HERO_POSTER_KEY] } },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  const norm = (v: string | undefined) => {
    const t = v?.trim();
    return t ? t : null;
  };
  return {
    videoUrl: norm(byKey.get(HERO_VIDEO_KEY)),
    posterUrl: norm(byKey.get(HERO_POSTER_KEY)),
  };
}

export type AdminAgencyRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  ownerName: string | null;
  ownerEmail: string | null;
  requestPhone: string | null;
  approvalStatus: AgencyStatus;
  members: number;
  trips: number;
  contacts: number;
  plan: PlanTier | null;
  status: SubscriptionStatus | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
};

export async function listAgenciesForAdmin(
  query?: string
): Promise<AdminAgencyRow[]> {
  const q = query?.trim();
  const agencies = await prisma.agency.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            {
              memberships: {
                some: {
                  user: { email: { contains: q, mode: "insensitive" } },
                },
              },
            },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      subscription: true,
      memberships: {
        where: { role: "OWNER" },
        take: 1,
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, email: true } } },
      },
      _count: { select: { memberships: true, trips: true, contacts: true } },
    },
  });

  return agencies.map((a) => {
    const owner = a.memberships[0]?.user ?? null;
    return {
      id: a.id,
      name: a.name,
      slug: a.slug,
      createdAt: a.createdAt,
      ownerName: owner?.name ?? null,
      ownerEmail: owner?.email ?? null,
      requestPhone: a.requestPhone,
      approvalStatus: a.status,
      members: a._count.memberships,
      trips: a._count.trips,
      contacts: a._count.contacts,
      plan: a.subscription?.plan ?? null,
      status: a.subscription?.status ?? null,
      trialEndsAt: a.subscription?.trialEndsAt ?? null,
      currentPeriodEnd: a.subscription?.currentPeriodEnd ?? null,
    };
  });
}

/**
 * Per-agency activation summary for the owner console — a quick read on how
 * far each signup has actually gotten into the product ("added 1 customer",
 * "generated their first itinerary"). All counts are cross-tenant aggregates
 * so this stays a handful of grouped queries regardless of agency count.
 */
export type DemoRequestRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  agencyName: string | null;
  message: string | null;
  status: "NEW" | "CONTACTED" | "DONE";
  createdAt: Date;
};

/** Demo leads for the owner console — newest first, NEW ones surfaced first. */
export async function listDemoRequests(): Promise<DemoRequestRow[]> {
  const rows = await prisma.demoRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 300,
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    agencyName: r.agencyName,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt,
  }));
}

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  agency: string | null;
  message: string;
  handled: boolean;
  createdAt: Date;
};

/** Contact-form enquiries for the owner console — unhandled first. */
export async function listContactMessages(): Promise<ContactMessageRow[]> {
  const rows = await prisma.contactMessage.findMany({
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
    take: 300,
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    agency: r.agency,
    message: r.message,
    handled: r.handled,
    createdAt: r.createdAt,
  }));
}

export type TrialRequest = {
  id: string;
  name: string;
  slug: string;
  requestPhone: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  createdAt: Date;
};

/** Agencies awaiting manual trial approval, oldest first (FIFO queue). */
export async function listPendingTrialRequests(): Promise<TrialRequest[]> {
  const agencies = await prisma.agency.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: {
      memberships: {
        where: { role: "OWNER" },
        take: 1,
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });
  return agencies.map((a) => {
    const owner = a.memberships[0]?.user ?? null;
    return {
      id: a.id,
      name: a.name,
      slug: a.slug,
      requestPhone: a.requestPhone,
      ownerName: owner?.name ?? null,
      ownerEmail: owner?.email ?? null,
      createdAt: a.createdAt,
    };
  });
}

export type AgencyActivity = {
  contacts: number;
  customers: number;
  trips: number;
  itineraries: number;
  quotes: number;
  invoices: number;
  waSent: number;
  lastActiveAt: Date | null;
};

const later = (a: Date | null, b: Date | null): Date | null =>
  !a ? b : !b ? a : a > b ? a : b;

export async function getAgencyActivityMap(
  agencyIds: string[]
): Promise<Map<string, AgencyActivity>> {
  const map = new Map<string, AgencyActivity>();
  if (agencyIds.length === 0) return map;
  for (const id of agencyIds) {
    map.set(id, {
      contacts: 0,
      customers: 0,
      trips: 0,
      itineraries: 0,
      quotes: 0,
      invoices: 0,
      waSent: 0,
      lastActiveAt: null,
    });
  }

  const scope = { agencyId: { in: agencyIds } };
  const [
    contactGroups,
    customerGroups,
    tripGroups,
    invoiceGroups,
    waGroups,
    tripsWithCounts,
  ] = await Promise.all([
    prisma.contact.groupBy({
      by: ["agencyId"],
      where: { ...scope, deletedAt: null },
      _count: { _all: true },
      _max: { updatedAt: true },
    }),
    prisma.contact.groupBy({
      by: ["agencyId"],
      where: { ...scope, deletedAt: null, convertedAt: { not: null } },
      _count: { _all: true },
    }),
    prisma.trip.groupBy({
      by: ["agencyId"],
      where: { ...scope, deletedAt: null },
      _count: { _all: true },
      _max: { updatedAt: true },
    }),
    prisma.invoice.groupBy({
      by: ["agencyId"],
      where: scope,
      _count: { _all: true },
    }),
    prisma.whatsappMessage.groupBy({
      by: ["agencyId"],
      where: { ...scope, direction: "OUTBOUND" },
      _count: { _all: true },
    }),
    // Itineraries and quotes hang off trips, so aggregate their per-trip counts.
    prisma.trip.findMany({
      where: { ...scope, deletedAt: null },
      select: {
        agencyId: true,
        _count: { select: { itineraries: true, quotes: true } },
      },
    }),
  ]);

  for (const g of contactGroups) {
    const a = map.get(g.agencyId);
    if (!a) continue;
    a.contacts = g._count._all;
    a.lastActiveAt = later(a.lastActiveAt, g._max.updatedAt);
  }
  for (const g of customerGroups) {
    const a = map.get(g.agencyId);
    if (a) a.customers = g._count._all;
  }
  for (const g of tripGroups) {
    const a = map.get(g.agencyId);
    if (!a) continue;
    a.trips = g._count._all;
    a.lastActiveAt = later(a.lastActiveAt, g._max.updatedAt);
  }
  for (const g of invoiceGroups) {
    const a = map.get(g.agencyId);
    if (a) a.invoices = g._count._all;
  }
  for (const g of waGroups) {
    const a = map.get(g.agencyId);
    if (a) a.waSent = g._count._all;
  }
  for (const t of tripsWithCounts) {
    const a = map.get(t.agencyId);
    if (!a) continue;
    a.itineraries += t._count.itineraries;
    a.quotes += t._count.quotes;
  }

  return map;
}
