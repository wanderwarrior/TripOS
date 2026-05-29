import "server-only";
import type {
  PlanTier,
  Subscription,
  SubscriptionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PLANS, TRIAL_DAYS, type PlanFeatures } from "@/lib/plans";

const DAY_MS = 24 * 60 * 60 * 1000;

export type EffectivePlan = {
  /** The stored plan tier. */
  tier: PlanTier;
  status: SubscriptionStatus;
  trialEndsAt: Date | null;
  /** Whole days remaining on the trial (can be 0); null when not trialing. */
  trialDaysLeft: number | null;
  trialActive: boolean;
  /** Trial lapsed or subscription not active — surface an upgrade nudge. */
  needsUpgrade: boolean;
  /** Resolved feature access (trial = full; lapsed = graceful Starter). */
  features: PlanFeatures;
  /** Resolved seat allowance. */
  seats: number;
};

/**
 * Returns the agency's subscription, lazily creating a fresh TRIAL the
 * first time we see an agency that doesn't have one (covers agencies that
 * existed before subscriptions shipped).
 */
export async function getOrCreateSubscription(
  agencyId: string
): Promise<Subscription> {
  const existing = await prisma.subscription.findUnique({
    where: { agencyId },
  });
  if (existing) return existing;
  return prisma.subscription.create({
    data: {
      agencyId,
      plan: "TRIAL",
      status: "TRIALING",
      trialEndsAt: new Date(Date.now() + TRIAL_DAYS * DAY_MS),
    },
  });
}

function resolve(sub: Subscription): EffectivePlan {
  const now = Date.now();

  if (sub.status === "ACTIVE") {
    const def = PLANS[sub.plan] ?? PLANS.STARTER;
    return {
      tier: sub.plan,
      status: sub.status,
      trialEndsAt: null,
      trialDaysLeft: null,
      trialActive: false,
      needsUpgrade: false,
      features: def.features,
      seats: def.seats,
    };
  }

  if (sub.status === "TRIALING") {
    const ends = sub.trialEndsAt;
    const active = ends ? ends.getTime() > now : false;
    const daysLeft = ends
      ? Math.max(0, Math.ceil((ends.getTime() - now) / DAY_MS))
      : 0;
    if (active) {
      return {
        tier: "TRIAL",
        status: sub.status,
        trialEndsAt: ends,
        trialDaysLeft: daysLeft,
        trialActive: true,
        needsUpgrade: false,
        features: PLANS.TRIAL.features,
        seats: PLANS.TRIAL.seats,
      };
    }
    // Trial lapsed — keep them working on Starter-level access, nudge upgrade.
    return {
      tier: "TRIAL",
      status: sub.status,
      trialEndsAt: ends,
      trialDaysLeft: 0,
      trialActive: false,
      needsUpgrade: true,
      features: PLANS.STARTER.features,
      seats: PLANS.STARTER.seats,
    };
  }

  // CANCELLED / EXPIRED / PAST_DUE — graceful Starter access + upgrade nudge.
  return {
    tier: sub.plan,
    status: sub.status,
    trialEndsAt: sub.trialEndsAt,
    trialDaysLeft: null,
    trialActive: false,
    needsUpgrade: true,
    features: PLANS.STARTER.features,
    seats: PLANS.STARTER.seats,
  };
}

export async function getEffectivePlan(
  agencyId: string
): Promise<EffectivePlan> {
  const sub = await getOrCreateSubscription(agencyId);
  return resolve(sub);
}

export async function hasFeature(
  agencyId: string,
  feature: keyof PlanFeatures
): Promise<boolean> {
  const plan = await getEffectivePlan(agencyId);
  return plan.features[feature];
}

/** Active (non-suspended) seats used vs the plan allowance. */
export async function seatUsage(agencyId: string): Promise<{
  used: number;
  max: number;
  atLimit: boolean;
}> {
  const [plan, used] = await Promise.all([
    getEffectivePlan(agencyId),
    prisma.membership.count({
      where: { agencyId, suspendedAt: null },
    }),
  ]);
  return { used, max: plan.seats, atLimit: used >= plan.seats };
}

/**
 * Throws when adding another seat would exceed the plan. Counts pending
 * invites too, so an agency can't overshoot by inviting past the cap.
 */
export async function assertSeatAvailable(agencyId: string): Promise<void> {
  const plan = await getEffectivePlan(agencyId);
  const [members, pendingInvites] = await Promise.all([
    prisma.membership.count({ where: { agencyId, suspendedAt: null } }),
    prisma.invite.count({ where: { agencyId, status: "PENDING" } }),
  ]);
  if (members + pendingInvites >= plan.seats) {
    throw new Error(
      `Your ${PLANS[plan.tier].name} plan includes ${plan.seats} seats. Upgrade to add more team members.`
    );
  }
}
