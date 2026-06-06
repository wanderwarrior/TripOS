"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Phone, X, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  approveAgencyAction,
  rejectAgencyAction,
} from "@/server/actions/platform";
import { formatDate } from "@/lib/utils";

type Request = {
  id: string;
  name: string;
  slug: string;
  requestPhone: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  createdAt: string;
};

export function TrialRequests({ requests }: { requests: Request[] }) {
  if (requests.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="tc-sec-head flex items-center gap-2">
        <Clock className="h-[15px] w-[15px] text-gold-deep" />
        <h2>Trial requests</h2>
        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-inkwash">
          {requests.length}
        </span>
      </div>
      <div className="rounded-lg border border-[var(--gold-line)] bg-gold-soft/40 overflow-hidden">
        <ul className="divide-y divide-line">
          {requests.map((r) => (
            <RequestRow key={r.id} r={r} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function RequestRow({ r }: { r: Request }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(
    fn: () => Promise<{ ok: boolean; error?: string }>,
    ok: string
  ) {
    start(async () => {
      try {
        const res = await fn();
        if (res.ok) {
          toast.success(ok);
          router.refresh();
        } else {
          toast.error(res.error || "Action failed");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 bg-paper">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="t-strong truncate">{r.name}</span>
          <span className="t-mut font-mono">/{r.slug}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
          {r.ownerEmail ? <span>{r.ownerEmail}</span> : null}
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {r.requestPhone?.trim() || "no phone yet"}
          </span>
          <span className="font-mono">{formatDate(r.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(() => approveAgencyAction(r.id), `Approved ${r.name}`)
          }
          className="inline-flex items-center gap-1.5 rounded-[8px] bg-inkwash px-3 py-1.5 text-xs font-medium text-[var(--on-dark)] hover:bg-inkwash/90 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          Approve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm(`Reject ${r.name}'s trial request?`)) {
              run(() => rejectAgencyAction(r.id), `Rejected ${r.name}`);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-3 py-1.5 text-xs font-medium text-muted hover:text-bad hover:border-bad/40 disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" />
          Reject
        </button>
      </div>
    </li>
  );
}
