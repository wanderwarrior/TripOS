"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, X } from "lucide-react";
import { TRIAL_DAYS } from "@/lib/plans";
import { captureLeadAction } from "@/server/actions/lead";

const SEEN_KEY = "to_lead_capture_seen";

/**
 * Exit-intent / scroll-triggered email capture — a second chance to keep the
 * ~96% of visitors who leave without signing up. Honest by design: it offers
 * founding-list updates + early access (a real list), not a fabricated freebie.
 * Shows at most once per browser, never to signed-in visitors, and is fully
 * dismissible.
 */
export function LeadCapture() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const armedRef = useRef(false);
  const deepRef = useRef(false);

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY) === "1") return;

    const trigger = () => {
      if (armedRef.current) return;
      armedRef.current = true;
      localStorage.setItem(SEEN_KEY, "1");
      setOpen(true);
    };

    // Desktop: pointer leaves through the top of the viewport.
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };
    // Mobile: user has scrolled deep, then scrolls back up (intent to leave).
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const depth = (y + window.innerHeight) / document.body.scrollHeight;
      if (depth > 0.55) deepRef.current = true;
      if (deepRef.current && y < lastY - 40) trigger();
      lastY = y;
    };

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!open) return null;

  async function submit() {
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setError("Enter a valid email");
      return;
    }
    setError(null);
    setStatus("saving");
    const res = await captureLeadAction({ email: value, source: "exit-intent" });
    if (res.ok) setStatus("done");
    else {
      setStatus("error");
      setError(res.error);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--gold-line)] bg-inkwash p-7 text-center text-[var(--on-dark)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(200,169,106,0.2),transparent_65%)]" />
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 rounded-md p-1.5 text-[var(--on-dark)]/50 transition-colors hover:bg-white/10 hover:text-[var(--on-dark)]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          {status === "done" ? (
            <>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e3c98f]/15 text-[#e3c98f]">
                <Mail className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-2xl">You&apos;re on the list</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--on-dark)]/75">
                We&apos;ll send founding updates and early access. Want to skip
                the line?
              </p>
              <Link
                href="/signup"
                className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-[#e3c98f] px-6 py-3 text-sm font-semibold text-[#1a1205] transition-all hover:bg-[#ecd6a4]"
              >
                Start your free trial now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-line)] bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e3c98f]">
                Before you go
              </span>
              <h3 className="mt-4 font-display text-2xl leading-snug">
                Not ready to start today?
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--on-dark)]/75">
                Join the founding list — get early access, product updates, and
                first dibs on founding pricing before it closes.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="you@agency.com"
                  className="min-w-0 flex-1 rounded-[10px] border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[var(--gold-line)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={submit}
                  disabled={status === "saving"}
                  className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-[#e3c98f] px-4 py-2.5 text-sm font-semibold text-[#1a1205] transition-all hover:bg-[#ecd6a4] disabled:opacity-70"
                >
                  {status === "saving" ? "Saving…" : "Notify me"}
                </button>
              </div>
              {error ? (
                <p className="mt-2 text-xs text-[#f3c7c0]">{error}</p>
              ) : (
                <p className="mt-3 text-xs text-[var(--on-dark)]/50">
                  Or{" "}
                  <Link href="/signup" className="underline hover:text-white">
                    start the {TRIAL_DAYS}-day trial
                  </Link>{" "}
                  — no card required.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
