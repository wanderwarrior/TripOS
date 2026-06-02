import { NextRequest, NextResponse } from "next/server";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { requirePlatformAdmin } from "@/lib/platform-admin";
import { saveUpload } from "@/lib/r2";

export const runtime = "nodejs";

// Hero videos are heavier than images. Uploads stream to R2 (durable). NOTE:
// serverless hosts (e.g. Vercel) cap request bodies ~4.5 MB, so larger files
// must be uploaded straight to R2 via a presigned URL (future) or self-hosted;
// keep the hero loop well compressed.
const MAX_BYTES = 64 * 1024 * 1024;
const ALLOWED = new Map<string, string>([
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
]);

export async function POST(req: NextRequest) {
  // Uploading the public hero video is a platform-owner action only.
  await requirePlatformAdmin();

  // Throttle: 10 video uploads per 5 min per IP.
  const rl = rateLimit(`upload-video:${clientIpFrom(req.headers)}`, 10, 300_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${rl.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 64 MB)" },
        { status: 400 }
      );
    }
    const ext = ALLOWED.get(file.type);
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported format — use an MP4 or WebM video" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveUpload(buffer, ext, file.type, "videos");

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload/video] failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
