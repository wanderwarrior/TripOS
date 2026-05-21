"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";

const signupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters"),
  agencyName: z.string().min(2).max(160),
});

export type SignupInput = z.input<typeof signupSchema>;

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

/**
 * Fresh signup — creates a User + Agency + OWNER Membership atomically,
 * then signs the new user in.
 */
export async function signupAction(input: SignupInput) {
  const data = signupSchema.parse(input);
  const email = data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.hashedPassword) {
    return {
      ok: false as const,
      error: "An account already exists with that email — try signing in.",
    };
  }

  const slug = await uniqueSlug(slugify(data.agencyName));
  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.$transaction(async (tx) => {
    const user = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: { name: data.name, hashedPassword, emailVerified: new Date() },
        })
      : await tx.user.create({
          data: {
            email,
            name: data.name,
            hashedPassword,
            emailVerified: new Date(),
          },
        });

    const agency = await tx.agency.create({
      data: { name: data.agencyName.trim(), slug },
    });

    await tx.membership.create({
      data: { userId: user.id, agencyId: agency.id, role: "OWNER" },
    });
  });

  await signIn("credentials", {
    email,
    password: data.password,
    redirectTo: "/",
  });
  return { ok: true as const };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(input: z.input<typeof loginSchema>) {
  const data = loginSchema.parse(input);
  try {
    await signIn("credentials", {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      redirectTo: "/",
    });
    return { ok: true as const };
  } catch (err) {
    // Auth.js throws a redirect "error" on success — let it bubble.
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { ok: false as const, error: "Invalid email or password." };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

const acceptInviteSchema = z.object({
  token: z.string().min(8),
  name: z.string().min(2).max(120),
  password: z.string().min(8),
});

/**
 * Accept a pending invite. If no User exists for the invite's email,
 * create one; otherwise just attach a new Membership. Idempotent on the
 * token (re-accepting marks the invite ACCEPTED no-op).
 */
export async function acceptInviteAction(
  input: z.input<typeof acceptInviteSchema>
) {
  const data = acceptInviteSchema.parse(input);

  const invite = await prisma.invite.findUnique({
    where: { token: data.token },
    include: { agency: { select: { id: true, name: true } } },
  });
  if (!invite) return { ok: false as const, error: "Invite not found." };
  if (invite.status !== "PENDING") {
    return { ok: false as const, error: "This invite has already been used." };
  }
  if (invite.expiresAt < new Date()) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    return { ok: false as const, error: "This invite has expired." };
  }

  const email = invite.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.$transaction(async (tx) => {
    const user = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: {
            name: existing.name ?? data.name,
            hashedPassword: existing.hashedPassword ?? hashedPassword,
            emailVerified: existing.emailVerified ?? new Date(),
          },
        })
      : await tx.user.create({
          data: {
            email,
            name: data.name,
            hashedPassword,
            emailVerified: new Date(),
          },
        });

    await tx.membership.upsert({
      where: { userId_agencyId: { userId: user.id, agencyId: invite.agencyId } },
      create: { userId: user.id, agencyId: invite.agencyId, role: invite.role },
      update: { role: invite.role, suspendedAt: null },
    });

    await tx.invite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
  });

  await signIn("credentials", {
    email,
    password: data.password,
    redirectTo: "/",
  });
  return { ok: true as const };
}
