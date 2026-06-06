"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Phone, Mail, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  setDemoRequestStatusAction,
  deleteDemoRequestAction,
} from "@/server/actions/demo";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  agencyName: string | null;
  message: string | null;
  status: "NEW" | "CONTACTED" | "DONE";
  createdAt: string;
};

const TONE = {
  NEW: "info",
  CONTACTED: "warn",
  DONE: "success",
} as const;

export function DemoRequests({ requests }: { requests: Row[] }) {
  if (requests.length === 0) return null;
  const newCount = requests.filter((r) => r.status === "NEW").length;

  return (
    <section className="mb-8">
      <div className="tc-sec-head flex items-center gap-2">
        <Sparkles className="h-[15px] w-[15px] text-gold-deep" />
        <h2>Demo requests</h2>
        {newCount > 0 ? (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-inkwash">
            {newCount} new
          </span>
        ) : null}
      </div>
      <div className="rounded-lg border border-line bg-paper overflow-hidden shadow-soft">
        <ul className="divide-y divide-line">
          {requests.map((r) => (
            <DemoRow key={r.id} r={r} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function DemoRow({ r }: { r: Row }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) {
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
    <li
      className={`px-4 py-3.5 ${r.status === "DONE" ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="t-strong">{r.name}</span>
            {r.agencyName ? (
              <span className="t-mut">· {r.agencyName}</span>
            ) : null}
            <Badge variant={TONE[r.status]}>{r.status}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
            <a
              href={`mailto:${r.email}`}
              className="inline-flex items-center gap-1 hover:text-ink underline-offset-2 hover:underline"
            >
              <Mail className="h-3 w-3" />
              {r.email}
            </a>
            <a
              href={`https://wa.me/${r.phone.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 font-mono hover:text-ink underline-offset-2 hover:underline"
            >
              <Phone className="h-3 w-3" />
              {r.phone}
            </a>
            <span className="font-mono">{formatDate(r.createdAt)}</span>
          </div>
          {r.message ? (
            <p className="mt-1.5 text-sm text-ink/75 whitespace-pre-line max-w-prose">
              {r.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {r.status === "NEW" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () =>
                    setDemoRequestStatusAction({ id: r.id, status: "CONTACTED" }),
                  "Marked contacted"
                )
              }
              className="rounded-[8px] border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper-2 disabled:opacity-50"
            >
              Mark contacted
            </button>
          ) : null}
          {r.status !== "DONE" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () => setDemoRequestStatusAction({ id: r.id, status: "DONE" }),
                  "Marked done"
                )
              }
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-inkwash px-3 py-1.5 text-xs font-medium text-[var(--on-dark)] hover:bg-inkwash/90 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              Done
            </button>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete demo request from ${r.name}?`)) {
                run(() => deleteDemoRequestAction(r.id), "Deleted");
              }
            }}
            aria-label="Delete"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted hover:bg-paper-2 hover:text-bad disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
