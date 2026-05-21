"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { MembershipRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertCan, requireAgency } from "@/lib/session";

const ROLES = ["OWNER", "STAFF", "VIEWER"] as const;

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(ROLES).default("STAFF"),
});

function publicBase(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

/**
 * Send a team invite. The recipient email is the unique key per agency —
 * re-inviting the same address refreshes the token + expiry instead of
 * creating duplicates. Today we log the invite URL to the server console;
 * once an email adapter is plumbed in we'll send it.
 */
export async function inviteTeamMemberAction(input: z.input<typeof inviteSchema>) {
  const data = inviteSchema.parse(input);
  const { agencyId, user } = await requireAgency();
  await assertCan("team:invite");

  const email = data.email.trim().toLowerCase();
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // Reject re-invites for emails already on the team.
  const existingMember = await prisma.user.findUnique({
    where: { email },
    include: { memberships: { where: { agencyId }, select: { id: true } } },
  });
  if (existingMember?.memberships.length) {
    return { ok: false as const, error: "That email is already on your team." };
  }

  const invite = await prisma.invite.upsert({
    where: { agencyId_email: { agencyId, email } },
    create: {
      agencyId,
      email,
      role: data.role,
      token,
      invitedById: user.id,
      expiresAt,
    },
    update: {
      role: data.role,
      token,
      status: "PENDING",
      expiresAt,
      acceptedAt: null,
      invitedById: user.id,
    },
  });

  const url = `${publicBase()}/accept-invite/${invite.token}`;
  // TODO: plug an email adapter (Resend / SES / SMTP). For now we log so
  // the operator can copy the link manually.
  console.log(`[team-invite] ${email} → ${data.role} → ${url}`);

  revalidatePath("/settings/team");
  return { ok: true as const, inviteUrl: url };
}

export async function revokeInviteAction(inviteId: string) {
  const { agencyId } = await requireAgency();
  await assertCan("team:invite");
  await prisma.invite.updateMany({
    where: { id: inviteId, agencyId, status: "PENDING" },
    data: { status: "REVOKED" },
  });
  revalidatePath("/settings/team");
  return { ok: true as const };
}

const roleSchema = z.object({
  membershipId: z.string(),
  role: z.enum(ROLES),
});

export async function setMemberRoleAction(input: z.input<typeof roleSchema>) {
  const data = roleSchema.parse(input);
  const { agencyId, user } = await requireAgency();
  await assertCan("team:setRole");

  // Can't demote yourself if you're the only Owner — that would lock
  // everyone out of admin actions on this agency.
  const target = await prisma.membership.findFirst({
    where: { id: data.membershipId, agencyId },
    select: { userId: true, role: true },
  });
  if (!target) {
    return { ok: false as const, error: "Member not found." };
  }
  if (target.userId === user.id && target.role === "OWNER" && data.role !== "OWNER") {
    const ownerCount = await prisma.membership.count({
      where: { agencyId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      return {
        ok: false as const,
        error: "Promote another teammate to Owner first — every agency needs at least one.",
      };
    }
  }

  await prisma.membership.update({
    where: { id: data.membershipId },
    data: { role: data.role as MembershipRole },
  });
  revalidatePath("/settings/team");
  return { ok: true as const };
}

export async function removeMemberAction(membershipId: string) {
  const { agencyId, user } = await requireAgency();
  await assertCan("team:remove");

  const target = await prisma.membership.findFirst({
    where: { id: membershipId, agencyId },
    select: { userId: true, role: true },
  });
  if (!target) return { ok: false as const, error: "Member not found." };
  if (target.userId === user.id) {
    return {
      ok: false as const,
      error: "You can't remove yourself — ask another Owner to do it.",
    };
  }
  if (target.role === "OWNER") {
    const ownerCount = await prisma.membership.count({
      where: { agencyId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      return {
        ok: false as const,
        error: "This is the last Owner — promote someone else first.",
      };
    }
  }

  await prisma.membership.delete({ where: { id: membershipId } });
  revalidatePath("/settings/team");
  return { ok: true as const };
}
