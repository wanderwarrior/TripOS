"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { brandedEmail, sendEmail } from "@/lib/email";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { notifyAdmin } from "@/lib/notify";
import { requirePlatformAdmin } from "@/lib/platform-admin";

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  agency: z.string().trim().max(160).optional().nullable(),
  message: z.string().trim().min(10, "Tell us a little more").max(4000),
  // Honeypot — bots fill hidden fields; humans never see it.
  company: z.string().max(0).optional().nullable(),
});

const INBOX = process.env.CONTACT_INBOX || "hello@tripcraft.app";

export async function submitContactAction(
  input: z.infer<typeof schema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Throttle: 5 submissions per 10 minutes per IP.
  const ip = clientIpFrom(headers());
  const rl = rateLimit(`contact:${ip}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Too many messages. Please try again in ${rl.retryAfter}s.`,
    };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form",
    };
  }
  const { name, email, agency, message, company } = parsed.data;

  // Silently succeed for honeypot hits so bots don't learn anything.
  if (company) return { ok: true };

  // Store it so nothing is lost even if email isn't configured — shows up in
  // the owner console alongside demo requests.
  await prisma.contactMessage.create({
    data: { name, email, agency: agency?.trim() || null, message },
  });

  // Instant ping (webhook — works without email).
  await notifyAdmin(
    `✉️ New contact enquiry\n${name}${agency ? ` · ${agency}` : ""}\n${email}\n\n${message}`
  );

  // Notify the team.
  await sendEmail({
    to: INBOX,
    subject: `New enquiry from ${name}${agency ? ` (${agency})` : ""}`,
    html: brandedEmail({
      heading: "New website enquiry",
      bodyHtml: `<p><strong>${name}</strong> &lt;${email}&gt;${
        agency ? ` · ${agency}` : ""
      }</p><p style="white-space:pre-wrap">${message.replace(/</g, "&lt;")}</p>`,
    }),
    text: `New enquiry from ${name} <${email}>${
      agency ? ` (${agency})` : ""
    }\n\n${message}`,
  });

  // Acknowledge the sender (best-effort).
  await sendEmail({
    to: email,
    subject: "We've got your message — tripOS",
    html: brandedEmail({
      heading: `Thanks, ${name.split(/\s+/)[0]}!`,
      bodyHtml:
        "<p>We've received your message and a member of our team will get back to you shortly.</p><p>In the meantime, you're welcome to start a free trial — no card required.</p>",
      cta: {
        label: "Start free trial",
        url: `${(process.env.NEXT_PUBLIC_APP_URL || "https://tripcraft.app").replace(/\/$/, "")}/signup`,
      },
    }),
    text: "Thanks for reaching out — we'll get back to you shortly.",
  });

  return { ok: true };
}

/** Mark a contact enquiry handled / reopened (platform admin only). */
export async function setContactHandledAction(input: {
  id: string;
  handled: boolean;
}) {
  await requirePlatformAdmin();
  await prisma.contactMessage.update({
    where: { id: input.id },
    data: { handled: input.handled },
  });
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Delete a contact enquiry (platform admin only). */
export async function deleteContactMessageAction(id: string) {
  await requirePlatformAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin");
  return { ok: true as const };
}
