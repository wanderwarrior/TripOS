import { NextRequest, NextResponse } from "next/server";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { saveUpload } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

export async function POST(req: NextRequest) {
  // Throttle: 30 uploads per minute per IP.
  const rl = rateLimit(`upload:${clientIpFrom(req.headers)}`, 30, 60_000);
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
        { error: "File too large (max 8 MB)" },
        { status: 400 }
      );
    }
    const ext = ALLOWED.get(file.type);
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported file type — use JPG, PNG, WEBP, GIF, or AVIF" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveUpload(buffer, ext, file.type, "uploads");

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload] failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
