"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { brandedEmail, sendEmail } from "@/lib/email";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { platformAdminEmails, requirePlatformAdmin } from "@/lib/platform-admin";

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  agencyName: z.string().trim().max(160).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  // Honeypot — bots fill hidden fields; humans never see it.
  company: z.string().max(0).optional().nullable(),
});

export type DemoRequestInput = z.infer<typeof schema>;

/**
 * Public "get a free demo" submission from the marketing site. Stored so the
 * platform admin sees every lead in the owner console (notification works even
 * without transactional email), plus a best-effort email ping.
 */
export async function createDemoRequestAction(
  input: DemoRequestInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = clientIpFrom(headers());
  const rl = rateLimit(`demo:${ip}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Too many requests. Please try again in ${rl.retryAfter}s.`,
    };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form",
    };
  }
  const { name, email, phone, agencyName, message, company } = parsed.data;

  // Honeypot hit — look successful so bots learn nothing.
  if (company) return { ok: true };

  await prisma.demoRequest.create({
    data: {
      name,
      email,
      phone,
      agencyName: agencyName?.trim() || null,
      message: message?.trim() || null,
    },
  });

  // Best-effort notify the platform admin (works once email is configured).
  const notify = platformAdminEmails()[0] || process.env.CONTACT_INBOX;
  if (notify) {
    await sendEmail({
      to: notify,
      subject: `New demo request from ${name}${agencyName ? ` (${agencyName})` : ""}`,
      html: brandedEmail({
        heading: "New free-demo request",
        bodyHtml: `<p><strong>${name}</strong></p><p>${email} · ${phone}${
          agencyName ? ` · ${agencyName}` : ""
        }</p>${
          message
            ? `<p style="white-space:pre-wrap">${message.replace(/</g, "&lt;")}</p>`
            : ""
        }`,
      }),
      text: `New demo request\n${name}\n${email} · ${phone}${
        agencyName ? ` · ${agencyName}` : ""
      }${message ? `\n\n${message}` : ""}`,
    }).catch(() => {});
  }

  return { ok: true };
}

const STATUSES = ["NEW", "CONTACTED", "DONE"] as const;

/** Move a demo request through its lifecycle (platform admin only). */
export async function setDemoRequestStatusAction(input: {
  id: string;
  status: (typeof STATUSES)[number];
}) {
  await requirePlatformAdmin();
  const status = z.enum(STATUSES).parse(input.status);
  await prisma.demoRequest.update({
    where: { id: input.id },
    data: { status },
  });
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Remove a demo request once it's dealt with (platform admin only). */
export async function deleteDemoRequestAction(id: string) {
  await requirePlatformAdmin();
  await prisma.demoRequest.delete({ where: { id } });
  revalidatePath("/admin");
  return { ok: true as const };
}
