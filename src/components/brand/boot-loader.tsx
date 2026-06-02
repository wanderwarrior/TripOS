"use client";

import { useEffect, useRef, useState } from "react";
import { Mark, Wordmark } from "./mark";

const STEPS = ["Booting…", "Syncing records…", "Almost there…"];

/**
 * App boot / first-load overlay. Loops the gold "live" sweep down the C·Stack
 * while `ready` is false, then resolves into the static logo and fades out.
 *
 * Controlled by `ready`: keep it false while your boot/data promise is pending,
 * flip to true when it settles. `minDuration` guarantees the loop reads as
 * intentional rather than a flash. Unmounts itself after the resolve.
 */
export function BootLoader({
  ready = true,
  minDuration = 1200,
  onFinish,
}: {
  ready?: boolean;
  minDuration?: number;
  onFinish?: () => void;
}) {
  const [phase, setPhase] = useState<"loading" | "done" | "gone">("loading");
  const [step, setStep] = useState(0);
  const mountedAt = useRef(Date.now());

  // cycle the mono status line while loading
  useEffect(() => {
    if (phase !== "loading") return;
    const id = setInterval(
      () => setStep((s) => (s + 1) % STEPS.length),
      900
    );
    return () => clearInterval(id);
  }, [phase]);

  // resolve once ready + min duration elapsed
  useEffect(() => {
    if (phase !== "loading" || !ready) return;
    const wait = Math.max(0, minDuration - (Date.now() - mountedAt.current));
    const id = setTimeout(() => setPhase("done"), wait);
    return () => clearTimeout(id);
  }, [ready, minDuration, phase]);

  // fade out shortly after resolving
  useEffect(() => {
    if (phase !== "done") return;
    const id = setTimeout(() => {
      setPhase("gone");
      onFinish?.();
    }, 1100);
    return () => clearTimeout(id);
  }, [phase, onFinish]);

  if (phase === "gone") return null;

  return (
    <div
      className="brand-dark fixed inset-0 z-[100] flex items-center justify-center bg-inkwash transition-opacity duration-500"
      style={{ opacity: phase === "done" ? 0 : 1 }}
      aria-busy={phase === "loading"}
      role="status"
    >
      <div className={`brand-loader ${phase === "done" ? "done" : "loading"}`}>
        <div className="lockup">
          <Mark size={96} title="tripOS" />
          <Wordmark className="mt-1 text-[26px]" />
          <div className="bar">
            <i />
          </div>
          <div className="status">
            {phase === "done" ? "Ready" : STEPS[step]}
          </div>
        </div>
      </div>
    </div>
  );
}
