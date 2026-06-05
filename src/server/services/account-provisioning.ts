import "server-only";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { TRIAL_DAYS } from "@/lib/plans";

// Shared account/tenant provisioning. Used by both the email/password signup
// action and OAuth (Google) sign-in: every authenticated user must resolve to
// an Agency membership, so a brand-new sign-in needs a User + Agency + OWNER
// Membership + trial Subscription created atomically.

type MembershipRole = "OWNER" | "STAFF" | "VIEWER";

export type ProvisionedUser = {
  userId: string;
  activeAgencyId: string;
  activeAgencyRole: MembershipRole;
  activeAgencyName: string;
};

/** Pick the user's default agency — earliest non-suspended membership. */
export async function resolveActiveMembership(userId: string) {
  return prisma.membership.findFirst({
    where: { userId, suspendedAt: null },
    include: { agency: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
}

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "agency"
  );
}

async function uniqueSlug(base: string) {
  let candidate = base;
  for (let attempt = 0; attempt < 6; attempt++) {
    const existing = await prisma.agency.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${randomBytes(2).toString("hex")}`;
  }
  return `${base}-${randomBytes(4).toString("hex")}`;
}

/** A sensible default agency name when the user didn't pick one (OAuth). */
function deriveAgencyName(name: string | null | undefined, email: string) {
  const first = name?.trim().split(/\s+/)[0];
  if (first) return `${first}'s agency`;
  const local = email.split("@")[0] || "My";
  return `${local}'s agency`;
}

/**
 * Create a fresh Agency (with OWNER membership + 14-day trial) for an existing
 * user who has no membership yet. Slug uniqueness is resolved before the
 * transaction so the tx stays a pure set of writes.
 */
export async function createAgencyForUser(
  userId: string,
  agencyName: string
): Promise<{ id: string; name: string }> {
  const slug = await uniqueSlug(slugify(agencyName));
  return prisma.$transaction(async (tx) => {
    const agency = await tx.agency.create({
      data: { name: agencyName.trim(), slug },
    });
    await tx.membership.create({
      data: { userId, agencyId: agency.id, role: "OWNER" },
    });
    await tx.subscription.create({
      data: {
        agencyId: agency.id,
        plan: "TRIAL",
        status: "TRIALING",
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      },
    });
    return { id: agency.id, name: agency.name };
  });
}

/**
 * Resolve an OAuth identity (verified Google email) to one of our users.
 *
 * - Links to an existing account when the email already exists (credentials or
 *   a prior OAuth login) — Google verifies the address, so by-email linking is
 *   safe and gives a single account across sign-in methods.
 * - Otherwise creates a new User and spins up their first Agency.
 * - Always returns the user's active membership so the JWT can carry it.
 */
export async function provisionOAuthUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<ProvisionedUser | null> {
  const email = input.email.trim().toLowerCase();
  if (!email) return null;

  let user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, image: true },
  });

  if (user) {
    // Backfill name/avatar from Google if we never captured them.
    if ((!user.name && input.name) || (!user.image && input.image)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name ?? input.name ?? undefined,
          image: user.image ?? input.image ?? undefined,
        },
        select: { id: true, name: true, image: true },
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: input.name ?? null,
        image: input.image ?? null,
        // OAuth emails from Google are already verified.
        emailVerified: new Date(),
      },
      select: { id: true, name: true, image: true },
    });
  }

  let membership = await resolveActiveMembership(user.id);
  if (!membership) {
    const agency = await createAgencyForUser(
      user.id,
      deriveAgencyName(input.name ?? user.name, email)
    );
    return {
      userId: user.id,
      activeAgencyId: agency.id,
      activeAgencyRole: "OWNER",
      activeAgencyName: agency.name,
    };
  }

  return {
    userId: user.id,
    activeAgencyId: membership.agencyId,
    activeAgencyRole: membership.role as MembershipRole,
    activeAgencyName: membership.agency.name,
  };
}
