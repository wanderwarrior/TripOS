"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NextAction } from "@/server/services/trip-workflow";

/**
 * Activate a trip workspace tab (#tab-plan / #tab-operations) and bring the
 * tab strip into view. Radix Tabs switches on `mousedown` / `focus`, NOT on a
 * synthetic `.click()`, so we dispatch a real mousedown the way Radix expects.
 */
export function activateTripTab(tab: "plan" | "operations") {
  const trigger = document.getElementById(`tab-${tab}`);
  if (!trigger) return;
  trigger.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 })
  );
  // Move focus too, so keyboard users land on the now-active tab.
  (trigger as HTMLElement).focus({ preventScroll: true });
  document
    .getElementById("trip-tabs")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Actionable "do this next" CTA for the trip lifecycle stepper. Turns the
 * computed nextAction into a real button: an `href` becomes a link; a
 * `scrollTarget` clicks the matching Radix tab (#tab-plan / #tab-operations)
 * and scrolls the tabs into view, so a first-time user is taken straight to
 * where the next step happens.
 */
export function WorkflowNextAction({ action }: { action: NextAction }) {
  if (!action) return null;

  const inner = (
    <>
      <span className="flex flex-col text-left">
        <span className="text-sm font-medium leading-tight">{action.label}</span>
        <span className="text-xs font-normal text-[var(--on-dark-mut)] leading-tight">
          {action.description}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0" />
    </>
  );

  const className =
    "inline-flex items-center gap-3 rounded-[8px] bg-inkwash text-[var(--on-dark)] px-4 py-2.5 text-left shadow-soft transition-colors hover:bg-inkwash/90";

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {inner}
      </Link>
    );
  }

  function jump() {
    const target = action!.scrollTarget;
    if (!target) return;
    activateTripTab(target);
  }

  return (
    <button type="button" onClick={jump} className={className}>
      {inner}
    </button>
  );
}
