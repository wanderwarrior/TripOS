import "server-only";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Object storage for user uploads (logos, proposal cover images, hero video).
//
// Production: Cloudflare R2 (S3-compatible). Set the R2_* env vars below and
// uploads stream to the bucket; the returned URL is the bucket's public base +
// key. R2 has zero egress fees, so serving these assets is free.
//
// Local dev: if R2 isn't configured, we fall back to writing under
// public/uploads so `npm run dev` works with no cloud credentials. That path
// is NOT durable on serverless hosts (the disk is read-only / ephemeral) — it
// exists purely for local convenience.

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;
// Public base URL for the bucket — either the r2.dev dev domain or a custom
// domain bound to the bucket, e.g. "https://cdn.saffronsea.travel". No trailing slash.
const R2_PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

export const isR2Configured =
  !!R2_ACCOUNT_ID &&
  !!R2_ACCESS_KEY_ID &&
  !!R2_SECRET_ACCESS_KEY &&
  !!R2_BUCKET &&
  !!R2_PUBLIC_BASE_URL;

let _client: S3Client | null = null;
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

/**
 * Persist an uploaded file and return a public URL for it.
 *
 * @param buffer       file bytes
 * @param ext          extension without the dot, e.g. "png" / "mp4"
 * @param contentType  MIME type, e.g. "image/png" — set on the object for R2
 * @param prefix       key prefix / folder, e.g. "uploads" or "videos"
 */
export async function saveUpload(
  buffer: Buffer,
  ext: string,
  contentType: string,
  prefix = "uploads"
): Promise<string> {
  const id = randomBytes(12).toString("hex");
  const key = `${prefix}/${id}.${ext}`;

  if (isR2Configured) {
    await client().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        // Long cache — keys are content-addressed (random id), never reused.
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return `${R2_PUBLIC_BASE_URL}/${key}`;
  }

  // Local dev fallback — write under public/ and return a site-relative path.
  const dir = join(process.cwd(), "public", prefix);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${id}.${ext}`), buffer);
  return `/${prefix}/${id}.${ext}`;
}

/**
 * Create a short-lived presigned URL the browser can PUT a file to directly,
 * bypassing the serverless request-body limit (~4.5 MB on Vercel). Use for
 * large uploads like the hero video. Requires R2 to be configured — callers
 * should fall back to {@link saveUpload} (multipart through the API) when it
 * isn't (i.e. local dev). The bucket needs a CORS policy allowing PUT from the
 * site origin for the browser request to succeed.
 *
 * @returns `uploadUrl` to PUT the bytes to, and the final `publicUrl` to store.
 */
export async function presignUpload(
  ext: string,
  contentType: string,
  prefix = "uploads"
): Promise<{ uploadUrl: string; publicUrl: string }> {
  if (!isR2Configured) {
    throw new Error("R2 is not configured");
  }
  const id = randomBytes(12).toString("hex");
  const key = `${prefix}/${id}.${ext}`;
  // ContentType is part of the signature, so the browser PUT must send a
  // matching Content-Type header (it does — set from the File's type).
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client(), cmd, { expiresIn: 600 });
  return { uploadUrl, publicUrl: `${R2_PUBLIC_BASE_URL}/${key}` };
}
