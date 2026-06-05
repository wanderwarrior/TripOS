import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/brand/mark";
import { prisma } from "@/lib/prisma";
import { AcceptInviteForm } from "@/components/auth/accept-invite-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Accept invite · tripOS" };

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
    <main className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full mb-10 text-ink"
          aria-label="tripOS home"
        >
          <Logo size={34} wordClassName="text-2xl" />
        </Link>

        <div className="rounded-lg border border-line bg-paper p-8 shadow-soft">
          {invalid ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-bad-soft text-bad border border-bad/20">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h1 className="font-display text-2xl text-ink">
                This invite isn't valid
              </h1>
              <p className="mt-2 text-sm text-muted">
                It may have been revoked, already used, or expired. Ask the
                agency owner for a fresh link.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-block text-xs uppercase tracking-[0.18em] text-ink hover:underline"
              >
                Already have an account? Sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="tc-eyebrow gold">You're invited</p>
                <h1 className="mt-2 font-display text-2xl text-ink">
                  Join {invite.agency.name}
                </h1>
                <p className="mt-1 text-sm text-muted">
                  {invite.invitedBy.name ?? "An owner"} added you as{" "}
                  <span className="text-ink font-medium">{invite.role}</span>.
                </p>
                <p className="mt-3 text-xs text-muted">
                  Signing in as{" "}
                  <span className="text-ink">{invite.email}</span>
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
