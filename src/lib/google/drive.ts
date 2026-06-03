import "server-only";
import { prisma } from "@/lib/prisma";
import { getAccessToken } from "./connection";

// Google Drive helpers, scoped to drive.file — we can only see/manage files &
// folders this app created. Structure:
//
//   TripCraft/                        (root, cached on GoogleConnection)
//     <Destination> — <Contact> — <Mon YYYY>/   (per-trip, cached on Trip)
//       proposal-v2.pdf, voucher-... , passport-scan-... , etc.
//
// Folder ids are cached so we create each folder exactly once.

const DRIVE_FILES = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD =
  "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink";
const FOLDER_MIME = "application/vnd.google-apps.folder";

async function authHeader(agencyId: string): Promise<string> {
  return `Bearer ${await getAccessToken(agencyId)}`;
}

/** Create a folder and return its id. */
async function createFolder(
  agencyId: string,
  name: string,
  parentId: string | null
): Promise<string> {
  const res = await fetch(`${DRIVE_FILES}?fields=id`, {
    method: "POST",
    headers: {
      Authorization: await authHeader(agencyId),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      mimeType: FOLDER_MIME,
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`Drive folder create failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { id: string };
  return json.id;
}

/** True if a previously-cached file/folder id still exists and isn't trashed. */
async function stillExists(agencyId: string, fileId: string): Promise<boolean> {
  const res = await fetch(`${DRIVE_FILES}/${fileId}?fields=id,trashed`, {
    headers: { Authorization: await authHeader(agencyId) },
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { trashed?: boolean };
  return !json.trashed;
}

/** Get (creating + caching if needed) the agency's root "TripCraft" folder. */
export async function ensureRootFolder(agencyId: string): Promise<string> {
  const conn = await prisma.googleConnection.findUnique({
    where: { agencyId },
    select: { driveRootFolderId: true },
  });
  if (conn?.driveRootFolderId && (await stillExists(agencyId, conn.driveRootFolderId))) {
    return conn.driveRootFolderId;
  }
  const id = await createFolder(agencyId, "TripCraft", null);
  await prisma.googleConnection.update({
    where: { agencyId },
    data: { driveRootFolderId: id },
  });
  return id;
}

function tripFolderName(trip: {
  destination: string;
  startDate: Date | null;
  contact: { name: string } | null;
}): string {
  const when = trip.startDate
    ? trip.startDate.toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : null;
  return [trip.destination, trip.contact?.name, when]
    .filter(Boolean)
    .join(" — ");
}

/**
 * Get (creating + caching if needed) the Drive folder for a specific trip.
 * Caller must have already authorized the trip belongs to `agencyId`.
 */
export async function ensureTripFolder(
  agencyId: string,
  tripId: string
): Promise<string> {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, agencyId },
    select: {
      id: true,
      destination: true,
      startDate: true,
      driveFolderId: true,
      contact: { select: { name: true } },
    },
  });
  if (!trip) throw new Error("Trip not found for this agency");

  if (trip.driveFolderId && (await stillExists(agencyId, trip.driveFolderId))) {
    return trip.driveFolderId;
  }
  const root = await ensureRootFolder(agencyId);
  const id = await createFolder(agencyId, tripFolderName(trip), root);
  await prisma.trip.update({
    where: { id: trip.id },
    data: { driveFolderId: id },
  });
  return id;
}

export type DriveFile = { id: string; webViewLink: string };

/** Upload a binary file into a folder, returning its id + shareable link. */
export async function uploadToDrive(args: {
  agencyId: string;
  folderId: string;
  name: string;
  contentType: string;
  content: Buffer;
}): Promise<DriveFile> {
  const boundary = "tc_drive_upload_5a1e";
  const metadata = JSON.stringify({
    name: args.name,
    parents: [args.folderId],
  });
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
        `--${boundary}\r\nContent-Type: ${args.contentType}\r\n\r\n`,
      "utf8"
    ),
    args.content,
    Buffer.from(`\r\n--${boundary}--`, "utf8"),
  ]);

  const res = await fetch(DRIVE_UPLOAD, {
    method: "POST",
    headers: {
      Authorization: await authHeader(args.agencyId),
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Drive upload failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as DriveFile;
}

/**
 * Grant a person access to a folder (default: read-only). Used for sharing a
 * trip folder with the client or a co-agent.
 */
export async function shareFolder(args: {
  agencyId: string;
  folderId: string;
  email: string;
  role?: "reader" | "writer";
}): Promise<void> {
  const res = await fetch(
    `${DRIVE_FILES}/${args.folderId}/permissions?sendNotificationEmail=true`,
    {
      method: "POST",
      headers: {
        Authorization: await authHeader(args.agencyId),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "user",
        role: args.role ?? "reader",
        emailAddress: args.email,
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Drive share failed: ${res.status} ${await res.text()}`);
  }
}
