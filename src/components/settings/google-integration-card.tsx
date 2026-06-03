"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Mail, FolderOpen, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  disconnectGoogleAction,
  setGoogleFeatureAction,
} from "@/server/actions/integrations";
import { cn } from "@/lib/utils";

export type GoogleProps = {
  connected: boolean;
  email: string | null;
  scopesOutdated: boolean; // connected but missing a newly-required scope
  sendFromGmail: boolean;
  saveToDrive: boolean;
  configured: boolean; // server has GOOGLE_CLIENT_ID/SECRET
  canEncrypt: boolean;
};

// Maps the ?google=<status> flag the OAuth callback redirects with to a toast.
const STATUS_TOASTS: Record<string, { ok: boolean; msg: string }> = {
  connected: { ok: true, msg: "Google account connected" },
  denied: { ok: false, msg: "Google connection cancelled" },
  badstate: { ok: false, msg: "Connection expired — please try again" },
  norefresh: { ok: false, msg: "Couldn't get offline access — try again" },
  unconfigured: { ok: false, msg: "Google isn't configured on the server" },
  forbidden: { ok: false, msg: "Only the agency owner can connect Google" },
  error: { ok: false, msg: "Google connection failed — please try again" },
};

export function GoogleIntegrationCard({ data }: { data: GoogleProps }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [sendFromGmail, setSendFromGmail] = useState(data.sendFromGmail);
  const [saveToDrive, setSaveToDrive] = useState(data.saveToDrive);

  // Surface the OAuth callback outcome once, then clean the URL.
  useEffect(() => {
    const status = params.get("google");
    if (!status) return;
    const t = STATUS_TOASTS[status];
    if (t) (t.ok ? toast.success : toast.error)(t.msg);
    router.replace("/settings/integrations");
  }, [params, router]);

  function toggle(which: "gmail" | "drive", next: boolean) {
    // Optimistic; revert on failure.
    if (which === "gmail") setSendFromGmail(next);
    else setSaveToDrive(next);
    start(async () => {
      const res = await setGoogleFeatureAction(
        which === "gmail" ? { sendFromGmail: next } : { saveToDrive: next }
      );
      if (!res.ok) {
        toast.error(res.error);
        if (which === "gmail") setSendFromGmail(!next);
        else setSaveToDrive(!next);
      }
    });
  }

  function disconnect() {
    if (!confirm("Disconnect Google? Sending from Gmail and saving to Drive will stop.")) {
      return;
    }
    start(async () => {
      const res = await disconnectGoogleAction();
      if (res.ok) {
        toast.success("Google disconnected");
        router.refresh();
      } else {
        toast.error("Couldn't disconnect");
      }
    });
  }

  return (
    <section className="tc-card overflow-hidden">
      <div className="tc-card-head">
        <div className="ttl">
          <Mail />
          <h3>Google Workspace</h3>
        </div>
        <span className={cn("tc-badge", data.connected ? "tc-b-ok" : "tc-b-neutral")}>
          <span className="bdot" />
          {data.connected ? "Connected" : "Not connected"}
        </span>
      </div>

      <div className="p-[18px] space-y-5">
        <p className="text-sm text-muted">
          Connect your agency&apos;s Google account to email proposals from your
          own address and file every trip&apos;s documents into your Google
          Drive. We only request permission to{" "}
          <strong className="text-ink">send mail</strong> and to manage{" "}
          <strong className="text-ink">files this app creates</strong> — never
          to read your inbox or the rest of your Drive.
        </p>

        {!data.configured && (
          <div className="rounded-lg border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-[#9a4234]">
            Google sign-in isn&apos;t configured on this server yet. Set{" "}
            <code className="font-mono">GOOGLE_CLIENT_ID</code> and{" "}
            <code className="font-mono">GOOGLE_CLIENT_SECRET</code> to enable it.
          </div>
        )}

        {!data.connected ? (
          <Button asChild disabled={!data.configured || !data.canEncrypt}>
            <a href="/api/integrations/google/connect">
              <Mail className="h-4 w-4" />
              Connect Google account
            </a>
          </Button>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-[10px] border border-line bg-paper-2 px-4 py-3">
              <span className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-ok" />
                <span className="text-ink font-medium">{data.email}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnect}
                disabled={pending}
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unplug className="h-4 w-4" />
                )}
                Disconnect
              </Button>
            </div>

            {data.scopesOutdated && (
              <div className="rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                New permissions are available. Reconnect to enable the latest
                features.{" "}
                <a
                  className="font-medium underline"
                  href="/api/integrations/google/connect"
                >
                  Reconnect
                </a>
              </div>
            )}

            <FeatureToggle
              icon={<Mail className="h-4 w-4" />}
              label="Send proposals & vouchers from Gmail"
              hint="Outgoing mail comes from your address, replies land in your inbox."
              checked={sendFromGmail}
              onChange={(v) => toggle("gmail", v)}
            />
            <FeatureToggle
              icon={<FolderOpen className="h-4 w-4" />}
              label="Save documents to Google Drive"
              hint="A folder per trip, holding every proposal, voucher and invoice PDF."
              checked={saveToDrive}
              onChange={(v) => toggle("drive", v)}
            />
          </>
        )}
      </div>
    </section>
  );
}

function FeatureToggle({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-[10px] border border-line bg-paper-2 px-4 py-3 text-left"
    >
      <span className="flex items-start gap-2.5">
        <span className="mt-0.5 text-muted">{icon}</span>
        <span>
          <span className="block text-sm font-medium text-ink">{label}</span>
          <span className="block text-xs text-muted mt-0.5">{hint}</span>
        </span>
      </span>
      <span
        className={cn(
          "relative h-[22px] w-[38px] flex-none rounded-full transition-colors",
          checked ? "bg-inkwash" : "bg-line"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all",
            checked ? "right-0.5" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}
