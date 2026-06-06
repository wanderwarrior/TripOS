"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PlanTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-admin";
import { getOrCreateSubscription } from "@/server/services/subscription";
import { HERO_POSTER_KEY, HERO_VIDEO_KEY } from "@/server/services/platform";
import { brandedEmail, sendEmail } from "@/lib/email";

const DAY_MS = 24 * 60 * 60 * 1000;

// Accept an http(s) URL or a site-relative path (e.g. an /uploads/... file).
const mediaUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || /^(https?:\/\/|\/)/.test(v), {
    message: "Enter a full https:// URL or a path starting with /",
  });

const heroMediaSchema = z.object({
  videoUrl: mediaUrl,
  posterUrl: mediaUrl,
});

/**
 * Set (or clear) the public landing-page hero video + poster. Stored as
 * platform settings, not against any agency. Empty string clears a value and
 * the hero falls back to its bundled defaults. Revalidates the marketing home.
 */
export async function updateHeroMediaAction(input: {
  videoUrl: string;
  posterUrl: string;
}) {
  await requirePlatformAdmin();
  const { videoUrl, posterUrl } = heroMediaSchema.parse(input);

  for (const [key, value] of [
    [HERO_VIDEO_KEY, videoUrl],
    [HERO_POSTER_KEY, posterUrl],
  ] as const) {
    await prisma.platformSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true as const };
}

/**
 * Approve a pending trial request — the agency can use the app immediately
 * (the requireUser gate reads status live). Best-effort welcome email.
 */
export async function approveAgencyAction(agencyId: string) {
  await requirePlatformAdmin();
  const agency = await prisma.agency.update({
    where: { id: agencyId },
    data: { status: "APPROVED", approvedAt: new Date() },
    select: {
      name: true,
      memberships: {
        where: { role: "OWNER" },
        take: 1,
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  const owner = agency.memberships[0]?.user;
  if (owner?.email) {
    const base = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.AUTH_URL ||
      "https://thetripos.com"
    ).replace(/\/+$/, "");
    const firstName = owner.name?.trim().split(/\s+/)[0] ?? "there";
    await sendEmail({
      to: owner.email,
      subject: "Your tripOS trial is approved 🎉",
      text: `Hi ${firstName},\n\nYour tripOS trial is approved — you now have full access. Sign in and generate your first itinerary:\n${base}/login\n\nWelcome aboard!`,
      html: brandedEmail({
        heading: "Your trial is approved 🎉",
        bodyHtml: `<p>Hi ${firstName},</p><p>You now have full access to tripOS. Sign in and generate your first AI itinerary, send a branded proposal, and get your agency running.</p>`,
        cta: { label: "Open tripOS", url: `${base}/login` },
      }),
    }).catch(() => {});
  }

  revalidatePath("/admin");
  return { ok: true as const };
}

/** Reject a pending trial request (soft denial — they see a message). */
export async function rejectAgencyAction(agencyId: string) {
  await requirePlatformAdmin();
  await prisma.agency.update({
    where: { id: agencyId },
    data: { status: "REJECTED" },
  });
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Cancel an agency's tripOS subscription (immediate). */
export async function cancelAgencySubscriptionAction(agencyId: string) {
  await requirePlatformAdmin();
  await getOrCreateSubscription(agencyId);
  await prisma.subscription.update({
    where: { agencyId },
    data: { status: "CANCELLED", cancelAtPeriodEnd: false },
  });
  revalidatePath("/admin");
  return { ok: true as const };
}

const setPlanSchema = z.object({
  agencyId: z.string(),
  plan: z.enum(["TRIAL", "STARTER", "PRO"]),
});

/**
 * Manually set an agency's plan (comp / manual grant / reactivation). Paid
 * plans go ACTIVE with a 30-day period; TRIAL resets a 14-day trial.
 */
export async function setAgencyPlanAction(input: {
  agencyId: string;
  plan: PlanTier;
}) {
  const { agencyId, plan } = setPlanSchema.parse(input);
  await requirePlatformAdmin();
  await getOrCreateSubscription(agencyId);

  if (plan === "TRIAL") {
    await prisma.subscription.update({
      where: { agencyId },
      data: {
        plan: "TRIAL",
        status: "TRIALING",
        trialEndsAt: new Date(Date.now() + 14 * DAY_MS),
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });
  } else {
    await prisma.subscription.update({
      where: { agencyId },
      data: {
        plan,
        status: "ACTIVE",
        currentPeriodEnd: new Date(Date.now() + 30 * DAY_MS),
        cancelAtPeriodEnd: false,
      },
    });
  }
  revalidatePath("/admin");
  return { ok: true as const };
}

const extendSchema = z.object({
  agencyId: z.string(),
  days: z.coerce.number().int().min(1).max(365),
});

/** Extend (or restart) an agency's trial by N days from the later of now/end. */
export async function extendAgencyTrialAction(input: {
  agencyId: string;
  days: number;
}) {
  const { agencyId, days } = extendSchema.parse(input);
  await requirePlatformAdmin();
  const sub = await getOrCreateSubscription(agencyId);
  const base = Math.max(Date.now(), sub.trialEndsAt?.getTime() ?? 0);
  await prisma.subscription.update({
    where: { agencyId },
    data: {
      plan: "TRIAL",
      status: "TRIALING",
      trialEndsAt: new Date(base + days * DAY_MS),
    },
  });
  revalidatePath("/admin");
  return { ok: true as const };
}
