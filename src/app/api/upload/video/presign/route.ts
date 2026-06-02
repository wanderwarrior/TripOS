import { NextRequest, NextResponse } from "next/server";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { requirePlatformAdmin } from "@/lib/platform-admin";
import { isR2Configured, presignUpload } from "@/lib/r2";

export const runtime = "nodejs";

// Direct-to-R2 uploads bypass the serverless body limit, so we can allow much
// larger hero videos here than the multipart fallback route.
const MAX_BYTES = 200 * 1024 * 1024;
const ALLOWED = new Map<string, string>([
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
]);

/**
 * Hands the browser a short-lived presigned URL to PUT a hero video straight
 * to R2 (bypasses Vercel's ~4.5 MB request cap). Platform-owner only. Returns
 * 501 when R2 isn't configured so the client can fall back to the multipart
 * route (local dev).
 */
export async function POST(req: NextRequest) {
  await requirePlatformAdmin();

  const rl = rateLimit(
    `presign-video:${clientIpFrom(req.headers)}`,
    10,
    300_000
  );
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${rl.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  if (!isR2Configured) {
    return NextResponse.json(
      { error: "Direct upload unavailable" },
      { status: 501 }
    );
  }

  let body: { contentType?: string; size?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ext = ALLOWED.get(body.contentType ?? "");
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported format — use an MP4 or WebM video" },
      { status: 400 }
    );
  }
  if (typeof body.size === "number" && body.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 200 MB)" },
      { status: 400 }
    );
  }

  try {
    const { uploadUrl, publicUrl } = await presignUpload(
      ext,
      body.contentType as string,
      "videos"
    );
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error("[upload/video/presign] failed:", err);
    return NextResponse.json({ error: "Could not start upload" }, { status: 500 });
  }
}
