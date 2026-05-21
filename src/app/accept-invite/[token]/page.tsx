import Link from "next/link";
import { AlertTriangle, Compass } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AcceptInviteForm } from "@/components/auth/accept-invite-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Accept invite · TripCraft" };

export default async function AcceptInvitePage({
  params,
}: {
  params: { token: string };
}) {
  const invite = await prisma.invite.findUnique({
    where: { token: params.token },
    include: { agency: { select: { name: true } }, invitedBy: { select: { name: true } } },
  });

  const invalid =
    !invite ||
    invite.status !== "PENDING" ||
    invite.expiresAt < new Date();

  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-10 justify-center w-full"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-ivory">
            <Compass className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl tracking-tight text-navy">
            TripCraft
          </span>
        </Link>

        <div className="rounded-3xl border border-line bg-white p-8 shadow-soft">
          {invalid ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-700 border border-red-100">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h1 className="font-display text-2xl text-navy">
                This invite isn't valid
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                It may have been revoked, already used, or expired. Ask the
                agency owner for a fresh link.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-block text-xs uppercase tracking-[0.18em] text-navy hover:underline"
              >
                Already have an account? Sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-[10px] uppercase tracking-[0.24em] text-sand-700">
                  You're invited
                </p>
                <h1 className="mt-2 font-display text-2xl text-navy">
                  Join {invite.agency.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {invite.invitedBy.name ?? "An owner"} added you as{" "}
                  <span className="text-navy font-medium">{invite.role}</span>.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Signing in as{" "}
                  <span className="text-navy">{invite.email}</span>
                </p>
              </div>
              <AcceptInviteForm token={params.token} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
