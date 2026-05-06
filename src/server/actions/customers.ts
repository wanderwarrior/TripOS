"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/server/helpers/log-activity";

const preferencesSchema = z
  .object({
    dietary: z.string().max(200).optional().nullable(),
    hotels: z.string().max(200).optional().nullable(),
    travelStyle: z.string().max(200).optional().nullable(),
    other: z.string().max(2000).optional().nullable(),
  })
  .partial();

const convertSchema = z.object({
  leadId: z.string(),
  preferences: preferencesSchema.optional(),
});

export async function convertLeadToCustomerAction(
  input: z.infer<typeof convertSchema>
) {
  const data = convertSchema.parse(input);
  const lead = await prisma.lead.findFirst({
    where: { id: data.leadId, deletedAt: null },
    include: { customer: true },
  });
  if (!lead) throw new Error("Lead not found");

  if (lead.customer) {
    return { ok: true as const, customerId: lead.customer.id };
  }

  const customer = await prisma.customer.create({
    data: {
      leadId: lead.id,
      preferences: data.preferences as Record<string, unknown> | undefined,
    },
  });

  // Bump lead status to WON if it isn't already terminal.
  if (lead.status !== "WON" && lead.status !== "LOST") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "WON" },
    });
  }

  await logActivity({
    leadId: lead.id,
    type: "STATUS_CHANGED",
    title: "Converted to customer",
    metadata: { customerId: customer.id, from: lead.status, to: "WON" },
  });

  revalidatePath(`/leads/${lead.id}`);
  revalidatePath("/customers");
  revalidatePath("/leads");
  return { ok: true as const, customerId: customer.id };
}

const updatePrefsSchema = z.object({
  customerId: z.string(),
  preferences: preferencesSchema,
});

export async function updateCustomerPreferencesAction(
  input: z.infer<typeof updatePrefsSchema>
) {
  const data = updatePrefsSchema.parse(input);
  const customer = await prisma.customer.update({
    where: { id: data.customerId },
    data: {
      preferences: data.preferences as Record<string, unknown>,
    },
    select: { leadId: true },
  });
  revalidatePath(`/leads/${customer.leadId}`);
  revalidatePath("/customers");
  return { ok: true as const };
}
