"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertCan, requireAgency } from "@/lib/session";
import { logActivity } from "@/server/helpers/log-activity";

const LEAD_SOURCES = [
  "MANUAL",
  "INSTAGRAM",
  "REFERRAL",
  "WEBSITE",
  "WHATSAPP",
  "GOOGLE",
  "OTHER",
] as const;

const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "REQUIREMENT_UNDERSTOOD",
  "QUOTED",
  "FOLLOW_UP",
  "WON",
  "LOST",
] as const;

const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  source: z.enum(LEAD_SOURCES).default("MANUAL"),
  destination: z.string().max(120).optional().nullable(),
  travelStartDate: z.string().optional().nullable(),
  travelEndDate: z.string().optional().nullable(),
  adults: z.coerce.number().int().min(1).max(40).default(1),
  budget: z.coerce.number().int().min(0).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  // Billing identity — optional at lead time; usable as the recipient default
  // when generating tax invoices.
  gstin: z.string().max(20).optional().nullable(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export async function createLeadAction(input: CreateLeadInput) {
  const data = createLeadSchema.parse(input);
  const user = await assertCan("lead:create");

  const lead = await prisma.lead.create({
    data: {
      agencyId: user.activeAgencyId,
      ownerId: user.id,
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      source: data.source,
      destination: data.destination?.trim() || null,
      travelStartDate: data.travelStartDate
        ? new Date(data.travelStartDate)
        : null,
      travelEndDate: data.travelEndDate ? new Date(data.travelEndDate) : null,
      adults: data.adults,
      budget: data.budget ?? null,
      notes: data.notes ?? null,
      gstin: data.gstin?.trim().toUpperCase() || null,
    },
  });

  await logActivity({
    leadId: lead.id,
    actorId: user.id,
    type: "STATUS_CHANGED",
    title: "Lead created",
    metadata: { from: null, to: "NEW", source: data.source },
  });

  revalidatePath("/leads");
  revalidatePath("/");
  return { id: lead.id };
}

export async function updateLeadStatusAction(
  leadId: string,
  status: (typeof LEAD_STATUSES)[number]
) {
  const user = await assertCan("lead:update");
  const current = await prisma.lead.findFirst({
    where: { id: leadId, agencyId: user.activeAgencyId },
    select: { status: true },
  });
  if (!current) throw new Error("Lead not found");
  if (current.status === status) return { ok: true as const };

  await prisma.lead.update({
    where: { id: leadId },
    data: { status },
  });

  await logActivity({
    leadId,
    actorId: user.id,
    type: "STATUS_CHANGED",
    title: `Status changed: ${current.status} → ${status}`,
    metadata: { from: current.status, to: status },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  return { ok: true as const };
}

const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.enum(LEAD_STATUSES).optional(),
  nextFollowUpAt: z.string().optional().nullable(),
  lostReason: z.string().max(400).optional().nullable(),
});

export async function updateLeadAction(
  leadId: string,
  patch: z.infer<typeof updateLeadSchema>
) {
  const data = updateLeadSchema.parse(patch);
  const { agencyId } = await requireAgency();
  await assertCan("lead:update");

  const exists = await prisma.lead.findFirst({
    where: { id: leadId, agencyId },
    select: { id: true },
  });
  if (!exists) throw new Error("Lead not found");

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      name: data.name?.trim(),
      phone: data.phone === undefined ? undefined : data.phone?.trim() || null,
      email: data.email === undefined ? undefined : data.email?.trim() || null,
      source: data.source,
      destination:
        data.destination === undefined
          ? undefined
          : data.destination?.trim() || null,
      travelStartDate:
        data.travelStartDate === undefined
          ? undefined
          : data.travelStartDate
            ? new Date(data.travelStartDate)
            : null,
      travelEndDate:
        data.travelEndDate === undefined
          ? undefined
          : data.travelEndDate
            ? new Date(data.travelEndDate)
            : null,
      adults: data.adults,
      budget: data.budget === undefined ? undefined : (data.budget ?? null),
      notes: data.notes === undefined ? undefined : (data.notes ?? null),
      status: data.status,
      nextFollowUpAt:
        data.nextFollowUpAt === undefined
          ? undefined
          : data.nextFollowUpAt
            ? new Date(data.nextFollowUpAt)
            : null,
      lostReason:
        data.lostReason === undefined ? undefined : (data.lostReason ?? null),
    },
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  return { ok: true as const };
}

export async function softDeleteLeadAction(leadId: string) {
  const { agencyId } = await requireAgency();
  await assertCan("lead:delete");
  await prisma.lead.updateMany({
    where: { id: leadId, agencyId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/leads");
  return { ok: true as const };
}

/**
 * Assign (or clear, with null) the owner of a single lead. The owner must
 * be a member of the same agency.
 */
export async function assignLeadOwnerAction(input: {
  leadId: string;
  ownerId: string | null;
}) {
  const { agencyId } = await requireAgency();
  await assertCan("lead:assign");

  if (input.ownerId) {
    const member = await prisma.membership.findFirst({
      where: { agencyId, userId: input.ownerId },
      select: { id: true },
    });
    if (!member) {
      return { ok: false as const, error: "Not a member of this agency." };
    }
  }

  const res = await prisma.lead.updateMany({
    where: { id: input.leadId, agencyId },
    data: { ownerId: input.ownerId },
  });
  if (res.count === 0) return { ok: false as const, error: "Lead not found." };

  revalidatePath(`/leads/${input.leadId}`);
  revalidatePath("/leads");
  return { ok: true as const };
}

// === Bulk operations ===

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1).max(200),
  // Exactly one operation per call.
  op: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("status"), status: z.enum(LEAD_STATUSES) }),
    z.object({ kind: z.literal("assign"), ownerId: z.string().nullable() }),
    z.object({ kind: z.literal("delete") }),
  ]),
});

/**
 * Apply one operation to many leads at once. Every id is re-scoped to the
 * caller's agency via `updateMany`, so a forged id from another tenant is
 * silently skipped rather than mutated.
 */
export async function bulkUpdateLeadsAction(
  input: z.infer<typeof bulkSchema>
) {
  const data = bulkSchema.parse(input);
  const { agencyId } = await requireAgency();

  if (data.op.kind === "delete") {
    await assertCan("lead:delete");
    const res = await prisma.lead.updateMany({
      where: { id: { in: data.ids }, agencyId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/leads");
    return { ok: true as const, count: res.count };
  }

  if (data.op.kind === "assign") {
    await assertCan("lead:assign");
    // Validate the new owner is a member of this agency (or null = unassign).
    if (data.op.ownerId) {
      const member = await prisma.membership.findFirst({
        where: { agencyId, userId: data.op.ownerId },
        select: { id: true },
      });
      if (!member) {
        return {
          ok: false as const,
          error: "That teammate isn't on this agency.",
        };
      }
    }
    const res = await prisma.lead.updateMany({
      where: { id: { in: data.ids }, agencyId },
      data: { ownerId: data.op.ownerId },
    });
    revalidatePath("/leads");
    return { ok: true as const, count: res.count };
  }

  // status
  await assertCan("lead:update");
  const res = await prisma.lead.updateMany({
    where: { id: { in: data.ids }, agencyId },
    data: { status: data.op.status },
  });
  revalidatePath("/leads");
  return { ok: true as const, count: res.count };
}
