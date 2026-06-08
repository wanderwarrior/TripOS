"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { notifyAdmin } from "@/lib/notify";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(200),
  // Where the capture fired (e.g. "exit-intent"), for funnel attribution.
  source: z.string().trim().max(60).optional().nullable(),
  // Honeypot — bots fill hidden fields; humans never see it.
  company: z.string().max(0).optional().nullable(),
});

export type LeadInput = z.infer<typeof schema>;

/**
 * Lightweight email capture for visitors who aren't ready to start a trial —
 * the exit-intent / scroll prompt. Stored as a ContactMessage so it surfaces in
 * the owner console alongside other inbound leads (no new model needed) and
 * pings the admin webhook. Honest framing only: we promise founding updates +
 * early access, which is exactly what this list is for.
 */
export async function captureLeadAction(
  input: LeadInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = clientIpFrom(headers());
  const rl = rateLimit(`lead:${ip}`, 8, 10 * 60_000);
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
      error: parsed.error.issues[0]?.message ?? "Please enter a valid email",
    };
  }
  const { email, source, company } = parsed.data;

  // Honeypot hit — look successful so bots learn nothing.
  if (company) return { ok: true };

  await prisma.contactMessage.create({
    data: {
      name: "Founding waitlist",
      email,
      agency: null,
      message: `Lead capture${source ? ` · ${source}` : ""}`,
    },
  });

  await notifyAdmin(`✉️ New founding-list lead\n${email}${source ? ` · ${source}` : ""}`);

  return { ok: true };
}
