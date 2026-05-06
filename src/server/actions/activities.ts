"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/server/helpers/log-activity";

const noteSchema = z.object({
  leadId: z.string(),
  body: z.string().min(1).max(4000),
});

export async function addNoteAction(input: z.infer<typeof noteSchema>) {
  const data = noteSchema.parse(input);
  await logActivity({
    leadId: data.leadId,
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
  await logActivity({
    leadId: data.leadId,
    type: "CALL",
    title: "Call logged",
    body: data.body?.trim() || null,
  });
  revalidatePath(`/leads/${data.leadId}`);
  return { ok: true as const };
}

export async function logWhatsAppAction(input: z.infer<typeof callSchema>) {
  const data = callSchema.parse(input);
  await logActivity({
    leadId: data.leadId,
    type: "WHATSAPP",
    title: "WhatsApp message",
    body: data.body?.trim() || null,
  });
  revalidatePath(`/leads/${data.leadId}`);
  return { ok: true as const };
}
