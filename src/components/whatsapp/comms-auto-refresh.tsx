"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

// Quietly re-fetches the communications page on an interval so delivery-
// status pills and freshly-arrived inbound replies appear without a manual
// refresh. Pauses while the tab is hidden to avoid pointless work.
export function CommsAutoRefresh({ intervalMs = 20_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!live) return;
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const t = setInterval(tick, intervalMs);
    return () => clearInterval(t);
  }, [router, intervalMs, live]);

  return (
    <button
      type="button"
      onClick={() => setLive((v) => !v)}
      title={live ? "Live updates on — click to pause" : "Paused — click to resume"}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-navy"
    >
      <RefreshCw
        className={"h-3 w-3 " + (live ? "text-emerald-600" : "text-muted-foreground")}
      />
      {live ? "Live" : "Paused"}
    </button>
  );
}
