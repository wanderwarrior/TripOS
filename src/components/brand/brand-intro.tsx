"use client";

import { useEffect, useState } from "react";
import { Mark, Wordmark } from "./mark";

/**
 * Brand intro / splash — the first-impression moment. Records fly in and
 * settle, the gold record lands and breathes, wordmark + tagline resolve, a
 * soft gold glow pops behind the lockup. Plays once per browser session
 * (sessionStorage gate) then fades out and unmounts.
 *
 * Mount near the root of an entry surface (login, dashboard). Set
 * `once={false}` to replay on every mount (useful while iterating).
 */
export function BrandIntro({
  tagline = "The operating system for travel",
  once = true,
  hold = 2200,
}: {
  tagline?: string;
  once?: boolean;
  hold?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  // Decide whether to show. Kept separate from the dismiss timers so the
  // once-per-session guard can early-return without ever skipping the
  // teardown — under React StrictMode (dev) this effect runs twice, and the
  // second run hits the guard; the dismiss effect below keys on `visible`, so
  // the splash always fades out regardless.
  useEffect(() => {
    if (once && typeof window !== "undefined") {
      try {
        if (sessionStorage.getItem("tripos:intro") === "1") return;
        sessionStorage.setItem("tripos:intro", "1");
      } catch {
        // sessionStorage unavailable — still show it.
      }
    }
    setVisible(true);
  }, [once]);

  // Always tear down once shown: fade at `hold`, unmount 600ms later.
  useEffect(() => {
    if (!visible) return;
    const fadeId = setTimeout(() => setFading(true), hold);
    const goneId = setTimeout(() => setVisible(false), hold + 600);
    return () => {
      clearTimeout(fadeId);
      clearTimeout(goneId);
    };
  }, [visible, hold]);

  if (!visible) return null;

  return (
    <div
      className="brand-dark fixed inset-0 z-[110] flex items-center justify-center bg-inkwash transition-opacity"
      style={{ opacity: fading ? 0 : 1, transitionDuration: "600ms" }}
      aria-hidden
    >
      <div className="brand-intro run relative flex items-center justify-center">
        <div className="glow" />
        <div className="lockup">
          <Mark size={108} title="tripOS" />
          <Wordmark className="mt-1 text-[30px]" />
          <span className="tag mt-2 text-[11px] uppercase tracking-[0.26em] text-[color:var(--on-dark-mut)]">
            {tagline}
          </span>
        </div>
      </div>
    </div>
  );
}
