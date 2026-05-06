import type { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type LogInput = {
  leadId: string;
  type: ActivityType;
  title: string;
  body?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function logActivity(input: LogInput) {
  return prisma.activity.create({
    data: {
      leadId: input.leadId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      metadata: input.metadata,
    },
  });
}
