import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const DEMO_USER_EMAIL = "demo@tripcraft.app";

export async function getOrCreateDemoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: { email: DEMO_USER_EMAIL },
  });
}
