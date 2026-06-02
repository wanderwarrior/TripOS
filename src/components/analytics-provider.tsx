"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pageview } from "@/lib/analytics";

// Fires a PostHog $pageview on every route change. No-ops unless a PostHog key
// is configured and the visitor has consented (handled inside pageview()).
export function AnalyticsProvider() {
  const pathname = usePathname();
  useEffect(() => {
    pageview();
  }, [pathname]);
  return null;
}
