"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { getConsent, setConsent } from "@/lib/consent";
import { pageview } from "@/lib/analytics";

// Lightweight consent banner. Until the visitor chooses, analytics stay off.
// Choosing "Accept" enables analytics and records the current pageview.
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(getConsent() === null);
  }, []);

  if (!show) return null;

  function choose(value: "granted" | "denied") {
    setConsent(value);
    setShow(false);
    if (value === "granted") pageview();
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 print:hidden">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-xl border border-line bg-paper p-4 shadow-pop sm:flex-row sm:items-center sm:gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft border border-[var(--gold-line)] text-gold-deep">
          <Cookie className="h-4.5 w-4.5" />
        </span>
        <p className="flex-1 text-sm text-ink/75">
          We use cookies to understand how the product is used and improve it.
          You can decline without affecting core functionality. See our{" "}
          <Link href="/legal/privacy" className="text-ink underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-[8px] border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line-2"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-[8px] bg-inkwash px-4 py-2 text-sm font-medium text-[var(--on-dark)] transition-colors hover:bg-inkwash/90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
