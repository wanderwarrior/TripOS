"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  TripWorkflow,
  WorkflowStepKey,
} from "@/server/services/trip-workflow";
import {
  WorkflowNextAction,
  activateTripTab,
} from "@/components/operations/workflow-next-action";

// Where each checkpoint takes you. Most map to one of the two trip tabs;
// "contact" jumps to the linked customer's profile (a dedicated page).
const STEP_TAB: Record<WorkflowStepKey, "plan" | "operations" | null> = {
  contact: null,
  quote: "plan",
  book: "plan",
  assign: "operations",
  confirm: "operations",
  voucher: "operations",
  travel: "operations",
  complete: "operations",
};

export function TripWorkflowStepper({
  workflow,
  contactId,
}: {
  workflow: TripWorkflow;
  /** Linked CRM contact, so the "Contact" step can deep-link to their profile. */
  contactId?: string | null;
}) {
  const { steps, nextAction } = workflow;

  return (
    <section className="rounded-lg border border-line bg-paper p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="tc-eyebrow">Trip lifecycle</p>
          {nextAction ? (
            <p className="mt-1 text-xs text-muted">
              Here&apos;s what to do next on this trip. Tap any step to jump
              there.
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted">
              Every step is done — this trip is fully wrapped. 🎉
            </p>
          )}
        </div>
        <WorkflowNextAction action={nextAction} />
      </div>

      <ol className="mt-4 grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {steps.map((s, i) => {
          const inner = (
            <>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] font-mono text-[10px] font-semibold tabular-nums border",
                  s.done
                    ? "border-inkwash bg-inkwash text-gold"
                    : s.current
                      ? "border-gold bg-gold text-inkwash"
                      : "border-line bg-paper text-faint"
                )}
              >
                {s.done ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-[11px] font-medium leading-tight",
                    s.current
                      ? "text-gold-deep"
                      : s.done
                        ? "text-[#3c6b48]"
                        : "text-ink"
                  )}
                >
                  {s.label}
                </span>
                <span className="block text-[10px] text-muted leading-tight mt-0.5 truncate">
                  {s.hint}
                </span>
              </span>
            </>
          );

          const tile = cn(
            "relative flex w-full items-start gap-2 rounded-[10px] border px-2.5 py-2 text-left transition-all",
            "cursor-pointer hover:shadow-soft hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-line)]",
            s.current
              ? "border-[var(--gold-line)] bg-gold-soft/50 hover:bg-gold-soft"
              : s.done
                ? "border-ok/30 bg-ok-soft/50 hover:bg-ok-soft"
                : "border-line bg-paper-2 hover:bg-paper"
          );

          const tab = STEP_TAB[s.key];
          // "Contact" → the customer's profile page when one is linked.
          const isContactLink = s.key === "contact" && !!contactId;

          return (
            <li key={s.key} className="contents">
              {isContactLink ? (
                <Link
                  href={`/contacts/${contactId}`}
                  className={tile}
                  title="Open the linked contact's profile"
                >
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  className={tile}
                  onClick={() => {
                    if (tab) activateTripTab(tab);
                    else
                      document
                        .getElementById("trip-header")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  title={
                    tab
                      ? `Go to ${tab === "plan" ? "Plan & Quote" : "Operations"}`
                      : "Go to trip details"
                  }
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
