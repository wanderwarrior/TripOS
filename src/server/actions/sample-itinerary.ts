"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { generateSampleItineraryAI, type SampleItinerary } from "@/lib/ai";

// Public, no-auth generator behind the landing hero. Rate-limited and capped so
// a prospect can feel the AI "wow" before signing up, without inviting abuse.
export async function generateSampleItineraryAction(
  promptText: string
): Promise<
  { ok: true; itinerary: SampleItinerary } | { ok: false; error: string }
> {
  const ip = clientIpFrom(headers());
  const rl = rateLimit(`sample:${ip}`, 5, 30 * 60_000);
  if (!rl.ok) {
    return {
      ok: false,
      error:
        "You've reached the demo limit for now — start a free trial to keep generating.",
    };
  }

  const parsed = z
    .string()
    .trim()
    .min(4, "Tell us a little more about your trip")
    .max(300)
    .safeParse(promptText);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please describe your trip",
    };
  }

  try {
    const itinerary = await generateSampleItineraryAI(parsed.data);
    return { ok: true, itinerary };
  } catch {
    return { ok: false, error: "Couldn't generate right now — please try again." };
  }
}
