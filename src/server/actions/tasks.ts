"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertCan, requireAgency } from "@/lib/session";

const createSchema = z.object({
  contactId: z.string().optional().nullable(),
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional().nullable(),
  dueAt: z.string(),
});

/** Confirms a task belongs to the caller's agency (via its contact). */
async function requireOwnTask(taskId: string, agencyId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, contact: { agencyId } },
    select: { id: true, contactId: true },
  });
  if (!task) throw new Error("Task not found");
  return task;
}

export async function createTaskAction(input: z.infer<typeof createSchema>) {
  const data = createSchema.parse(input);
  const { agencyId } = await requireAgency();
  await assertCan("contact:update");
  // A task must hang off a contact in this agency.
  const contact = data.contactId
    ? await prisma.contact.findFirst({
        where: { id: data.contactId, agencyId, deletedAt: null },
        select: { id: true },
      })
    : null;
  if (data.contactId && !contact) throw new Error("Contact not found");

  const task = await prisma.task.create({
    data: {
      contactId: data.contactId ?? null,
      title: data.title.trim(),
      notes: data.notes ?? null,
      dueAt: new Date(data.dueAt),
    },
  });
  if (task.contactId) {
    revalidatePath(`/contacts/${task.contactId}`);
    await prisma.contact.update({
      where: { id: task.contactId },
      data: { nextFollowUpAt: task.dueAt },
    });
  }
  revalidatePath("/follow-ups");
  return { id: task.id };
}

export async function completeTaskAction(taskId: string) {
  const { agencyId } = await requireAgency();
  await assertCan("contact:update");
  await requireOwnTask(taskId, agencyId);
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { completedAt: new Date() },
  });
  if (task.contactId) revalidatePath(`/contacts/${task.contactId}`);
  revalidatePath("/follow-ups");
  revalidatePath("/");
  return { ok: true as const };
}

export async function uncompleteTaskAction(taskId: string) {
  const { agencyId } = await requireAgency();
  await assertCan("contact:update");
  await requireOwnTask(taskId, agencyId);
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { completedAt: null },
  });
  if (task.contactId) revalidatePath(`/contacts/${task.contactId}`);
  revalidatePath("/follow-ups");
  revalidatePath("/");
  return { ok: true as const };
}

export async function snoozeTaskAction(taskId: string, dueAt: string) {
  const { agencyId } = await requireAgency();
  await assertCan("contact:update");
  await requireOwnTask(taskId, agencyId);
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { dueAt: new Date(dueAt) },
  });
  if (task.contactId) {
    revalidatePath(`/contacts/${task.contactId}`);
    await prisma.contact.update({
      where: { id: task.contactId },
      data: { nextFollowUpAt: task.dueAt },
    });
  }
  revalidatePath("/follow-ups");
  return { ok: true as const };
}

export async function deleteTaskAction(taskId: string) {
  const { agencyId } = await requireAgency();
  await assertCan("contact:update");
  await requireOwnTask(taskId, agencyId);
  const task = await prisma.task.delete({ where: { id: taskId } });
  if (task.contactId) revalidatePath(`/contacts/${task.contactId}`);
  revalidatePath("/follow-ups");
  return { ok: true as const };
}
