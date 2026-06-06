"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageSquare, Trash2, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  setContactHandledAction,
  deleteContactMessageAction,
} from "@/server/actions/contact";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  email: string;
  agency: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
};

export function ContactMessages({ messages }: { messages: Row[] }) {
  if (messages.length === 0) return null;
  const open = messages.filter((m) => !m.handled).length;

  return (
    <section className="mb-8">
      <div className="tc-sec-head flex items-center gap-2">
        <MessageSquare className="h-[15px] w-[15px] text-gold-deep" />
        <h2>Contact enquiries</h2>
        {open > 0 ? (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-inkwash">
            {open} new
          </span>
        ) : null}
      </div>
      <div className="rounded-lg border border-line bg-paper overflow-hidden shadow-soft">
        <ul className="divide-y divide-line">
          {messages.map((m) => (
            <MessageRow key={m.id} m={m} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function MessageRow({ m }: { m: Row }) {
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
    <li className={`px-4 py-3.5 ${m.handled ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="t-strong">{m.name}</span>
            {m.agency ? <span className="t-mut">· {m.agency}</span> : null}
            {m.handled ? <Badge variant="success">Handled</Badge> : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
            <a
              href={`mailto:${m.email}`}
              className="inline-flex items-center gap-1 hover:text-ink underline-offset-2 hover:underline"
            >
              <Mail className="h-3 w-3" />
              {m.email}
            </a>
            <span className="font-mono">{formatDate(m.createdAt)}</span>
          </div>
          <p className="mt-1.5 text-sm text-ink/75 whitespace-pre-line max-w-prose">
            {m.message}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {m.handled ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () => setContactHandledAction({ id: m.id, handled: false }),
                  "Reopened"
                )
              }
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper-2 disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reopen
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () => setContactHandledAction({ id: m.id, handled: true }),
                  "Marked handled"
                )
              }
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-inkwash px-3 py-1.5 text-xs font-medium text-[var(--on-dark)] hover:bg-inkwash/90 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              Handled
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete enquiry from ${m.name}?`)) {
                run(() => deleteContactMessageAction(m.id), "Deleted");
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
