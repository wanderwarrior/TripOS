"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Mark, Wordmark } from "./mark";

// useLayoutEffect on the client (runs before the browser paints), useEffect on
// the server (where layout effects don't run and would warn). Lets us dismiss
// the splash before paint on repeat views without a flash.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Brand intro / splash — the first-impression moment. Records fly in and
 * settle, the gold record lands and breathes, wordmark + tagline resolve, a
 * soft gold glow pops behind the lockup. Plays once per browser session
 * (sessionStorage gate) then fades out and unmounts.
 *
 * Pass `children` (the page) to gate them: they stay hidden while the splash
 * plays and fade in only once the whole animation has finished, so the intro
 * runs to completion against an empty stage. With no children it's a pure
 * overlay (legacy usage). Set `once={false}` to replay on every mount.
 */
export function BrandIntro({
  tagline = "The operating system for travel",
  once = true,
  hold = 2200,
  children,
}: {
  tagline?: string;
  once?: boolean;
  hold?: number;
  children?: React.ReactNode;
}) {
  // Plays from the first paint (incl. server render) so the splash covers the
  // screen immediately — starting hidden would let the page flash first.
  const [playing, setPlaying] = useState(true);
  const [fading, setFading] = useState(false);
  const decided = useRef(false);

  // Before paint: if the intro already played this session, skip it
  // synchronously so repeat views go straight to content with no splash flash.
  // Ref-guarded so StrictMode's double-invoke (dev) can't see its own write and
  // wrongly skip the splash on a genuine first view.
  useIsoLayoutEffect(() => {
    if (decided.current) return;
    decided.current = true;
    if (once) {
      try {
        if (sessionStorage.getItem("tripos:intro") === "1") {
          setPlaying(false);
          return;
        }
        sessionStorage.setItem("tripos:intro", "1");
      } catch {
        // sessionStorage unavailable — still play it.
      }
    }
  }, [once]);

  // Fade the splash at `hold`, then finish 600ms later (matches the opacity
  // transition) — only then does the gated content reveal.
  useEffect(() => {
    if (!playing) return;
    const fadeId = setTimeout(() => setFading(true), hold);
    const doneId = setTimeout(() => setPlaying(false), hold + 600);
    return () => {
      clearTimeout(fadeId);
      clearTimeout(doneId);
    };
  }, [playing, hold]);

  const splash = playing ? (
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
  ) : null;

  // Pure overlay (no content to gate).
  if (children === undefined) return splash;

  // Gate the content: hidden while the splash plays, fades in once it finishes.
  return (
    <>
      <div
        style={{
          opacity: playing ? 0 : 1,
          transition: "opacity 500ms ease",
          pointerEvents: playing ? "none" : undefined,
        }}
        aria-hidden={playing || undefined}
      >
        {children}
      </div>
      {splash}
    </>
  );
}
