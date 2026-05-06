"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  leadId: z.string().optional().nullable(),
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional().nullable(),
  dueAt: z.string(),
});

export async function createTaskAction(input: z.infer<typeof createSchema>) {
  const data = createSchema.parse(input);
  const task = await prisma.task.create({
    data: {
      leadId: data.leadId ?? null,
      title: data.title.trim(),
      notes: data.notes ?? null,
      dueAt: new Date(data.dueAt),
    },
  });
  if (task.leadId) {
    revalidatePath(`/leads/${task.leadId}`);
    await prisma.lead.update({
      where: { id: task.leadId },
      data: { nextFollowUpAt: task.dueAt },
    });
  }
  revalidatePath("/follow-ups");
  return { id: task.id };
}

export async function completeTaskAction(taskId: string) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { completedAt: new Date() },
  });
  if (task.leadId) revalidatePath(`/leads/${task.leadId}`);
  revalidatePath("/follow-ups");
  revalidatePath("/");
  return { ok: true as const };
}

export async function uncompleteTaskAction(taskId: string) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { completedAt: null },
  });
  if (task.leadId) revalidatePath(`/leads/${task.leadId}`);
  revalidatePath("/follow-ups");
  revalidatePath("/");
  return { ok: true as const };
}

export async function snoozeTaskAction(taskId: string, dueAt: string) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { dueAt: new Date(dueAt) },
  });
  if (task.leadId) {
    revalidatePath(`/leads/${task.leadId}`);
    await prisma.lead.update({
      where: { id: task.leadId },
      data: { nextFollowUpAt: task.dueAt },
    });
  }
  revalidatePath("/follow-ups");
  return { ok: true as const };
}

export async function deleteTaskAction(taskId: string) {
  const task = await prisma.task.delete({ where: { id: taskId } });
  if (task.leadId) revalidatePath(`/leads/${task.leadId}`);
  revalidatePath("/follow-ups");
  return { ok: true as const };
}
