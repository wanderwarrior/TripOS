// Edge-safe Auth.js config slice. This is the ONLY auth config the
// middleware imports — it must not pull in bcrypt, Prisma, or any other
// Node-only / native module, because middleware runs on the Edge runtime.
//
// The full config ([src/lib/auth-config.ts](src/lib/auth-config.ts))
// spreads this and adds the Credentials provider + jwt/session callbacks
// that DO touch the database. That full config runs only in the Node.js
// runtime (route handler + server actions + server components).

import type { NextAuthConfig } from "next-auth";
import { SEO_LANDING_SLUGS } from "@/lib/seo-landings";

// All public SEO landing routes (/<slug>), derived from the content data so a
// new entry in seo-landings.ts is automatically public, routed (app/[slug]) and
// in the sitemap — no hand-syncing here. seo-landings.ts is edge-safe (its only
// type import from @prisma/client is erased at build).
const SEO_LANDING_PATHS = new Set(SEO_LANDING_SLUGS.map((s) => `/${s}`));

export const authEdgeConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  // Providers are added in the full config. Empty here so the Edge bundle
  // stays free of bcrypt.
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isPublic =
        // Public marketing surface. "/" branches in the page itself
        // (landing for guests, dashboard for authed users).
        path === "/" ||
        path.startsWith("/pricing") ||
        path.startsWith("/blog") ||
        path.startsWith("/compare") ||
        // Public SEO landing pages — auto-derived from lib/seo-landings.ts
        // (served by app/[slug]/page.tsx and the explicit folders).
        SEO_LANDING_PATHS.has(path) ||
        path.startsWith("/legal") ||
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/forgot-password") ||
        path.startsWith("/reset-password") ||
        path.startsWith("/accept-invite") ||
        path.startsWith("/share/") ||
        path.startsWith("/v/") ||
        path.startsWith("/api/share/") ||
        // Invoice + voucher PDFs are token-gated inside the route handler
        // (a `?token=` matching the resource's shareToken, or an owning
        // session). They must be reachable cookieless so Meta/customers can
        // fetch them — auth lives in the handler, not here.
        path.startsWith("/api/invoices/") ||
        path.startsWith("/api/vouchers/") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/webhooks") ||
        path.startsWith("/api/cron") ||
        path.startsWith("/_next") ||
        path === "/favicon.ico" ||
        // Public metadata / icon routes — browsers and crawlers fetch these
        // cookieless, so they must never redirect to /login.
        path === "/icon" ||
        path === "/apple-icon" ||
        path === "/manifest.webmanifest" ||
        path === "/sitemap.xml" ||
        path === "/robots.txt" ||
        path === "/llms.txt" ||
        path === "/opengraph-image" ||
        path.startsWith("/uploads/");
      if (isPublic) return true;
      return Boolean(auth?.user);
    },
  },
};
