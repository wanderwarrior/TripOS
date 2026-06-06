"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitTrialPhoneAction, signOutAction } from "@/server/actions/auth";

export function PendingApproval({
  status,
  hasPhone,
  demoVideoUrl = null,
  demoPosterUrl = null,
  supportWhatsapp = null,
}: {
  status: "PENDING" | "REJECTED";
  hasPhone: boolean;
  demoVideoUrl?: string | null;
  demoPosterUrl?: string | null;
  supportWhatsapp?: string | null;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isPending, start] = useTransition();
  const [checking, startCheck] = useTransition();

  // While pending, quietly re-check approval so the page advances on its own
  // the moment the admin approves (the server component redirects to /dashboard
  // once status flips to APPROVED).
  useEffect(() => {
    if (status !== "PENDING") return;
    const t = setInterval(() => router.refresh(), 20000);
    return () => clearInterval(t);
  }, [status, router]);

  if (status === "REJECTED") {
    return (
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bad/10 text-bad">
          <XCircle className="h-6 w-6" />
        </span>
        <h1 className="font-display text-2xl text-ink">
          Trial request not approved
        </h1>
        <p className="mt-2 text-sm text-muted">
          We weren&apos;t able to approve this trial. If you think this is a
          mistake, reach us at{" "}
          <a href="mailto:hello@tripcraft.app" className="text-ink underline">
            hello@tripcraft.app
          </a>
          .
        </p>
        <SignOutLink />
      </div>
    );
  }

  // PENDING — collect a phone first if we don't have one (Google sign-ups).
  if (!hasPhone) {
    return (
      <div>
        <div className="text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
            <Clock className="h-6 w-6" />
          </span>
          <h1 className="font-display text-2xl text-ink">
            One last step to request your trial
          </h1>
          <p className="mt-2 text-sm text-muted">
            Add a phone number so we can verify your agency and set you up. We
            review every request before granting access.
          </p>
        </div>
        <div className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pending-phone">Phone (WhatsApp)</Label>
            <Input
              id="pending-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 …"
              autoFocus
            />
          </div>
          <Button
            className="w-full"
            disabled={isPending || phone.trim().length < 7}
            onClick={() =>
              start(async () => {
                const res = await submitTrialPhoneAction({ phone });
                if (res.ok) {
                  toast.success("Request submitted — we'll review it shortly");
                  router.refresh();
                } else {
                  toast.error(res.error);
                }
              })
            }
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit trial request
          </Button>
        </div>
        <SignOutLink />
      </div>
    );
  }

  return (
    <div className="text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
        <Clock className="h-6 w-6" />
      </span>
      <h1 className="font-display text-2xl text-ink">
        Your trial is under review
      </h1>
      <p className="mt-2 text-sm text-muted">
        Thanks for requesting tripOS! We approve new agencies by hand —{" "}
        <strong className="text-ink">usually within a few hours</strong>. This
        page unlocks automatically the moment you&apos;re approved.
      </p>

      {demoVideoUrl ? (
        <div className="mt-5 overflow-hidden rounded-lg border border-line bg-inkwash">
          <p className="px-3 pt-2.5 text-left text-[11px] uppercase tracking-[0.18em] text-[var(--on-dark)]/60">
            While you wait — see tripOS in action
          </p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={demoVideoUrl}
            poster={demoPosterUrl ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="mt-2 aspect-video w-full"
          />
        </div>
      ) : null}

      <Button
        variant="outline"
        className="mt-5"
        disabled={checking}
        onClick={() => startCheck(() => router.refresh())}
      >
        {checking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Check status
      </Button>

      <ContactLine supportWhatsapp={supportWhatsapp} />
      <SignOutLink />
    </div>
  );
}

function ContactLine({ supportWhatsapp }: { supportWhatsapp: string | null }) {
  return (
    <p className="mt-4 text-xs text-muted">
      Need it sooner?{" "}
      {supportWhatsapp ? (
        <a
          href={`https://wa.me/${supportWhatsapp.replace(/[^\d]/g, "")}`}
          target="_blank"
          rel="noopener"
          className="text-ink underline underline-offset-2"
        >
          Message us on WhatsApp
        </a>
      ) : (
        <a
          href="mailto:hello@tripcraft.app"
          className="text-ink underline underline-offset-2"
        >
          Email us
        </a>
      )}
    </p>
  );
}

function SignOutLink() {
  return (
    <form action={signOutAction} className="mt-6">
      <button
        type="submit"
        className="text-xs text-muted hover:text-ink transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
