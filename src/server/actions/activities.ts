"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertCan, requireAgency } from "@/lib/session";
import { logActivity } from "@/server/helpers/log-activity";

const noteSchema = z.object({
  leadId: z.string(),
  body: z.string().min(1).max(4000),
});

/**
 * Confirms the lead belongs to the caller's agency before logging — stops
 * a forged leadId from writing an activity into another tenant's timeline.
 */
async function assertLeadInAgency(leadId: string, agencyId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, agencyId },
    select: { id: true },
  });
  if (!lead) throw new Error("Lead not found");
}

export async function addNoteAction(input: z.infer<typeof noteSchema>) {
  const data = noteSchema.parse(input);
  const user = await assertCan("lead:update");
  await assertLeadInAgency(data.leadId, user.activeAgencyId);
  await logActivity({
    leadId: data.leadId,
    actorId: user.id,
    type: "NOTE",
    title: "Note added",
    body: data.body.trim(),
  });
  revalidatePath(`/leads/${data.leadId}`);
  return { ok: true as const };
}

const callSchema = z.object({
  leadId: z.string(),
  body: z.string().max(2000).optional().nullable(),
});

export async function logCallAction(input: z.infer<typeof callSchema>) {
  const data = callSchema.parse(input);
  const { user, agencyId } = await requireAgency();
  await assertLeadInAgency(data.leadId, agencyId);
  await logActivity({
    leadId: data.leadId,
    actorId: user.id,
    type: "CALL",
    title: "Call logged",
    body: data.body?.trim() || null,
  });
  revalidatePath(`/leads/${data.leadId}`);
  return { ok: true as const };
}

export async function logWhatsAppAction(input: z.infer<typeof callSchema>) {
  const data = callSchema.parse(input);
  const { user, agencyId } = await requireAgency();
  await assertLeadInAgency(data.leadId, agencyId);
  await logActivity({
    leadId: data.leadId,
    actorId: user.id,
    type: "WHATSAPP",
    title: "WhatsApp message",
    body: data.body?.trim() || null,
  });
  revalidatePath(`/leads/${data.leadId}`);
  return { ok: true as const };
}
