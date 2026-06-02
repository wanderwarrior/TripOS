"use server";

import { createHash, randomBytes } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { brandedEmail, sendEmail } from "@/lib/email";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { TRIAL_DAYS } from "@/lib/plans";

function publicBase(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

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

    // Every new agency starts on a 14-day full-access trial.
    await tx.subscription.create({
      data: {
        agencyId: agency.id,
        plan: "TRIAL",
        status: "TRIALING",
        trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      },
    });
  });

  await signIn("credentials", {
    email,
    password: data.password,
    redirectTo: "/dashboard",
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
      redirectTo: "/dashboard",
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

// === Password reset =======================================================

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Request a reset link. Always resolves with the same shape regardless of
 * whether the email exists — no account enumeration. A token is only minted
 * for accounts that actually have a password (credentials users).
 */
export async function requestPasswordResetAction(input: { email: string }) {
  // Throttle reset requests per IP — 5 per 15 min. Always return ok so we
  // never leak whether an account or the throttle was hit (no enumeration).
  const rl = rateLimit(`pwreset:${clientIpFrom(headers())}`, 5, 15 * 60_000);
  if (!rl.ok) return { ok: true as const };

  const parsed = z.string().email().safeParse(input.email?.trim().toLowerCase());
  if (!parsed.success) return { ok: true as const };
  const email = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, hashedPassword: true },
  });

  if (user?.hashedPassword) {
    // Burn any outstanding tokens so only the newest link works.
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });
    const raw = randomBytes(32).toString("base64url");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });
    const url = `${publicBase()}/reset-password?token=${raw}`;
    const firstName = user.name?.trim().split(/\s+/)[0] ?? "there";
    await sendEmail({
      to: email,
      subject: "Reset your TripCraft password",
      text: `Hi ${firstName},\n\nReset your TripCraft password using this link (valid for 1 hour):\n${url}\n\nIf you didn't request this, you can safely ignore this email.`,
      html: brandedEmail({
        heading: "Reset your password",
        bodyHtml: `<p>Hi ${firstName},</p><p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p><p style="color:#9A9A9A;font-size:12px">If you didn't request this, you can safely ignore this email — your password won't change.</p>`,
        cta: { label: "Reset password", url },
      }),
    });
    // Dev visibility when no email provider is configured.
    console.log(`[password-reset] link for ${email}: ${url}`);
  }

  return { ok: true as const };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Use at least 8 characters"),
});

/** Consume a reset token and set the new password. Single-use. */
export async function resetPasswordAction(input: z.input<typeof resetSchema>) {
  const data = resetSchema.parse(input);
  const tokenHash = hashToken(data.token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, usedAt: true, expiresAt: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return {
      ok: false as const,
      error: "This reset link is invalid or has expired. Request a new one.",
    };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate any other live tokens for this user.
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
    }),
  ]);

  return { ok: true as const };
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
    redirectTo: "/dashboard",
  });
  return { ok: true as const };
}
